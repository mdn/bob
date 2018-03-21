'use strict';

const dir = require('node-dir');
const fse = require('fs-extra');

const getConfig = require('./config');

/**
 * Copies all assets recursively in `sourceDir` to the directory specified as `destDir`
 * @param {string} sourceDir - The root relative path to the directory containing assets
 * @param {string} destDir - The root relative path to the directory to copy the assets to
 */
function copyDirectory(sourceDir, destDir) {
    // gather all files in sourceDir
    dir.files(sourceDir, function(err, files) {
        if (err) {
            if (err.code === 'ENOENT' && err.path === sourceDir) {
                console.error(
                    'Specified directory "' +
                        sourceDir +
                        '" does not exist. \nPlease specify an existing directory relative to the root of the project.'
                );
                return;
            }

            console.error('Error reading file list', err);
            throw err;
        }

        // Do not copy .DS_Store files
        files.filter(function(file) {
            let currentFile = file.substr(file.lastIndexOf('/') + 1);
            if (currentFile !== '.DS_Store') {
                fse.copySync(file, destDir + currentFile);
            }
        });
    });
}

/**
 * Copies editor and examples static assets
 */
function copyStaticAssets() {
    const config = getConfig();
    // copy editor static assets
    copyDirectory(config.editorMediaRoot, config.editorMediaDest);

    // copy examples static assets
    copyDirectory(config.examplesMediaRoot, config.examplesMediaDest);

    // copy fonts
    copyDirectory(config.fontsMediaRoot, config.fontsMediaDest);
}

/**
 * Utility function that checks whether the specified directory exists.
 * If not, it creates the directory
 * @param {string} dir - Project root relative path to directory
 */
function ensureDir(dir) {
    // if the target directory does not exist
    if (!fse.pathExistsSync(dir)) {
        // create it now
        fse.ensureDirSync(dir);
    }
}

/**
 * As a last step, this deletes the two JS bundles that was
 * built earlier in the build process.
 */
function removeJSBundles() {
    let bundlesArray = [
        'editor/js/editor-css-bundle.js',
        'editor/js/editor-js-bundle.js',
        'editor/js/editor-bundle.js'
    ];

    for (let bundle in bundlesArray) {
        fse.pathExists(bundlesArray[bundle]).then(function() {
            fse.removeSync(bundlesArray[bundle]);
        });
    }
}

module.exports = {
    copyDirectory,
    copyStaticAssets,
    ensureDir,
    removeJSBundles
};
