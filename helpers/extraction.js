const ConversionHelpers = require('./conversion');

module.exports = {
  /**
   * Get the hero comparison on several stats (time played, ...) for the current player
   * @param  {object}  $         cheerio DOM object of the page
   * @param  {string}  gamemode  quickplay or competitive
   * @return {object}            object containing the formatted data
   */
  getHeroComparison($, gamemode) {
    const categories = {};
    const heroComparison = {};
    const heroComparisonSection = $(`#${gamemode} .career-section:first-child .row.column`);

    // first, get the categories on the website
    const categoriesParent = heroComparisonSection.children('.m-bottom-items').find('select[data-group-id="comparisons"]');
    categoriesParent.children('option').each(function categoriesParentOption() {
      categories[ConversionHelpers.descriptionKeyFormat($(this).attr('option-id'))] = $(this).attr('value');
    });

    // then, for each category, get the data for each hero
    Object.keys(categories).forEach((name) => {
      const hash = categories[name];
      const parent = heroComparisonSection.children(`.progress-category[data-category-id="${hash}"]`);
      heroComparison[name] = {};

      parent.children().each(function parentChildren() {
        const barText = $(this).children('.ProgressBar-container').children('.ProgressBar-textWrapper');
        const heroName = ConversionHelpers.descriptionKeyFormat(barText.children('.ProgressBar-title').text());
        heroComparison[name][heroName] = ConversionHelpers.valueFormat(barText.children('.ProgressBar-description').text());
      });
    });
    return heroComparison;
  },

  /**
   * Get all the careers stats of the current player
   * @param  {object}  $         cheerio DOM object of the page
   * @param  {string}  gamemode  quickplay or competitive
   * @return {object}            object containing the formatted data
   */
  getCareerStats($, gamemode) {
    const heroes = {};
    const careerStats = {};
    const careerStatsSection = $(`#${gamemode} .career-section:nth-child(2) .row.column`);

    // first, get all heroes (and the "all heroes" section as well)
    const heroesParent = careerStatsSection.children('.m-bottom-items').find('select[data-group-id="stats"]');
    heroesParent.children('option').each(function heroesParentOption() {
      if (typeof $(this).attr('option-id') === 'undefined') return; // bugfix when Blizzard is messing up with invalid DOM
      heroes[ConversionHelpers.descriptionKeyFormat($(this).attr('option-id'))] = $(this).attr('value');
    });

    Object.keys(heroes).forEach((name) => {
      const hash = heroes[name];
      const parent = careerStatsSection.children(`.js-stats[data-category-id="${hash}"]`).find('.column .card-stat-block table');
      careerStats[name] = {};

      parent.each(function parentTable() {
        const statTitle = ConversionHelpers.descriptionKeyFormat($(this).find('thead tr th .stat-title').text());
        careerStats[name][statTitle] = {};
        $(this).find('tbody tr').each(function tableLine() {
          const childrenTd = $(this).children('td');
          const description = ConversionHelpers.descriptionKeyFormat(childrenTd.first().text());
          careerStats[name][statTitle][description] = ConversionHelpers
            .valueFormat(childrenTd.eq(1).text());
        });
      });
    });
    return careerStats;
  },

  /**
   * Get stats about a specific hero, for the current player
   * @param  {object}  $         cheerio DOM object of the page
   * @param  {string}  heroName  name of the hero (ana, sombra, torbjorn, dva, ...)
   * @param  {string}  gamemode  optional, quickplay or competitive. Default to false (all gamemode)
   * @return {object}            object containing the formatted data
   */
  getHeroStats($, heroName, gamemode = false) {
    let hero = '';
    let heroStats = {};
    const gamemodes = (gamemode !== false) ? [gamemode] : ['quickplay', 'competitive'];

    gamemodes.forEach((gm) => {
      heroStats[gm] = {};
      const gamemodeSection = $(`#${gm} .career-section:nth-child(2) .row.column`);

      // first, get the specific request hero
      const heroesParent = gamemodeSection.children('.m-bottom-items').find('select[data-group-id="stats"]').children('option');
      heroesParent.each(function heroParent() {
        if (heroName === ConversionHelpers.descriptionKeyFormat($(this).attr('option-id'))) {
          hero = $(this).attr('value');
          return false;
        }
        return true;
      });

      // and now, extract each data about the hero
      const parent = gamemodeSection.children(`.js-stats[data-category-id="${hero}"]`).find('.column .card-stat-block table');
      parent.each(function eachParent() {
        const statTitle = ConversionHelpers.descriptionKeyFormat($(this).find('thead tr th .stat-title').text());
        heroStats[gm][statTitle] = {};
        $(this).find('tbody tr').each(function parentLine() {
          const childrenTd = $(this).children('td');
          const description = ConversionHelpers.descriptionKeyFormat(childrenTd.first().text());
          heroStats[gm][statTitle][description] = ConversionHelpers
            .valueFormat(childrenTd.eq(1).text());
        });
      });
    });

    // if we extracted data about only one gamemode,
    // don't need any intermediary node
    if (gamemodes.length === 1) {
      heroStats = heroStats[gamemodes[0]];
    }

    return heroStats;
  },

  /**
   * Get all the achievements of the current player
   * @param  {object}  $  cheerio DOM object of the page
   * @return {object}     object containing the formatted data
   */
  getAchievementsfunction($) {
    const categories = {};
    const achievements = {};
    const achievementsSection = $('#achievements-section .row.column');

    // first, get all achievement categories
    const categoriesParent = achievementsSection.children('.m-bottom-items').find('select[data-group-id="achievements"]');
    categoriesParent.children('option').each(function parentOption() {
      categories[ConversionHelpers.descriptionKeyFormat($(this).attr('option-id'))] = $(this).attr('value');
    });

    // now loop over them and list them
    Object.keys(categories).forEach((name) => {
      const hash = categories[name];
      const parent = achievementsSection.children(`div[data-category-id="${hash}"]`).children('ul');
      achievements[name] = [];

      parent.children('div.column').each(function parentColumn() {
        const mediaCard = $(this).children('.media-card');

        // if the achievement is not acquired, pass
        if (mediaCard.hasClass('m-disabled')) {
          return;
        }

        achievements[name].push({
          title: mediaCard.children('.media-card-caption').children('.media-card-title').text(),
          description: $(this).children('.tooltip-tip').children('p.h6').text(),
          image: mediaCard.children('img.media-card-fill').attr('src'),
        });
      });
    });

    return achievements;
  },

  /**
   * Get all the heroes list in a specific category
   * @param  {object}  $     cheerio DOM object of the page
   * @param  {string}  role  role of the hero (offense, defense, tank, support)
   * @return {object}        object containing the formatted data
   */
  getHeroesList($, role = false) {
    const heroes = [];

    // first, get all heroes parent div
    let heroesContainers = $('#heroes-selector-container').children('.hero-portrait-detailed-container');

    // if there is a specific role to catch
    if (role !== false) {
      heroesContainers = heroesContainers.filter(function heroContainer() {
        return $(this).data('groups')[0] === role.toUpperCase();
      });

      // now loop over them and list them
      heroesContainers.each(function heroContainer() {
        heroes.push({
          key: $(this).find('.hero-portrait-detailed').data('hero-id'),
          name: $(this).find('.portrait-title').text(),
          portrait: $(this).find('img.portrait').attr('src'),
        });
      });
    } else { // else, get all heroes and their roles
      heroesContainers.each(function heroContainer() {
        heroes.push({
          key: $(this).find('.hero-portrait-detailed').data('hero-id'),
          name: $(this).find('.portrait-title').text(),
          role: $(this).data('groups')[0].toLowerCase(),
          portrait: $(this).find('img.portrait').attr('src'),
        });
      });
    }

    return heroes;
  },

  /**
   * Get weapon details for a specific hero
   * @param  {object}  $  cheerio DOM object of the page
   * @return {object}     object containing the formatted data
   */
  getHeroWeapons($) {
    const weapons = [];

    const weaponsDiv = $('.hero-detail-abilities.weapons').children('.hero-ability');
    weaponsDiv.each(function weaponDiv() {
      weapon = {
        icon: $(this).find('.hero-ability-icon-container img').attr('src'),
      }

      descriptor = $(this).find('.hero-ability-descriptor')
      if (descriptor.find('.primary-fire').length > 0) {
        weapon['primaryFire'] = {
          name: descriptor.find('.primary-fire .hero-ability-name').text(),
          description: descriptor.find('.primary-fire .hero-ability-description').text(),
        }
        weapon['secondaryFire'] = {
          name: descriptor.find('.secondary-fire .hero-ability-name').text(),
          description: descriptor.find('.secondary-fire .hero-ability-description').text()
        }
      } else {
        weapon['name'] = descriptor.find('> h4').text();
        weapon['description'] = descriptor.find('> p').text();
      }

      weapons.push(weapon);
    });

    return weapons;
  },

  /**
   * Get ability list for a specific hero
   * @param  {object}  $  cheerio DOM object of the page
   * @return {object}     object containing the formatted data
   */
  getHeroAbilities($) {
    const abilities = [];

    const abilitiesDiv = $('.hero-detail-abilities.abilities').children('.hero-ability');
    abilitiesDiv.each(function abilityDiv() {
      abilities.push({
        name: $(this).find('.hero-ability-descriptor > h4').text(),
        description: $(this).find('.hero-ability-descriptor > p').text(),
        icon: $(this).find('.hero-ability-icon-container img').attr('src'),
      });
    });

    return abilities;
  },

  /**
   * Get backStory for a specific hero
   * @param  {object}  $  cheerio DOM object of the page
   * @return {object}     object containing the formatted data
   */
  getHeroBackStory($) {
    let backStory = '';

    const divs = $('.hero-bio-backstory').children('p');
    divs.each(function backStoryDiv() {
      backStory += `${$(this).text()} `;
    });

    return backStory.trim();
  },
};
