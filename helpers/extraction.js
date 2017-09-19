'use strict';
const ConversionHelpers = require('./conversion.js');

let ExtractionHelpers = function(){};

/**
 * Get the highlights of the current player
 * @param  {object}  $         cheerio DOM object of the page
 * @param  {string}  gamemode  quickplay or competitive
 * @return {object}            object containing the formatted data
 */
ExtractionHelpers.getHighlights = function($, gamemode) {
    let highlights = {};
    const cards = $('#' + gamemode + ' .highlights-section li > div.card > div.card-content');
    cards.each(function() {
        const description = $(this).children('.card-copy').text();
        const value = $(this).children('.card-heading').text();
        highlights[ConversionHelpers.descriptionKeyFormat(description)] = ConversionHelpers.valueFormat(value);
    });
    return highlights;
};

/**
 * Get the hero comparison on several stats (time played, ...) for the current player
 * @param  {object}  $         cheerio DOM object of the page
 * @param  {string}  gamemode  quickplay or competitive
 * @return {object}            object containing the formatted data
 */
ExtractionHelpers.getHeroComparison = function($, gamemode) {
    let categories = {};
    let heroComparison = {};
    const heroComparisonSection = $('#' + gamemode + ' .hero-comparison-section .row.column');

    // first, get the categories on the website
    const categoriesParent = heroComparisonSection.children('.m-bottom-items').find('select[data-group-id="comparisons"]');
    categoriesParent.children('option').each(function() {
        categories[ConversionHelpers.descriptionKeyFormat($(this).attr('option-id'))] = $(this).attr('value').split('.')[2];
    });

    // then, for each category, get the data for each hero
    Object.keys(categories).forEach(function(name) {
        const hash = categories[name];
        const parent = heroComparisonSection.children('.progress-category[data-category-id="overwatch.guid.' + hash + '"]');
        heroComparison[name] = {};

        parent.children().each(function() {
            const barText = $(this).children('.bar-container').children('.bar-text');
            const heroName = ConversionHelpers.descriptionKeyFormat(barText.children('.title').text());
            heroComparison[name][heroName] = ConversionHelpers.valueFormat(barText.children('.description').text());
        });
    });
    return heroComparison;
};

/**
 * Get all the careers stats of the current player
 * @param  {object}  $         cheerio DOM object of the page
 * @param  {string}  gamemode  quickplay or competitive
 * @return {object}            object containing the formatted data
 */
ExtractionHelpers.getCareerStats = function($, gamemode) {
    let heroes = {};
    let careerStats = {};
    const careerStatsSection = $('#' + gamemode + ' .career-stats-section .row.column');

    // first, get all heroes (and the "all heroes" section as well)
    const heroesParent = careerStatsSection.children('.m-bottom-items').find('select[data-group-id="stats"]');
    heroesParent.children('option').each(function() {
        heroes[ConversionHelpers.descriptionKeyFormat($(this).attr('option-id'))] = $(this).attr('value');
    });

    Object.keys(heroes).forEach(function(name) {
        const hash = heroes[name];
        const parent = careerStatsSection.children('.js-stats[data-category-id="' + hash + '"]').find('.column .card-stat-block table');
        careerStats[name] = {};

        parent.each(function() {
            const statTitle = ConversionHelpers.descriptionKeyFormat($(this).find('thead tr th .stat-title').text());
            careerStats[name][statTitle] = {};
            $(this).find('tbody tr').each(function() {
                const childrenTd = $(this).children('td');
                const description = ConversionHelpers.descriptionKeyFormat(childrenTd.first().text());
                careerStats[name][statTitle][description] = ConversionHelpers.valueFormat(childrenTd.eq(1).text());
            });
        });

    });
    return careerStats;
};

/**
 * Get stats about a specific hero, for the current player
 * @param  {object}  $         cheerio DOM object of the page
 * @param  {string}  heroName  name of the hero (ana, sombra, torbjorn, dva, ...)
 * @param  {string}  gamemode  optional, quickplay or competitive. Default to false (every gamemode)
 * @return {object}            object containing the formatted data
 */
ExtractionHelpers.getHeroStats = function($, heroName, gamemode = false) {
    let hero = '';
    let heroStats = {};
    const gamemodes = (gamemode !== false) ? [gamemode] : ['quickplay', 'competitive'];

    gamemodes.forEach(function(gamemode) {
        heroStats[gamemode] = {};
        const gamemodeSection = $('#' + gamemode + ' .career-stats-section .row.column');

        // first, get the specific request hero
        const heroesParent = gamemodeSection.children('.m-bottom-items').find('select[data-group-id="stats"]').children('option');
        heroesParent.each(function() {
            if (heroName === ConversionHelpers.descriptionKeyFormat($(this).attr('option-id'))) {
                hero = $(this).attr('value');
                return false;
            }
        });

        // and now, extract each data about the hero
        const parent = gamemodeSection.children('.js-stats[data-category-id="' + hero + '"]').find('.column .card-stat-block table');
        parent.each(function() {
            const statTitle = ConversionHelpers.descriptionKeyFormat($(this).find('thead tr th span.stat-title').text());
            heroStats[gamemode][statTitle] = {};
            $(this).find('tbody tr').each(function() {
                const childrenTd = $(this).children('td');
                const description = ConversionHelpers.descriptionKeyFormat(childrenTd.first().text());
                heroStats[gamemode][statTitle][description] = ConversionHelpers.valueFormat(childrenTd.eq(1).text());
            });
        });
    });

    // if we extracted data about only one gamemode,
    // don't need any intermediary node
    if (gamemodes.length === 1) {
        heroStats = heroStats[gamemodes[0]];
    }

    return heroStats;
}

/**
 * Get all the achievements of the current player
 * @param  {object}  $  cheerio DOM object of the page
 * @return {object}     object containing the formatted data
 */
ExtractionHelpers.getAchievements = function($) {
    let categories = {};
    let achievements = {};
    const achievementsSection = $('#achievements-section .row.column');

    // first, get all achievement categories
    const categoriesParent = achievementsSection.children('.m-bottom-items').find('select[data-group-id="achievements"]');
    categoriesParent.children('option').each(function() {
        categories[ConversionHelpers.descriptionKeyFormat($(this).attr('option-id'))] = $(this).attr('value');
    });

    // now loop over them and list them
    Object.keys(categories).forEach(function(name) {
        const hash = categories[name];
        const parent = achievementsSection.children('div[data-category-id="' + hash + '"]').children('ul');
        achievements[name] = [];

        parent.children('div.column').each(function() {
            const mediaCard = $(this).children('.media-card');

            // if the achievement is not acquired, pass
            if (mediaCard.hasClass('m-disabled')) {
                return;
            }

            achievements[name].push({
                title: mediaCard.children('.media-card-caption').children('.media-card-title').text(),
                description: $(this).children('.tooltip-tip').children('p.h6').text(),
                image: mediaCard.children('img.media-card-fill').attr('src')
            });
        });
    });

    return achievements;
};

/**
 * Get all the heroes list in a specific category
 * @param  {object}  $     cheerio DOM object of the page
 * @param  {string}  role  role of the hero (offense, defense, tank, support)
 * @return {object}        object containing the formatted data
 */
ExtractionHelpers.getHeroesList = function($, role = false) {
    let heroes = [];

    // first, get all heroes parent div
    let heroesContainers = $('#heroes-selector-container').children('.hero-portrait-detailed-container');

    // if there is a specific role to catch
    if (role !== false) {
        heroesContainers = heroesContainers.filter(function() {
            return $(this).data('groups')[0] === role.toUpperCase();
        });

        // now loop over them and list them
        heroesContainers.each(function() {
            heroes.push({
                name: $(this).find('.portrait-title').text(),
                portrait: $(this).find('img.portrait').attr('src')
            });
        });
    } else { // else, get all heroes and their roles
        heroesContainers.each(function() {
            heroes.push({
                name: $(this).find('.portrait-title').text(),
                role: $(this).data('groups')[0].toLowerCase(),
                portrait: $(this).find('img.portrait').attr('src')
            });
        });
    }

    return heroes;
}

/**
 * Get ability list for a specific hero
 * @param  {object}  $  cheerio DOM object of the page
 * @return {object}     object containing the formatted data
 */
ExtractionHelpers.getHeroAbilities = function($) {
    let abilities = [];

    const abilitiesDiv = $('.hero-detail-wrapper').children('.hero-ability');
    abilitiesDiv.each(function() {
        abilities.push({
            name: $(this).find('.hero-ability-descriptor > h4').text(),
            description: $(this).find('.hero-ability-descriptor > p').text(),
            icon: $(this).find('.hero-ability-icon').attr('src')
        });
    });

    return abilities;
}

/**
 * Get backStory for a specific hero
 * @param  {object}  $  cheerio DOM object of the page
 * @return {object}     object containing the formatted data
 */
ExtractionHelpers.getHeroBackStory = function($) {
    let backStory = '';

    const divs = $('.hero-bio-backstory').children('p');
    divs.each(function() {
        backStory += $(this).text() + ' ';
    });

    return backStory.trim();
}

module.exports = ExtractionHelpers;