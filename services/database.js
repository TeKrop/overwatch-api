// GLOBAL
const sqlite3 = require('sqlite3').verbose(); // SQLite3 for caching
// LOCAL
const Logger = require('./logger');

const db = new sqlite3.Database(':memory:'); // Init database for the helper

module.exports = {
  /**
   * Initialize the database with cache table
   * @returns {void}
   */
  init() {
    /**
     * request (TEXT) : md5 of request params (playoverwatch url)
     * route (TEXT)   : md5 of api custom route (from config route)
     * etag (TEXT)    : etag of the requested page, used to know if the page has changed
     * content (BLOB) : JSON data returned by the api for the route on requested page
     */
    Logger.debug('DatabaseService - Creating cache tables...');
    db.serialize(() => {
      // create the table
      db.run('CREATE TABLE cache (request TEXT, route TEXT, etag TEXT, content BLOB)');
      // create indexes on request and route (both are md5 sum)
      db.run('CREATE INDEX request_index ON cache(request)');
      db.run('CREATE INDEX route_index ON cache(route)');
    });
    Logger.debug('DatabaseService - Cache tables created !');
  },

  /**
   * Get cache from database with some conditions
   * @param  {string}    request     md5sum of HTTP request
   * @param  {string}    route       md5sum of custom route data
   * @param  {Function}  callback    callback function when request is done
   * @returns {void}
   */
  getCache(request, route, callback) {
    Logger.debug('DatabaseService - Getting cache value...');
    db.get('SELECT etag, content FROM cache WHERE request = $request AND route = $route', {
      $request: request,
      $route: route,
    }, callback);
  },

  /**
   * Update cache entry with new data
   * @param  {string}  request  md5sum of HTTP request
   * @param  {string}  route    md5sum of custom route data
   * @param  {string}  etag     element sent by server in HTTP headers
   * @param  {string}  content  content of the result after parsing and ordering, in JSON
   * @returns {void}
   */
  updateCache(request, route, etag, content) {
    Logger.debug('DatabaseService - Updating cache with new values...');
    db.run('UPDATE cache SET etag = $etag, content = $content WHERE request = $request AND route = $route', {
      $request: request,
      $route: route,
      $etag: etag,
      $content: content,
    });
    Logger.debug('DatabaseService - Cache updated !');
  },

  /**
   * Insert new cache entry
   * @param  {string}  request  md5sum of HTTP request
   * @param  {string}  route    md5sum of custom route data
   * @param  {string}  etag     element sent by server in HTTP headers
   * @param  {string}  content  content of the result after parsing and ordering, in JSON
   * @returns {void}
   */
  insertInCache(request, route, etag, content) {
    Logger.debug('DatabaseService - Inserting new values into cache...');
    db.run('INSERT INTO cache (request, route, etag, content) VALUES ($request, $route, $etag, $content)', {
      $request: request,
      $route: route,
      $etag: etag,
      $content: content,
    });
    Logger.debug('DatabaseService - Cache updated !');
  },
};
