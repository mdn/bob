#!/usr/bin/env node

const fse = require('fs-extra');
const glob = require('glob');

const bundler = require('./bundler');
const getConfig = require('./config');
const pageBuilder = require('./pageBuilder');
const utils = require('./utils');

/**
 * Initialization of the module. This loads `bundles.json` at the root of the
 * project and calls the follow on functions to generate the pages.
 */
function init() {
    const config = getConfig();

    fse.readJson(config.bundleConfig)
        .then(function(bundles) {
            // if the destination dir exists
            if (fse.pathExistsSync(config.baseDir)) {
                // clean it out before writing files
                fse.emptyDirSync(config.baseDir);
            } else {
                // ensure the destination dir exists
                fse.ensureDirSync(config.baseDir);
            }

            console.info('Copying static assets....');
            utils.copyStaticAssets();

            // builds the CSS and JS bundles
            bundler.buildBundles(bundles.bundles);

            // generated pages using glob.
            const metaJSONArray = glob.sync(config.metaGlob, {});
            for (const metaJson of metaJSONArray) {
                const file = fse.readJsonSync(metaJson);
                pageBuilder.buildPages(file.pages);
            }

            // clean up
            utils.removeJSBundles();
            // done
            console.log('Pages built successfully'); // eslint-disable-line no-console
        })
        .catch(function(err) {
            console.error('Error thrown while loading JSON', err);
        });
}

init();
