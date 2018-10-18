'use strict';

module.exports = {
    // basic server config
    SERVER_PORT: 8081, // server port to use
    SWAGGER_URL: 'https://swagger-owapi.tekrop.fr/', // url of swagger page for the API
    // logs config
    ENABLE_LOGS: true, // enable logs in files or not
    LOG_LEVEL: 'verbose', // log levels, corresponding to Node.js levels : error, warn, info, verbose, debug
    LOG_PATH: './logs', // log storage path
    LOG_FILENAME: 'overwatch-api-%DATE%.log', // log filename pattern
    ZIP_LOGS: true, // zip logs of the previous day
    // external calls config (endpoint)
    BLIZZARD_HOST: 'https://playoverwatch.com', // blizzard base url for overwatch website
    CAREER_PATH: '/en-us/career/', // base path for player career pages
    HEROES_PATH: '/en-us/heroes/', // path for overwatch heroes page
};