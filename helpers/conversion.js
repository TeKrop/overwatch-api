'use strict';

let ConversionHelpers = function(){};

/**
 * List taken from https://github.com/SunDwarf/OWAPI/blob/master/owapi/prestige.py (MIT license)
 */
ConversionHelpers.prestige = {
    "0x0250000000000918": 0,
    "0x0250000000000919": 0,
    "0x025000000000091A": 0,
    "0x025000000000091B": 0,
    "0x025000000000091C": 0,
    "0x025000000000091D": 0,
    "0x025000000000091E": 0,
    "0x025000000000091F": 0,
    "0x0250000000000920": 0,
    "0x0250000000000921": 0,
    "0x0250000000000922": 1,
    "0x0250000000000924": 1,
    "0x0250000000000925": 1,
    "0x0250000000000926": 1,
    "0x025000000000094C": 1,
    "0x0250000000000927": 1,
    "0x0250000000000928": 1,
    "0x0250000000000929": 1,
    "0x025000000000092B": 1,
    "0x0250000000000950": 1,
    "0x025000000000092A": 2,
    "0x025000000000092C": 2,
    "0x0250000000000937": 2,
    "0x025000000000093B": 2,
    "0x0250000000000933": 2,
    "0x0250000000000923": 2,
    "0x0250000000000944": 2,
    "0x0250000000000948": 2,
    "0x025000000000093F": 2,
    "0x0250000000000951": 2,
    "0x025000000000092D": 3,
    "0x0250000000000930": 3,
    "0x0250000000000934": 3,
    "0x0250000000000938": 3,
    "0x0250000000000940": 3,
    "0x0250000000000949": 3,
    "0x0250000000000952": 3,
    "0x025000000000094D": 3,
    "0x0250000000000945": 3,
    "0x025000000000093C": 3,
    "0x025000000000092E": 4,
    "0x0250000000000931": 4,
    "0x0250000000000935": 4,
    "0x025000000000093D": 4,
    "0x0250000000000946": 4,
    "0x025000000000094A": 4,
    "0x0250000000000953": 4,
    "0x025000000000094E": 4,
    "0x0250000000000939": 4,
    "0x0250000000000941": 4,
    "0x025000000000092F": 5,
    "0x0250000000000932": 5,
    "0x025000000000093E": 5,
    "0x0250000000000936": 5,
    "0x025000000000093A": 5,
    "0x0250000000000942": 5,
    "0x0250000000000947": 5,
    "0x025000000000094F": 5,
    "0x025000000000094B": 5,
    "0x0250000000000954": 5,
    "0x0250000000000956": 6,
    "0x025000000000095C": 6,
    "0x025000000000095D": 6,
    "0x025000000000095E": 6,
    "0x025000000000095F": 6,
    "0x0250000000000960": 6,
    "0x0250000000000961": 6,
    "0x0250000000000962": 6,
    "0x0250000000000963": 6,
    "0x0250000000000964": 6,
    "0x0250000000000957": 7,
    "0x0250000000000965": 7,
    "0x0250000000000966": 7,
    "0x0250000000000967": 7,
    "0x0250000000000968": 7,
    "0x0250000000000969": 7,
    "0x025000000000096A": 7,
    "0x025000000000096B": 7,
    "0x025000000000096C": 7,
    "0x025000000000096D": 7,
    "0x0250000000000958": 8,
    "0x025000000000096E": 8,
    "0x025000000000096F": 8,
    "0x0250000000000970": 8,
    "0x0250000000000971": 8,
    "0x0250000000000972": 8,
    "0x0250000000000973": 8,
    "0x0250000000000974": 8,
    "0x0250000000000975": 8,
    "0x0250000000000976": 8,
    "0x0250000000000959": 9,
    "0x0250000000000977": 9,
    "0x0250000000000978": 9,
    "0x0250000000000979": 9,
    "0x025000000000097A": 9,
    "0x025000000000097B": 9,
    "0x025000000000097C": 9,
    "0x025000000000097D": 9,
    "0x025000000000097E": 9,
    "0x025000000000097F": 9,
    "0x025000000000095A": 10,
    "0x0250000000000980": 10,
    "0x0250000000000981": 10,
    "0x0250000000000982": 10,
    "0x0250000000000983": 10,
    "0x0250000000000984": 10,
    "0x0250000000000985": 10,
    "0x0250000000000986": 10,
    "0x0250000000000987": 10,
    "0x0250000000000988": 10,
    "0x025000000000095B": 11,
    "0x0250000000000989": 11,
    "0x025000000000098A": 11,
    "0x025000000000098B": 11,
    "0x025000000000098C": 11,
    "0x025000000000098D": 11,
    "0x025000000000098E": 11,
    "0x025000000000098F": 11,
    "0x0250000000000991": 11,
    "0x0250000000000990": 11,
    "0x0250000000000992": 12,
    "0x0250000000000993": 12,
    "0x0250000000000994": 12,
    "0x0250000000000995": 12,
    "0x0250000000000996": 12,
    "0x0250000000000997": 12,
    "0x0250000000000998": 12,
    "0x0250000000000999": 12,
    "0x025000000000099A": 12,
    "0x025000000000099B": 12,
    "0x025000000000099C": 13,
    "0x025000000000099D": 13,
    "0x025000000000099E": 13,
    "0x025000000000099F": 13,
    "0x02500000000009A0": 13,
    "0x02500000000009A1": 13,
    "0x02500000000009A2": 13,
    "0x02500000000009A3": 13,
    "0x02500000000009A4": 13,
    "0x02500000000009A5": 13,
    "0x02500000000009A6": 14,
    "0x02500000000009A7": 14,
    "0x02500000000009A8": 14,
    "0x02500000000009A9": 14,
    "0x02500000000009AA": 14,
    "0x02500000000009AB": 14,
    "0x02500000000009AC": 14,
    "0x02500000000009AD": 14,
    "0x02500000000009AE": 14,
    "0x02500000000009AF": 14,
    "0x02500000000009B0": 15,
    "0x02500000000009B1": 15,
    "0x02500000000009B2": 15,
    "0x02500000000009B3": 15,
    "0x02500000000009B4": 15,
    "0x02500000000009B5": 15,
    "0x02500000000009B6": 15,
    "0x02500000000009B7": 15,
    "0x02500000000009B8": 15,
    "0x02500000000009B9": 15,
    "0x02500000000009BA": 16,
    "0x02500000000009BB": 16,
    "0x02500000000009BC": 16,
    "0x02500000000009BD": 16,
    "0x02500000000009BE": 16,
    "0x02500000000009BF": 16,
    "0x02500000000009C0": 16,
    "0x02500000000009C1": 16,
    "0x02500000000009C2": 16,
    "0x02500000000009C3": 16,
    "0x02500000000009C4": 17,
    "0x02500000000009C5": 17,
    "0x02500000000009C6": 17,
    "0x02500000000009C7": 17,
    "0x02500000000009C8": 17,
    "0x02500000000009C9": 17,
    "0x02500000000009CA": 17,
    "0x02500000000009CB": 17,
    "0x02500000000009CC": 17,
    "0x02500000000009CD": 17
};

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
 * Extract the prestigeId from style tag (url of background-image)
 * @param  {string}  str  content of the style tag
 * @return {string}       prestige id (1 => 100 levels)
 */
ConversionHelpers.prestigeIdByCss = function(str) {
    const matches = str.match(/(0x025[A-Z0-9]+)/);
    if (1 in matches) {
        return matches[1];
    }
    return '';
};

/**
 * Calculate total player level with prestige and current level
 * @param  {object}   levelDiv  cheerio DOM object
 * @return {integer}            total level of player
 */
ConversionHelpers.calculateTotalLevel = function(levelDiv) {
    const prestige = ConversionHelpers.prestige[ConversionHelpers.prestigeIdByCss(levelDiv.attr('style'))];
    const level = parseInt(levelDiv.children('div').first().text());
    return (100 * parseInt(prestige)) + parseInt(level);
};

/**
 * Calculate the skill rating of player
 * @param   string   divText  text of the div containing skill rating
 * @return  integer           skill rating of player
 */
ConversionHelpers.calculateSkillRating = function(divText) {
    return parseInt(divText);
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
    if ((found = str.match(/^([0-9]+)\:([0-9]+)\:([0-9]+)$/)) !== null) { // hour format hour:min:sec
        return parseInt(found[1]*3600) + parseInt(found[2]*60) + parseInt(found[3]); // return in seconds
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

module.exports = ConversionHelpers;