// GLOBAL
const superagent = require('superagent');
const cheerio = require('cheerio'); // create a DOM object with html code, in order to parse
const md5 = require('md5'); // used to calculate checksums

// LOCAL
const Config = require('../config/app-config');
const ParserService = require('./parser');
const Database = require('./database');
const Logger = require('./logger');

module.exports = {
  /**
   * Main method used to find a route config matching a request for player section (subrouting)
   * @param  {object}  req        express req object, contains the request
   * @param  {object}  routes     configuration file containing subroutes
   * @return {object}             route configuration matching the request
   */
  findPlayerRouteConfig(req, routes) {
    // load correct routes config depending on user request
    let routeConfig = {};

    // default route
    if (!req.params.request) {
      Logger.verbose('RequestService - "request" param not found, return default route for player route');
      routeConfig = routes['/'];
    } else {
      // search corresponding route with regexp
      Logger.verbose('RequestService - "request" param found, searching corresponding route key in config...');
      const routeKeys = Object.keys(routes).filter((route) => route.split('/')[1] === req.params.request);
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
        routeKeys.forEach((routeKey) => {
          // if we have at least one parameter on the route key, and count nboptions
          if ((routeKey.split('/').length > 2) && ((routeKey.split('/')[2].match(/:/g) || []).length + 1 === nbOptions)) {
            matchedRouteKey = routeKey;
            return false;
          }
          return true;
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
        for (let i = optionNames.length - 1; i >= 0; i -= 1) {
          routeConfig = routeConfig.replace(`:${optionNames[i]}`, optionValues[i]);
        }
        // reconvert into JS object
        routeConfig = JSON.parse(routeConfig);
      } else { // else, just call the method
        Logger.verbose('RequestService - Retrieving corresponding route config...');
        routeConfig = routes[`/${req.params.request}`];
      }
    }

    return routeConfig;
  },

  /**
   * Main method used to send request to a given route, and return result
   * @param  {object}  res            object in which we must send the response
   * @param  {object}  options        path options for request
   * @param  {object}  routeConfig    configuration of the route (format of the data to send)
   * @param  {string}  errorMessage   error message to display in case of an error
   */
  sendApiRequest(res, options, routeConfig, errorMessage) {
    if (!routeConfig) {
      Logger.error('RequestService - No route corresponding to given arguments...');
      res.status(404).send({
        statusCode: 404,
        message: 'Error : no route found for given arguments',
      });
    } else {
      Logger.info(`RequestService - Requesting ${options.host}${options.path}${options.params}...`);

      superagent.get(options.host + options.path + options.params).end((error, response) => {
        Logger.verbose('RequestService - Request finished !');

        if (error !== null) {
          Logger.error(`RequestService - Error on requested page ! Message : ${error.toString()}`);
          res.status(response.statusCode).send({
            statusCode: response.statusCode,
            message: error.toString(),
          });
        } else if (response.statusCode !== 200 || response.text.indexOf('Profile Not Found') !== -1) {
          Logger.error(`RequestService - Error on requested profile, page not found ! Code : ${response.statusCode}. Message : ${errorMessage}`);
          res.status(404).send({
            statusCode: 404,
            message: errorMessage,
          });
        } else {
          Logger.info('RequestService - Page loaded successfully !');

          // check if we already stored value in cache or not
          const requestSum = md5(options.path + options.params);
          const routeSum = md5(JSON.stringify(routeConfig));
          const { etag } = response.headers;

          // cache variables
          let cacheValue = null;
          let cacheIsHere = false;
          const totalTime = new Date();

          Logger.verbose('RequestService - Checking if we have a cached value...');

          // request sqlite db
          Database.getCache(requestSum, routeSum, async (err, row) => {
            if (err !== null) {
              Logger.error(`RequestService - Error when getting cache : ${err}`);
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
              const $ = cheerio.load(response.text);
              Logger.verbose('RequestService - Parsing done !');

              // before handling the DOM, add player level if in routeConfig (second GET request)
              if (ParserService.configContainsSpecificKey(routeConfig, ['level', 'value'])) {
                Logger.verbose('RequestService - Route config contains level.value key... Doing the player level request...');

                let playerLevel = $('div.player-level').first().text();

                try {
                  playerLevel = await this.requestPlayerLevel({
                    platform: options.params.split('/')[0],
                    battletag: decodeURI(options.params.split('/')[1].replace('-', '#')),
                  });
                } catch (error) {
                  Logger.error(`RequestService - error when getting player level : ${error.toString()} !`);
                }

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

            Logger.info(`RequestService - Total time : ${new Date() - totalTime} ms`);

            // send response
            res.json(jsonData);
          });
        }
      });
    }
  },

  /**
   * Main method used to send request to blizzard for player search, to retrieve player level
   * @param  {object}  playerOptions  player options (platform, battletag)
   * @return {integer}                player Overwatch level
   */
  requestPlayerLevel(playerOptions) {
    const options = {
      host: Config.BLIZZARD_HOST,
      path: Config.SEARCH_ACCOUNT_PATH,
      params: playerOptions.battletag,
    };

    Logger.info(`RequestService - Requesting ${options.host}${options.path}${options.params}...`);

    return new Promise((resolve, reject) => {
      superagent(options.host + options.path + options.params).end((error, response) => {
        Logger.verbose('RequestService - Request finished !');
        if (error !== null) {
          reject(error);
        } else {
          Logger.info('RequestService - Request was successfull !');
          Logger.verbose(`RequestService - Body : ${response.text}`);

          const jsonData = JSON.parse(response.text);

          Logger.debug(`RequestService - Player platform : ${playerOptions.platform} and battletag : ${playerOptions.battletag}`);

          let playerData = null;
          for (let i = jsonData.length - 1; i >= 0; i -= 1) {
            if (
              jsonData[i].platform === playerOptions.platform
              && jsonData[i].name === playerOptions.battletag
            ) {
              playerData = jsonData[i];
              break;
            }
          }

          if (playerData === null) {
            Logger.warn(`RequestService - Player data not found in JSON data with platform : ${playerOptions.platform} and battletag : ${playerOptions.battletag}. Retrieving first one...`);
            if (jsonData.length >= 1) {
              [playerData] = jsonData;
            } else {
              Logger.error('RequestService - jsonData is empty, body is empty or not valid JSON');
            }
          } else {
            Logger.debug('RequestService - Player data found !');
          }

          Logger.debug(JSON.stringify(playerData));

          resolve((typeof playerData === 'undefined' || playerData === null || !('playerLevel' in playerData)) ? 0 : playerData.playerLevel);
        }
      });
    });
  },
};
