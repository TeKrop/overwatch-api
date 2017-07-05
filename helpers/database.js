'use strict';

// GLOBAL
const sqlite3 = require('sqlite3').verbose(); // SQLite3 for caching
const db = new sqlite3.Database(':memory:'); // Init database for the helper

let DatabaseHelpers = function(){};

/**
 * Initialize the database with cache table
 */
DatabaseHelpers.initDatabase = function() {

    /**
     * request (TEXT) : md5 of request params (playoverwatch url)
     * route (TEXT)   : md5 of api custom route (from config route)
     * etag (TEXT)    : etag of the requested page, used to know if the page has changed
     * content (BLOB) : JSON data returned by the api for the route on requested page
     */

    db.serialize(function() {
        // create the table
        db.run('CREATE TABLE cache (request TEXT, route TEXT, etag TEXT, content BLOB)');
        // create indexes on request and route (both are md5 sum)
        db.run('CREATE INDEX request_index ON cache(request)');
        db.run('CREATE INDEX route_index ON cache(route)');
    });
};

/**
 * Get cache from database with some conditions
 * @param  {string}    request     md5sum of HTTP request
 * @param  {string}    route       md5sum of custom route data
 * @param  {Function}  callback    callback function when request is done
 */
DatabaseHelpers.getCache = function(request, route, callback) {
    db.get('SELECT etag, content FROM cache WHERE request = $request AND route = $route', {
        $request: request,
        $route: route
    }, callback);
}

/**
 * Update cache entry with new data
 * @param  {string}  request  md5sum of HTTP request
 * @param  {string}  route    md5sum of custom route data
 * @param  {string}  etag     element sent by server in HTTP headers, used to check if page has changed
 * @param  {string}  content  content of the result after parsing and ordering, in JSON
 */
DatabaseHelpers.updateCache = function(request, route, etag, content) {
    console.log('Updating cache with new values...');
    db.run('UPDATE cache SET etag = $etag, content = $content WHERE request = $request AND route = $route', {
        $request: request,
        $route: route,
        $etag: etag,
        $content: content
    });
}

/**
 * Insert new cache entry
 * @param  {string}  request  md5sum of HTTP request
 * @param  {string}  route    md5sum of custom route data
 * @param  {string}  etag     element sent by server in HTTP headers, used to check if page has changed
 * @param  {string}  content  content of the result after parsing and ordering, in JSON
 */
DatabaseHelpers.insertInCache = function(request, route, etag, content) {
    console.log('Inserting new values into cache...');
    db.run('INSERT INTO cache (request, route, etag, content) VALUES ($request, $route, $etag, $content)', {
        $request: request,
        $route: route,
        $etag: etag,
        $content: content
    });
}


module.exports = DatabaseHelpers;