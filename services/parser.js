// LOCAL
const Logger = require('./logger');
const ConversionHelpers = require('../helpers/conversion');
const ExtractionHelpers = require('../helpers/extraction');

module.exports = {
  /**
   * Convert from DOM to api data, depending on a route config (recursively used for nodes)
   * @param  {object}  $     cheerio DOM object of the page
   * @param  {object}  node  route config to follow (or node)
   * @return {object}        api data
   */
  convertDomToApiData($, node) {
    let data = {};

    Logger.debug('ParserService - Starting node data conversion... Node :');
    Logger.debug(JSON.stringify(node));

    // if there is a method or cssPath key, save the attributes
    if ('method' in node || 'cssPath' in node) {
      Logger.debug('ParserService - Found "method" or "cssPath" in node, parsing node attributes...');
      data = this.convertNodeAttributes($, node);
    } else { // else recursively convert
      Logger.debug('ParserService - "method" and "cssPath" not found, parsing node recursively...');
      Object.keys(node).forEach((key) => {
        const val = node[key];
        data[key] = this.convertDomToApiData($, val);
      });
    }

    Logger.debug('ParserService - Node conversion finished !');
    Logger.debug(JSON.stringify(data));

    return data;
  },

  /**
   * Submethod used to convert node attributes (it's a leaf node)
   * @param  {object}  $     cheerio DOM object of the page
   * @param  {object}  node  concerned node
   * @return {object}        converted node attributes
   */
  convertNodeAttributes($, node) {
    let method = null;
    let params = null;
    let data = null;

    Logger.debug('ParserService - Converting node attributes.... Node :');
    Logger.debug(JSON.stringify(node));

    if ('method' in node) {
      Logger.debug('ParserService - "method" found in node !');

      if (typeof ConversionHelpers[node.method] !== 'undefined') {
        method = ConversionHelpers[node.method];
      } else if (typeof ExtractionHelpers[node.method] !== 'undefined') {
        method = ExtractionHelpers[node.method];
      }

      if ('params' in node) {
        Logger.debug('ParserService - "params" found in node !');

        // replace potential $ par the current value
        params = node.params.map((elt) => (elt === '$' ? $ : elt));
      }
    }

    if ('cssPath' in node) {
      Logger.debug('ParserService - "cssPath" found in node !');
      params = $(node.cssPath);

      // we didn't find the corresponding div on the page, return undefined
      if (!params.length) {
        Logger.error(`ParserService - div corresponding to cssPath not found : ${node.cssPath}`);
        return undefined;
      }
      if ('attr' in node) {
        Logger.debug('ParserService - "attr" found in node !');
        params = node.attr === 'text' ? params.text() : params.attr(node.attr);
      }
    }

    // it can happen when attr is not here anymore
    if (typeof params !== 'undefined') {
      Logger.debug('ParserService - "params" are defined, retrieving data...');
      if (method !== null) { // if method, call it and store the returned value
        Logger.debug('ParserService - Calling specific method...');
        // depending on the type of params, use the correct function (direct call is faster)
        data = params.constructor === Array ? method(...params) : method(params);
      } else { // else, just store the params (if an array, store the first element)
        data = typeof params === 'string' ? params : params[0];
      }
    } else {
      Logger.debug('ParserService - "params" is undefined, need to check if this is correct...');
    }

    Logger.debug('ParserService - Node attributes conversion finished !');
    Logger.debug(JSON.stringify(data));

    return data;
  },

  /**
   * Check if the given route config contains a specific list of keys in the right order
   * @param  {object}  routeConfig   route configuration
   * @param  {Array}   specificKeys  specific list of keys to search (keys in the right order)
   * @return {boolean}               true if the route config contains the key, false otherwise
   */
  configContainsSpecificKey(routeConfig, specificKeys) {
    let found = false;

    Logger.debug('ParserService - checking if configuration is containing the specific key...');
    Logger.debug(JSON.stringify(specificKeys));

    const routeConfigKeys = Object.keys(routeConfig);
    for (let i = 0; i <= routeConfigKeys.length - 1; i += 1) {
      if (found) {
        break;
      }

      const key = routeConfigKeys[i];

      // if we found the first specific key
      if (key === specificKeys[0]) {
        // make a new array and remove the first element we found
        const newKeys = specificKeys;
        newKeys.splice(0, 1);

        if (newKeys.length === 0) {
          // if no key to search for, we found it, it's ok
          found = true;
        } else if (routeConfig[key] instanceof Object) {
          // else search it recursively if it's an object
          found = this.configContainsSpecificKey(routeConfig[key], newKeys);
        }
      } else if (routeConfig[key] instanceof Object) {
        // else, if the value is an object, search recursively
        found = this.configContainsSpecificKey(routeConfig[key], specificKeys);
      }
    }

    return found;
  },
};
