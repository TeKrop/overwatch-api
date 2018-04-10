'use strict';

// GLOBAL
const request = require('request'); // make http calls simply (support https and follows redirects)
const cheerio = require('cheerio'); // create a DOM object with html code, in order to parse
const md5 = require('md5'); // used to calculate checksums

// LOCAL
const DomToApiHelpers = require('./domtoapi.js');
const DatabaseHelpers = require('./database.js');

let RequestHelpers = function(){};

/**
 * Main method used to find a route config matching a request for player section (subrouting)
 * @param  {object}  req        express req object, contains the request
 * @param  {object}  routes     configuration file containing subroutes
 * @return {object}             route configuration matching the request
 */
RequestHelpers.findPlayerRouteConfig = function(req, routes) {
    // load correct routes config depending on user request
    let routeConfig = {};

    // default route
    if (!req.params.request) {
        routeConfig = routes['/'];
    } else {
        // search corresponding route with regexp
        const routeKeys = Object.keys(routes).filter(function(route) {
            return route.split('/')[1] === req.params.request;
        });
        // if we didn't find any matching route, return false
        if (routeKeys.length === 0) {
            return false;
        }

        // if there is an option for the request (hero name, ...), add it
        if (req.params.options) {
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
                return false;
            }

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
RequestHelpers.sendApiRequest = function(res, options, routeConfig, errorMessage) {
    if (!routeConfig) {
        res.status(404).send({
            'statusCode' : 404,
            'message': 'Error : no route found for given arguments'
        });
    } else {
        if (options.params === undefined) {
            options.params = '';
        }

        console.log('Requesting ' + options.host + options.path + options.params + '...');

        request(options.host + options.path + options.params, function(error, response, body) {
            if (error !== null) {
                res.status(400).send({
                    'statusCode' : 400,
                    'message': error.toString()
                });
            } else if (response.statusCode !== 200 || response.body.indexOf('Profile Not Found') !== -1) {
                res.status(404).send({
                    'statusCode' : 404,
                    'message': errorMessage
                });
            } else {
                // check if we already stored value in cache or not
                const requestSum = md5(options.path + options.params);
                const routeSum = md5(JSON.stringify(routeConfig));
                const etag = response.headers.etag;

                // cache variables
                let cacheValue = null;
                let cacheIsHere = false;
                let totalTime = new Date();

                // request sqlite db
                DatabaseHelpers.getCache(requestSum, routeSum, function(err, row) {
                    if (err !== null) {
                        console.log('Error when getting cache');
                        console.log(err);
                    } else if (row !== undefined) {
                        cacheIsHere = true; // we notice that the cache is here
                        if (etag === row.etag) {
                            console.log('Cache found with correct etag !...');
                            cacheValue = row.content;
                        } else {
                            console.log('Cache found but outdated...');
                        }
                    }

                    let jsonData = {};

                    // if we found a cache value, parse it into JSON data directly
                    if (cacheValue !== null) {
                        console.log('Just parsing the cache...');
                        jsonData = JSON.parse(cacheValue);
                    } else { // else, just parse the dom with cheerio
                        console.log('Parsing the dom with cheerio...');
                        const $ = cheerio.load(body);

                        // convert the dom data to api data corresponding to the current method
                        jsonData = DomToApiHelpers.convertDomToApiData($, routeConfig);

                        // insert the cache into db
                        cacheValue = JSON.stringify(jsonData);

                        // if cache already here, just update the cache
                        if (cacheIsHere) {
                            DatabaseHelpers.updateCache(requestSum, routeSum, etag, cacheValue);
                        } else { // else if we do not have cache at all, insert new cache value
                            DatabaseHelpers.insertInCache(requestSum, routeSum, etag, cacheValue);
                        }
                    }

                    console.log('Total time : ' + (new Date() - totalTime));

                    // send response
                    res.json(jsonData);
                });
            }
        });
    }
}

module.exports = RequestHelpers;