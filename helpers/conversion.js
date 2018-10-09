'use strict';

let ConversionHelpers = function(){};

/**
 * Extract background-image url from style tag
 * @param  {string}  str  content of the style tag
 * @return {string}       url of background image
 */
ConversionHelpers.imgUrlFromCss = function(str) {
    if (str !== undefined) {
        const matches = str.match(/background-image:url\((.*)\)/);
        if (1 in matches) {
            return matches[1];
        }
    }
    return null;
};

/**
 * Get player level in data attribute (added manually into DOM in RequestHelpers)
 * @param  {object}   levelDiv  cheerio DOM object
 * @return {integer}            player level
 */
ConversionHelpers.getPlayerLevel = function(levelDiv) {
    return levelDiv.data('level');
};

/**
 * Convert a string from DOM to an integer
 * @param   string   divText  text of the div containing the string
 * @return  integer           integer value of the string
 */
ConversionHelpers.stringToInteger = function(divText) {
    return parseInt(divText);
};

/**
 * Convert a string from DOM to a float
 * @param   string   divText  text of the div containing the string
 * @return  float           float value of the string
 */
ConversionHelpers.stringToFloat = function(divText) {
    return parseFloat(divText);
};


/**
 * Get hero difficulty depending on stars on the page
 * @param  {object}   parentDiv  cheerio DOM object
 * @return {integer}             difficulty of hero
 */
ConversionHelpers.getHeroDifficulty = function(parentDiv) {
    return parentDiv.children('.star').not('.m-empty').length;
}

ConversionHelpers.getHeroName = function(textDiv) {
    return textDiv.text().split(',')[0].split(':')[1].trim();
}

ConversionHelpers.getHeroAge = function(textDiv) {
    return textDiv.text().split(',')[1].split(':')[1].trim();
}

ConversionHelpers.getHeroOccupation = function(textDiv) {
    return textDiv.text().split(':')[1].trim();
}

ConversionHelpers.getHeroBaseOfOperations = function(textDiv) {
    return textDiv.text().split(':')[1].trim();
}

ConversionHelpers.getHeroAffiliation = function(textDiv) {
    return textDiv.text().split(':')[1].trim();
}

ConversionHelpers.getHeroCatchPhrase = function(textDiv) {
    return textDiv.text().slice(1, -1); // remove " at the beginning and the end
}

/**
 * Format any given value depending on its format (hour, float, int, time with strings, ...)
 * @param  {string}  str  given value
 * @return {mixed}        formatted value
 */
ConversionHelpers.valueFormat = function(str) {
    let found;
    if ((found = str.match(/^([0-9]+[,]?[0-9]*?)\:([0-9]+)\:([0-9]+)$/)) !== null) { // hour format hour:min:sec
        return parseInt((found[1].replace(/[,]/g,''))*3600) + parseInt(found[2]*60) + parseInt(found[3]); // return in seconds
    } else if ((found = str.match(/^([0-9]+)\:([0-9]+)$/)) !== null) { // hour format min:sec
        return parseInt(found[1]*60) + parseInt(found[2]); // return in seconds
    } else if (str.match(/^[0-9]+\.[0-9]+$/) !== null) { // float format
        return parseFloat(str);
    } else if (str.match(/^[0-9]+([,%]?[0-9]?)*(\.[0-9]+)?$/) !== null) { // int format (with comma for thousands)
        return parseFloat(str.replace(/[,%]/g,''));
    } else if ((found = str.match(/^([0-9]*\.?[0-9]+) (hour[s]?|minute[s]?|second[s])$/)) !== null) { // time played
        if (found[2].match(/^hour[s]?$/)) { // hours
            return 3600 * parseInt(found[1]);
        } else if (found[2].match(/^minute[s]?$/)) { // minutes
            return 60 * parseInt(found[1]);
        } else { // seconds
            return parseInt(found[1]);
        }
    } else if (str === '--') { // zero time fought with a character
        return 0;
    }
    return str;
};

/**
 * Remove diacretics from string
 * @see http://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
 * @param  {string}  str  given value
 * @return {mixed}        formatted value
 */
ConversionHelpers.normalizeRemoveDiacretics = function(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Format any description key from DOM to readable variable name in camelcase
 * @param  {string}  str  given value
 * @return {mixed}        formatted value
 */
ConversionHelpers.descriptionKeyFormat = function(str) {
    let words = str.split(' ');
    // make the first word lowercase
    words[0] = words[0].toLowerCase();
    // then, put an uppercase on other words (and remove dashes)
    for (var i = words.length - 1; i >= 1; i--) {
        words[i] = (words[i] === '-') ? '' : words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    }
    // and now merge all words to forme a new clean key
    words = ConversionHelpers.normalizeRemoveDiacretics(words.join(''));

    // remove unwanted chars from string (and replace some)
    words = words.replace(/[\.\-]/g, '');
    words = words.replace(/[\:]/g, '-');

    // and finally return
    return words;
};

/**
 * Get privacy (public/private/unknown) from privacy string on the page
 * @param  {string}  str  given string
 * @return {string}       privacy
 */
ConversionHelpers.privacyFromString = function(str) {
    let val = 'unknown';
    if (str.match(/Public/)) {
        val = 'public';
    } else if (str.match(/Private/)) {
        val = 'private';
    }
    return val;
};

module.exports = ConversionHelpers;