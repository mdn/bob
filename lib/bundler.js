const browserify = require('browserify');
const CleanCSS = require('clean-css');
const concat = require('concat');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const uglify = require('uglify-es');

const getConfig = require('./config');
const utils = require('./utils');

const config = getConfig();

/**
 * Takes an array of paths and return the resolved
 * paths using a combination of `path.join` and `__dirname`
 * @param {Array} filePaths - Array of file paths
 * @returns Array of correctly resolved file paths
 */
function getFullPaths(filePaths) {
    return filePaths.map(file => path.join(__dirname, file));
}

/**
 * Minifies the source code and writes the result to disk
 * @param {String} type - The type of source i.e. css or js
 * @param {String} source - The source code to minify and write
 * @param {String} fileName - The output file name
 */
function minifyAndWriteFile(type, source, fileName) {
    if (type === 'js') {
        let uglified = uglify.minify(source);
        try {
            fse.outputFileSync(
                config.destJsDir + fileName + '.js',
                uglified.code
            );
        } catch (error) {
            console.error('MDN-BOB: Error writing JS bundle to disk', error);
        }
    } else if (type === 'css') {
        let minified = new CleanCSS().minify(source);
        try {
            fse.outputFileSync(
                config.destCssDir + fileName + '.css',
                minified.styles
            );
        } catch (error) {
            console.error('MDN-BOB: Error writing CSS bundle to disk', error);
        }
    }
}

/**
 * For the current bundle, concatenate, minify, and write the final
 * result to file
 * @param {String} type - The type of source i.e. css or js
 * @param {String} fileName - The output file name
 * @param {Array} bundle - The individual files to bundle
 */
function buildBundle(type, fileName, bundle) {
    let resolvedPaths = getFullPaths(bundle);

    // ensure the target dir exists
    utils.ensureDir(config.destCssDir);
    utils.ensureDir(config.destJsDir);

    if (resolvedPaths.length > 1) {
        result = concat(resolvedPaths).then(result => {
            minifyAndWriteFile(type, result, fileName);
        });
    } else {
        try {
            let result = fse.readFileSync(resolvedPaths[0], 'utf8');
            minifyAndWriteFile(type, result, fileName);
        } catch (error) {
            console.log(
                'MDN-BOB: (bundler.js/@buildBundle) Error reading source: ',
                error
            );
        }
    }
}

/**
 * Traverse the list of bundles, and uses the data to generate the final
 * CSS and JavaScript bundles to `/docs/[css|js]`
 * @returns {Object} A `Promise` that will resolve if all bundles are built successfully
 */
function buildBundles() {
    return new Promise((resolve, reject) => {
        fse.readJson(path.join(__dirname, config.bundleConfig))
            .then(bundles => {
                const editorBundles = bundles.bundles;
                for (let bundle in editorBundles) {
                    let currentBundle = editorBundles[bundle];
                    let currentFilename = currentBundle.destFileName;

                    if (currentBundle.javascript) {
                        buildBundle(
                            'js',
                            currentFilename,
                            currentBundle.javascript
                        );
                    }

                    if (currentBundle.css) {
                        buildBundle('css', currentFilename, currentBundle.css);
                    }
                }
                resolve('MDN-BOB: Bundles built successfully');
            })
            .catch(function(error) {
                reject(
                    Error(
                        'MDN-BOB: (bundler.js/@buildBundles) Error thrown while building bundles'
                    )
                );
            });
    });
}

/**
 * Queue up an array of promises that will be resolved once all
 * files have been processed, and written to disk.
 * @returns {Array} An array of promises
 */
function processAndWrite() {
    const entryFiles = config.editorBundles.split(',');
    let filePromises = [];

    for (let file in entryFiles) {
        let promise = new Promise((resolve, reject) => {
            let currentFile = entryFiles[file];
            let outputBaseFileName = currentFile.substr(
                0,
                currentFile.indexOf('.js')
            );
            let outputFilename = `${outputBaseFileName}-bundle.js`;
            let writableOutputFile = fs.createWriteStream(
                path.join(__dirname, outputFilename)
            );

            try {
                let reader = browserify(
                    path.join(__dirname, entryFiles[file])
                ).bundle();
                let writer = reader.pipe(writableOutputFile);
                reader.on('end', () => {
                    resolve(`${outputFilename} written to disk`);
                });
            } catch (error) {
                reject(
                    Error('MDN-BOB: (bundler.js/@compileJS) Error compiling JS')
                );
            }
        });
        filePromises.push(promise);
    }
    return filePromises;
}

module.exports = {
    buildBundles,
    processAndWrite
};
