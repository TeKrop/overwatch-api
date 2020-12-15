module.exports = {
  /**
   * Extract background-image url from style tag
   * @param  {string}  str  content of the style tag
   * @return {string}       url of background image
   */
  imgUrlFromCss(str) {
    if (str !== undefined) {
      const matches = str.match(/background-image:url\((.*)\)/);
      if (1 in matches) {
        return matches[1].trim();
      }
    }
    return null;
  },

  /**
   * Get player level in data attribute (added manually into DOM in RequestService)
   * @param  {object}   levelDiv  cheerio DOM object
   * @return {integer}            player level
   */
  getPlayerLevel(levelDiv) {
    return parseInt(levelDiv.data('level'), 10);
  },

  /**
   * Convert a string from DOM to an integer
   * @param   string   divText  text of the div containing the string
   * @return  integer           integer value of the string
   */
  stringToInteger(divText) {
    return parseInt(divText, 10);
  },

  /**
   * Convert a string from DOM to a float
   * @param   string   divText  text of the div containing the string
   * @return  float           float value of the string
   */
  stringToFloat(divText) {
    return parseFloat(divText);
  },

  /**
   * Get hero difficulty depending on stars on the page
   * @param  {object}   parentDiv  cheerio DOM object
   * @return {integer}             difficulty of hero
   */
  getHeroDifficulty(parentDiv) {
    return parentDiv.children('.star').not('.m-empty').length;
  },

  getHeroName(textDiv) {
    const text = textDiv.text().split(',')[0].split(':');
    return text.length > 1 ? text[1].trim() : text[0].trim();
  },

  getHeroAge(textDiv) {
    const textArray = textDiv.text().split(',');
    return textArray[textArray.length - 1].split(':')[1].trim();
  },

  getHeroOccupation(textDiv) {
    return textDiv.text().split(':')[1].trim();
  },

  getHeroBaseOfOperations(textDiv) {
    return textDiv.text().split(':')[1].trim();
  },

  getHeroAffiliation(textDiv) {
    return textDiv.text().split(':')[1].trim();
  },

  getHeroCatchPhrase(textDiv) {
    return textDiv.text().slice(1, -1); // remove " at the beginning and the end
  },

  /**
   * Format any given value depending on its format (hour, float, int, time with strings, ...)
   * @param  {string}  str  given value
   * @return {mixed}        formatted value
   */
  valueFormat(str) {
    // hour format hour:min:sec
    let found = str.match(/^([0-9]+[,]?[0-9]*?):([0-9]+):([0-9]+)$/);
    if (found !== null) {
      return parseInt((found[1].replace(/[,]/g, '')) * 3600, 10) + parseInt(found[2] * 60, 10) + parseInt(found[3], 10); // return in seconds
    }

    // hour format min:sec
    found = str.match(/^([0-9]+):([0-9]+)$/);
    if (found !== null) {
      return parseInt(found[1] * 60, 10) + parseInt(found[2], 10); // return in seconds
    }

    if (str.match(/^[0-9]+\.[0-9]+$/) !== null) { // float format
      return parseFloat(str);
    }
    if (str.match(/^[0-9]+([,%]?[0-9]?)*(\.[0-9]+)?$/) !== null) { // int format (with comma for thousands)
      return parseFloat(str.replace(/[,%]/g, ''));
    }

    // time played
    found = str.match(/^([0-9]*\.?[0-9]+) (hour[s]?|minute[s]?|second[s])$/);
    if (found !== null) {
      if (found[2].match(/^hour[s]?$/)) { // hours
        return 3600 * parseInt(found[1], 10);
      }
      if (found[2].match(/^minute[s]?$/)) { // minutes
        return 60 * parseInt(found[1], 10);
      } // seconds
      return parseInt(found[1], 10);
    }

    // zero time fought with a character
    if (str === '--') {
      return 0;
    }

    return str;
  },

  /**
   * Remove diacretics from string
   * @see http://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
   * @param  {string}  str  given value
   * @return {mixed}        formatted value
   */
  normalizeRemoveDiacretics(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  /**
   * Format any description key from DOM to readable variable name in camelcase
   * @param  {string}  str  given value
   * @return {mixed}        formatted value
   */
  descriptionKeyFormat(str) {
    let words = str.split(' ');
    // make the first word lowercase
    words[0] = words[0].toLowerCase();
    // then, put an uppercase on other words (and remove dashes)
    for (let i = words.length - 1; i >= 1; i -= 1) {
      words[i] = (words[i] === '-') ? '' : words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    }
    // and now merge all words to forme a new clean key
    words = this.normalizeRemoveDiacretics(words.join(''));

    // remove unwanted chars from string (and replace some)
    words = words.replace(/[.-]/g, '');
    words = words.replace(/[:]/g, '-');

    // and finally return
    return words;
  },

  /**
   * Get privacy (public/private/unknown) from privacy string on the page
   * @param  {string}  str  given string
   * @return {string}       privacy
   */
  privacyFromString(str) {
    let val = 'unknown';
    if (str.match(/Public/)) {
      val = 'public';
    } else if (str.match(/Private/)) {
      val = 'private';
    }
    return val;
  },
};
