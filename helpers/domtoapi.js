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

    if (method !== null) { // if method, call it and store the returned value
        // depending on the type of params, use the correct function (direct call is faster)
        data = (params.constructor === Array) ? method.apply(null, params) : method(params);
    } else { // else, just store the params (if an array, store the first element)
        data = (typeof params === 'string') ? params : params[0];
    }

    return data;
};

module.exports = DomToApiHelpers;