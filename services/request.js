'use strict';

// GLOBAL
const request = require('request'); // make http calls simply (support https and follows redirects)
const cheerio = require('cheerio'); // create a DOM object with html code, in order to parse
const md5 = require('md5'); // used to calculate checksums

// LOCAL
const ParserService = require('./parser');
const Database = require('./database');
const Logger = require('./logger');

let RequestService = function(){};

/**
 * Main method used to find a route config matching a request for player section (subrouting)
 * @param  {object}  req        express req object, contains the request
 * @param  {object}  routes     configuration file containing subroutes
 * @return {object}             route configuration matching the request
 */
RequestService.findPlayerRouteConfig = function(req, routes) {
    // load correct routes config depending on user request
    let routeConfig = {};

    // default route
    if (!req.params.request) {
        Logger.verbose('RequestService - "request" param not found, return default route for player route');
        routeConfig = routes['/'];
    } else {
        // search corresponding route with regexp
        Logger.verbose('RequestService - "request" param found, searching corresponding route key in config...');
        const routeKeys = Object.keys(routes).filter(function(route) {
            return route.split('/')[1] === req.params.request;
        });
        // if we didn't find any matching route, return false
        if (routeKeys.length === 0) {
            Logger.error('RequestService - Didn\'t find any matching route config for given request param : ');
            Logger.error(req.params.request);
            return false;
        }

        // if there is an option for the request (hero name, ...), add it
        if (req.params.options) {
            Logger.verbose('RequestService - "options" found in params, adding it to route config...');

            // retrieve options data and count number of options
            const optionValues = req.params.options.split(':');
            const nbOptions = optionValues.length;

            // search the correct matching route key
            let matchedRouteKey = false;
            routeKeys.forEach(function(routeKey) {
                // if we have at least one parameter on the route key, and count nboptions
                if ((routeKey.split('/').length > 2) && ((routeKey.split('/')[2].match(/\:/g) || []).length + 1 === nbOptions)) {
                    matchedRouteKey = routeKey;
                    return false;
                }
            });
            // if we didn't found any, return an error
            if (matchedRouteKey === false) {
                Logger.error('RequestService - Invalid request "options" param for given route config :');
                Logger.error(req.params.options);
                return false;
            }

            Logger.verbose('RequestService - Extracting corresponding route config with given option...');

            // now, extract optionNames from the matched routeKey
            const optionNames = matchedRouteKey.split('/')[2].split(':');
            routeConfig = routes[matchedRouteKey]; // load the config
            // convert to string, replace the optionNames by optionValues
            routeConfig = JSON.stringify(routeConfig);
            for (let i = optionNames.length - 1; i >= 0; i--) {
                routeConfig = routeConfig.replace(':' + optionNames[i], optionValues[i]);
            }
            // reconvert into JS object
            routeConfig = JSON.parse(routeConfig);
        } else { // else, just call the method
            Logger.verbose('RequestService - Retrieving corresponding route config...');
            routeConfig = routes['/' + req.params.request];
        }
    }

    return routeConfig;
}

/**
 * Main method used to send request to a given route, and return result
 * @param  {object}  res            object in which we must send the response
 * @param  {object}  options        path options for request
 * @param  {object}  routeConfig    configuration of the route (format of the data to send)
 * @param  {string}  errorMessage   error message to display in case of an error
 */
RequestService.sendApiRequest = function(res, options, routeConfig, errorMessage) {
    if (!routeConfig) {
        Logger.error('RequestService - No route corresponding to given arguments...');
        res.status(404).send({
            'statusCode' : 404,
            'message': 'Error : no route found for given arguments'
        });
    } else {
        if (typeof options.params === 'undefined') {
            options.params = '';
        }

        Logger.info('RequestService - Requesting ' + options.host + options.path + options.params + '...');

        request(options.host + options.path + options.params, function(error, response, body) {
            Logger.verbose('RequestService - Request finished !');

            if (error !== null) {
                Logger.error('RequestService - Error on requested page ! Code : ' + response.statusCode + '. Message : ' + error.toString());
                res.status(400).send({
                    'statusCode' : 400,
                    'message': error.toString()
                });
            } else if (response.statusCode !== 200 || response.body.indexOf('Profile Not Found') !== -1) {
                Logger.error('RequestService - Error on requested profile, page not found ! Code : ' + response.statusCode + '. Message : ' + errorMessage);
                res.status(404).send({
                    'statusCode' : 404,
                    'message': errorMessage
                });
            } else {
                Logger.info('RequestService - Page loaded successfully !');

                // check if we already stored value in cache or not
                const requestSum = md5(options.path + options.params);
                const routeSum = md5(JSON.stringify(routeConfig));
                const etag = response.headers.etag;

                // cache variables
                let cacheValue = null;
                let cacheIsHere = false;
                let totalTime = new Date();

                Logger.verbose('RequestService - Checking if we have a cached value...');

                // request sqlite db
                Database.getCache(requestSum, routeSum, async function(err, row) {
                    if (err !== null) {
                        Logger.error('RequestService - Error when getting cache : ' + err);
                    } else if (typeof row !== 'undefined') {
                        cacheIsHere = true; // we notice that the cache is here
                        if (etag === row.etag) {
                            Logger.verbose('RequestService - Cache found with correct etag !');
                            cacheValue = row.content;
                        } else {
                            Logger.verbose('RequestService - Cache found but outdated...');
                        }
                    }

                    let jsonData = {};

                    // if we found a cache value, parse it into JSON data directly
                    if (cacheValue !== null) {
                        Logger.verbose('RequestService - Just parsing the cache...');
                        jsonData = JSON.parse(cacheValue);
                    } else { // else, just parse the dom with cheerio
                        Logger.verbose('RequestService - Parsing the dom with cheerio...');
                        const $ = cheerio.load(body);
                        Logger.verbose('RequestService - Parsing done !');

                        // before handling the DOM, add player level into it if in routeConfig (second GET request)
                        if (ParserService.configContainsSpecificKey(routeConfig, ['level', 'value'])) {
                            Logger.verbose('RequestService - Route config contains level.value key, doing another request to retrieve it...');
                            let playerLevel = await RequestService.requestPlayerLevel(options.params);
                            $('div.player-level').data('level', playerLevel);
                        }

                        // convert the dom data to api data corresponding to the current method
                        Logger.verbose('RequestService - Converting DOM to api data using route configuration...');
                        jsonData = ParserService.convertDomToApiData($, routeConfig);
                        Logger.verbose('RequestService - DOM converted successfully !');

                        // insert the cache into db
                        cacheValue = JSON.stringify(jsonData);

                        // if cache already here, just update the cache
                        if (cacheIsHere) {
                            Logger.verbose('RequestService - Cache updated with new value !');
                            Database.updateCache(requestSum, routeSum, etag, cacheValue);
                        } else { // else if we do not have cache at all, insert new cache value
                            Logger.verbose('RequestService - Value added in cache !');
                            Database.insertInCache(requestSum, routeSum, etag, cacheValue);
                        }
                    }

                    Logger.info('RequestService - Total time : ' + (new Date() - totalTime) + ' ms');

                    // send response
                    res.json(jsonData);
                });
            }
        });
    }
}

/**
 * Main method used to send request to blizzard route for player search, in order to retrieve player level
 * @param  {object}  playerOptions  player options (platform, battletag)
 * @return {integer}                player Overwatch level
 */
RequestService.requestPlayerLevel = function(playerOptions) {
    // 0 : platform, 1 : battletag
    playerOptions = playerOptions.split('/');
    const playerPlatform = playerOptions[0];
    const playerBattleTag = decodeURI(playerOptions[1].replace('-', '#'));

    const options = {
        host: 'https://playoverwatch.com',
        path: '/en-us/search/account-by-name/',
        params: playerBattleTag
    };

    Logger.info('RequestService - Requesting ' + options.host + options.path + options.params + '...');

    return new Promise(function(resolve, reject) {
        request(options.host + options.path + options.params, function(error, response, body) {
            Logger.verbose('RequestService - Request finished !');
            if (error !== null) {
                Logger.error('RequestService - Request error : ' + error);
                reject(error);
            } else {
                Logger.info('RequestService - Request was successfull !');
                const jsonData = JSON.parse(body);

                Logger.debug('RequestService - JSON data : ' + body);
                Logger.debug('RequestService - Player platform : ' + playerPlatform + ' and battletag : ' + playerBattleTag);

                let playerData = null;
                for (var i = jsonData.length - 1; i >= 0; i--) {
                    if (jsonData[i].platform === playerPlatform && jsonData[i].name === playerBattleTag) {
                        playerData = jsonData[i];
                        break;
                    }
                }

                if (playerData === null) {
                    Logger.debug('RequestService - Player data not found in JSON data...');
                } else {
                    Logger.debug('RequestService - Player data found ! Details : ');
                    Logger.debug(JSON.stringify(playerData));
                }

                resolve((playerData === null || !('level' in playerData)) ? 0 : playerData.level);
            }
        });
    });
};

module.exports = RequestService;