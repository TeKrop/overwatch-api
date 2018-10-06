'use strict';
const ConversionHelpers = require('./conversion.js');
const ExtractionHelpers = require('./extraction.js');

let DomToApiHelpers = function(){};

/**
 * Convert retrieved from DOM to api data, depending on a route config (recursively used for nodes)
 * @param  {object}  $     cheerio DOM object of the page
 * @param  {object}  node  route config to follow (or node)
 */
DomToApiHelpers.convertDomToApiData = function($, node) {
    let data = {};

    // if there is a method or cssPath key, save the attributes
    if ('method' in node || 'cssPath' in node) {
        data = DomToApiHelpers.convertNodeAttributes($, node);
    } else { // else recursively convert
        Object.keys(node).forEach(function(key) {
            const val = node[key];
            data[key] = DomToApiHelpers.convertDomToApiData($, val);
        });
    }

    return data;
};

/**
 * Submethod used to convert node attributes (it's a leaf node)
 * @param  {object}  $     cheerio DOM object of the page
 * @param  {object}  node  concerned node
 */
DomToApiHelpers.convertNodeAttributes = function($, node) {
    let method = null;
    let params = null;
    let data = null;

    if ('method' in node) {
        if (ConversionHelpers[node.method] !== undefined) {
            method = ConversionHelpers[node.method];
        } else if (ExtractionHelpers[node.method] !== undefined) {
            method = ExtractionHelpers[node.method];
        }

        if ('params' in node) {
            // replace potential $ par the current value
            params = node.params.map(function(elt) {
                return (elt === '$') ? $ : elt;
            });
        }
    }

    if ('cssPath' in node) {
        params = $(node.cssPath);
        // we didn't find the corresponding div on the page, return undefined
        if (!params.length) {
            return undefined;
        }
        if ('attr' in node) {
            params = (node.attr === 'text') ? params.text() : params.attr(node.attr);
        }
    }

    // it can happen when attr is not here anymore
    if (params !== undefined) {
        if (method !== null) { // if method, call it and store the returned value
            // depending on the type of params, use the correct function (direct call is faster)
            data = (params.constructor === Array) ? method.apply(null, params) : method(params);
        } else { // else, just store the params (if an array, store the first element)
            data = (typeof params === 'string') ? params : params[0];
        }
    }

    return data;
};

/**
 * Check if the given route config contains a specific list of keys in the right order
 * @param  {object}  routeConfig   route configuration
 * @param  {Array}   specificKeys  specific list of keys to search (keys must be in the right order)
 * @return {boolean}               true if the route config contains the key, false otherwise
 */
DomToApiHelpers.configContainsSpecificKey = function(routeConfig, specificKeys) {
    let found = false;

    for (let key in routeConfig) {
        if (found) break;

        // if we found the first specific key
        if (key === specificKeys[0]) {
            // make a new array and remove the first element we found
            let newKeys = specificKeys;
            newKeys.splice(0, 1);

            if (newKeys.length === 0) {
                // if no key to search for, we found it, it's ok
                found = true;
            } else if (routeConfig[key] instanceof Object) {
                // else search it recursively if it's an object
                found = DomToApiHelpers.configContainsSpecificKey(routeConfig[key], newKeys);
            }
        } else if (routeConfig[key] instanceof Object) {
            // else, if the value is an object, search recursively
            found = DomToApiHelpers.configContainsSpecificKey(routeConfig[key], specificKeys);
        }
    }

    return found;
};

module.exports = DomToApiHelpers;