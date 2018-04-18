'use strict';

const CleanCSS = require('clean-css');
const fse = require('fs-extra');
const uglify = require('uglify-es');

const getConfig = require('./config');
const config = getConfig();

/**
 * A super simple preprocessor that converts < to &lt;
 * @param {String} html - The HTML as a string
 * @return The processed HTML
 */
function preprocessHTML(html) {
    let re = /</g;
    return html.replace(re, '&lt;');
}

/**
 * Minifies the CSS and writes the minified code back to disk
 * @param {String} source - The source filepat
 */
function preprocessCSS(source) {
    let minified = new CleanCSS().minify(fse.readFileSync(source, 'utf-8'))
        .styles;
    fse.outputFileSync(config.baseDir + source, minified);
}

/**
 * Uglifies the JS and writes the uglified code back to disk
 * @param {String} source - The source filepat
 */
function preprocessJS(source) {
    let minified = uglify.minify(fse.readFileSync(source, 'utf-8')).code;
    fse.outputFileSync(config.baseDir + source, minified);
}

/**
 * Sends the CSS source to `preprocessCSS`. Overrite the `%example-css-src%` string
 * with the appropriate link element, setting the value for `href`
 * @param {String} tmpl - The template as a string
 * @param {String} source - The source filepath
 * @returns tmpl - The modified template string
 */
function processCSSInclude(tmpl, source) {
    preprocessCSS(source);
    // inject the link tag into the source
    return tmpl.replace(
        '%example-css-src%',
        `<link rel="stylesheet" href="../../${source}" />`
    );
}

/**
 * Sends the JS source to `preprocessJS`. Overrite the `%example-js-src%` string
 * with the appropriate `script` element, setting the value for `src`
 * @param {String} tmpl - The template as a string
 * @param {String} source - The source filepath
 * @returns tmpl - The modified template string
 */
function processJSInclude(tmpl, source) {
    preprocessJS(source);
    // inject the script tag into the source
    return tmpl.replace(
        '%example-js-src%',
        `<script src="../../${source}"></script>`
    );
}

/**
 * Calls the appropriate processor function based on type
 * @param {String} type - A value of `js` or `css`
 * @param {String} tmpl - The template as a string
 * @param {String} source - The source filepath
 * @returns tmpl - The modified template string
 */
function processInclude(type, tmpl, source) {
    return type === 'css'
        ? processCSSInclude(tmpl, source)
        : processJSInclude(tmpl, source);
}

module.exports = {
    preprocessHTML,
    processInclude
};
