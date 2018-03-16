'use strict';

/*************** SET UP ***************/
const fs = require('fs');                          // for configuration file
const express  = require('express');               // express
const compression = require('compression');        // gzip or deflate compression for page loading
const helmet = require('helmet');                  // security for production
const app = express();                             // create our app w/ express
const morgan = require('morgan');                  // log requests to the console (express4)
const cors = require('cors');                      // allow using CORS

/*************** LOCAL HELPERS ***************/
const RequestHelpers = require('./helpers/request.js');
const DatabaseHelpers = require('./helpers/database.js');

/*************** CONFIG ***************/
app.use(compression());                            // compress all requests
app.use(helmet());                                 // security for well-known web vulnerabilities
app.use(morgan('dev'));                            // log every request to the console
app.use(cors());                                   // use cors to allow cross requests

/*************** DB INIT ***************/
DatabaseHelpers.initDatabase();

/*************** LISTEN ***************/
const port = 8081;
app.listen(port);
console.log('Listening on port ' + port + ' with HTTP');

/*************** MODEL ***************/
let routes = {};
fs.readFile(__dirname + '/config/routes.json', 'utf8', function (err, data) {
    if (err) {
        console.log('Error : routes config file not found or not readable (/config/routes.json)');
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
    res.status(200).send({
        'statusCode' : 200,
        'message': 'Overwatch API root path',
        'routes': {
            '/player': 'Get data about a player',
            '/heroes': 'Get data about Overwatch heroes',
            '/hero': 'Get detailed data about a specific Overwatch hero'
        },
        'swagger': 'https://swagger-owapi.tekrop.fr/'
    });
});

/**
 * Get data about a player (all, playerInfo, highlights, heroes, ...).
 * Optional params : ?platform=<pc/xbl/psn>
 */
app.get([
    '/player/:battletag',
    '/player/:battletag/:request',
    '/player/:battletag/:request/:options'
], function(req, res) {
    // Initialize options
    const options = {
        host: 'https://playoverwatch.com',
        path: '/en-us/career/',
    };

    // default platform
    const requestPlatform = (req.query && req.query.platform) || 'pc';

    // if incorrect platform
    if (['pc', 'psn', 'xbl'].indexOf(requestPlatform) === -1) {
        res.status(400).send({
            'statusCode' : 400,
            'message': 'Error : incorrect requested platform'
        });
    } else {
        options.params = requestPlatform + '/' + req.params.battletag;
        // do the routing process for player
        const routeConfig = RequestHelpers.findPlayerRouteConfig(req, routes.player);
        // send the request
        RequestHelpers.sendApiRequest(res, options, routeConfig, 'Player not found');
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
        host: 'https://playoverwatch.com',
        path: '/en-us/heroes/'
    };
    // choose the right route
    let routeConfig = false;
    // if no request, display all heroes
    if (!req.params.request) {
        routeConfig = routes.heroes['/'];
    } else {
        // else, display the request role
        routeConfig = JSON.stringify(routes.heroes['/role']);
        routeConfig = routeConfig.replace(':role', req.params.request);
        routeConfig = JSON.parse(routeConfig);
    }
    // send the request
    RequestHelpers.sendApiRequest(res, options, routeConfig, 'Heroes not found');
});

/**
 * Get data about a specific hero (name, bio, ...)
 */
app.get([
    '/hero/:request'
], function(req, res) {
    // initialize options
    const options = {
        host: 'https://playoverwatch.com',
        path: '/en-us/heroes/',
        params: req.params.request
    };
    // load the route config
    const routeConfig = routes.hero['/'];
    // send the request
    RequestHelpers.sendApiRequest(res, options, routeConfig, 'Hero not found');
});

/*********** ERRORS ***********/

/**
 * Handle 404 errors
 */
app.use(function(req, res) {
    res.status(404).send({
        'statusCode' : 404,
        'message': 'Error, no route found for given arguments'
    });
});

/**
 * Handle 500 errors
 */
app.use(function(error, req, res) {
    res.status(500).send({
        'statusCode' : 500,
        'message': 'Interval server error, contact the administrator'
    });
});