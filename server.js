'use strict';

// API VERSION NUMBER
const API_VERSION = '1.2.4';

/*************** SET UP ***************/
const fs = require('fs');                          // for configuration file
const express  = require('express');               // express
const compression = require('compression');        // gzip or deflate compression for page loading
const helmet = require('helmet');                  // security for production
const app = express();                             // create our app w/ express
const cors = require('cors');                      // allow using CORS

/*************** LOCAL SERVICES ***************/
const RequestService = require('./services/request');
const Database = require('./services/database');
const Logger = require('./services/logger');
const Config = require('./config/app-config');

/*************** CONFIG ***************/
app.use(compression());                            // compress all requests
app.use(helmet());                                 // security for well-known web vulnerabilities
app.use(cors());                                   // use cors to allow cross requests

/*************** DB INIT ***************/
Logger.verbose('Server - Initializing caching database... !');
Database.init();
Logger.verbose('Server - Caching database initialized !');

/*************** LISTEN ***************/
const port = Config.SERVER_PORT || 8081;
app.listen(port);
Logger.info('Server - Listening on port ' + port + ' with HTTP');

/*************** MODEL ***************/
let routes = {};
fs.readFile(__dirname + '/config/routes.json', 'utf8', function (err, data) {
    if (err) {
        Logger.error('Server - Routes config file not found or not readable (/config/routes.json)');
        process.exit(1);
    }
    routes = JSON.parse(data);
});

/*************** ROUTES ***************/

/*********** API ***********/

/**
 * Root path of the Overwatch API, listing main routes and link to swagger
 */
app.get('/', function(req, res) {
    Logger.info('Server - Displaying root path of the API');
    res.status(200).send({
        'statusCode' : 200,
        'message': 'Overwatch API root path',
        'routes': {
            '/player': 'Get data about a player',
            '/heroes': 'Get data about Overwatch heroes',
            '/hero': 'Get detailed data about a specific Overwatch hero'
        },
        'swagger': Config.SWAGGER_URL
    });
});

/**
 * Get data about a player (all, playerInfo, heroes, ...).
 * Optional params : ?platform=<pc/xbl/psn>
 */
app.get([
    '/player/:battletag',
    '/player/:battletag/:request',
    '/player/:battletag/:request/:options'
], function(req, res) {
    // Initialize options
    const options = {
        host: Config.BLIZZARD_HOST,
        path: Config.CAREER_PATH
    };

    // default platform
    let requestPlatform = 'pc';
    if (req.query && req.query.platform) {
        requestPlatform = req.query.platform;
    }

    // if incorrect platform
    if (['pc', 'psn', 'xbl'].indexOf(requestPlatform) === -1) {
        Logger.error('Server - Incorrect requested platform : ' + requestPlatform);
        res.status(400).send({
            'statusCode' : 400,
            'message': 'Error : incorrect requested platform'
        });
    } else {
        Logger.info('Server - Valid requested platform : ' + requestPlatform + '. Loading data for player ' + req.params.battletag + '...');
        options.params = requestPlatform + '/' + encodeURI(req.params.battletag);

        // do the routing process for player
        Logger.info('Server - Searching for the player route config corresponding to request...');
        const routeConfig = RequestService.findPlayerRouteConfig(req, routes.player);

        // send the request
        Logger.info('Server - Sending API request to Blizzard player page...');
        RequestService.sendApiRequest(res, options, routeConfig, 'Player not found');
    }
});

/**
 * Get global data about heroes (list, by role, ..)
 */
app.get([
    '/heroes',
    '/heroes/:request'
], function(req, res) {
    // initialize options
    const options = {
        host: Config.BLIZZARD_HOST,
        path: Config.HEROES_PATH
    };
    // choose the right route
    let routeConfig = false;
    // if no request, display all heroes
    if (!req.params.request) {
        Logger.info('Server - No specific request for heroes route. Loading route config for all heroes...');
        routeConfig = routes.heroes['/'];
    } else {
        // else, display the request role
        Logger.info('Server - Specific request for heroes route : ' + req.params.request + '. Loading route config for specific hero...');
        routeConfig = JSON.stringify(routes.heroes['/role']);
        routeConfig = routeConfig.replace(':role', req.params.request);
        routeConfig = JSON.parse(routeConfig);
    }

    // send the request
    Logger.info('Server - Sending API request to Blizzard heroes page...');
    RequestService.sendApiRequest(res, options, routeConfig, 'Heroes not found');
});

/**
 * Get data about a specific hero (name, bio, ...)
 */
app.get([
    '/hero/:request'
], function(req, res) {
    // initialize options
    const options = {
        host: Config.BLIZZARD_HOST,
        path: Config.HEROES_PATH,
        params: req.params.request
    };
    // load the route config
    const routeConfig = routes.hero['/'];
    // send the request
    RequestService.sendApiRequest(res, options, routeConfig, 'Hero not found');
});

/*********** ERRORS ***********/

/**
 * Handle 404 errors
 */
app.use(function(req, res) {
    Logger.error('Server - Invalid route provided, sending 404 error... URL : ' + req.url);
    res.status(404).send({
        'statusCode' : 404,
        'message': 'API Version : ' + API_VERSION + ' | Error, no route found for given arguments'
    });
});

/**
 * Handle 500 errors
 */
app.use(function(error, req, res) {
    Logger.error('Server - Internal server error. URL : ' + req.url + '. Error : ' + JSON.stringify(error));
    res.status(500).send({
        'statusCode': 500,
        'message': 'API Version : ' + API_VERSION + ' | Interval server error, contact the administrator or report the issue on GitHub (https://github.com/TeKrop/overwatch-api/issues)'
    });
});