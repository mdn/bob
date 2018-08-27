const browserify = require('browserify');
const CleanCSS = require('clean-css');
const concat = require('concat');
const fse = require('fs-extra');
const path = require('path');
const uglify = require('uglify-es');

const getConfig = require('./config');
const utils = require('./utils');

/**
 * Takes an array of paths and return the resolved
 * paths using a combination of `path.join` and `__dirname`
 * @param {Array} filePaths - Array of file paths
 * @returns Array of correctly resolved file paths
 */
function getFullPaths(filePaths) {
    return filePaths.map(file => path.join(__dirname, path));
}

/**
 * Traverse the list of bundles, and uses the data to generate the final
 * CSS and JavaScript bundles to `/docs/[css|js]`
 * @param {object} bundles - An object containing directives for building the bundles
 *
 * Example object:
 *
 * 'cssExamplesBase': {
 *     'javascript': ['js/lib/prism.js', 'js/editable-css.js'],
 *     'css': ['css/editable-css.css', 'css/libs/prism.css'],
 *     'destFileName': 'css-examples-base'
 * },
 *
 */
function buildBundles(bundles) {
    let config = getConfig();

    for (let bundle in bundles) {
        let currentBundle = bundles[bundle];
        let currentFilename = currentBundle.destFileName;

        if (currentBundle.javascript) {
            let outputFileName = config.destJsDir + currentFilename + '.js';
            let resolvedPaths = getFullPaths(currentBundle.javascript);

            // ensure the target dir exists
            utils.ensureDir(config.destJsDir);

            // concatenate, uglify, and write the result to file
            concat(resolvedPaths).then(function(result) {
                let uglified = uglify.minify(result);
                fse.outputFileSync(outputFileName, uglified.code);
            });
        }

        if (currentBundle.css) {
            let resolvedPaths = getFullPaths(currentBundle.css);
            // ensure the target dir exists
            utils.ensureDir(config.destCssDir);

            // for CSS, we currently simply concat and write to file
            concat(resolvedPaths).then(function(result) {
                let minified = new CleanCSS().minify(result);
                fse.outputFileSync(
                    config.destCssDir + currentFilename + '.css',
                    minified.styles
                );
            });
        }
    }
}

module.exports = {
    buildBundles
};
