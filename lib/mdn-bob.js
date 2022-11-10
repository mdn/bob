#!/usr/bin/env node

import fse from "fs-extra";
import webpack from "webpack";

import webpackConfig from "../webpack.config.js";
import getConfig from "./config.js";
import * as pageBuilder from "./pageBuilder.js";
import * as utils from "./utils.js";

function doWebpack() {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      const statsJson = stats.toJson();

      if (err || stats.hasErrors()) {
        if (err) {
          throw err;
        }
        reject(statsJson.errors);
      }

      if (stats.hasWarnings()) {
        for (const warn of statsJson.warnings) {
          console.warn("Webpack Warning: " + warn.message);
        }
      }

      resolve();
    });
  });
}

/**
 * Initialization of the module. Calls the follow on functions to generate the pages.
 */
async function init() {
  try {
    const config = getConfig();

    console.info(`MDN-BOB: Cleaning or creating ${config.baseDir}....`);
    // empty or create `config.baseDir`
    await fse.emptyDir(config.baseDir);

    console.info("MDN-BOB: Copying static assets....");
    utils.copyStaticAssets();

    console.info("MDN-BOB: Running Webpack...");
    await doWebpack();

    console.info("MDN-BOB: Building pages....");
    console.log(await pageBuilder.buildPages());

    console.info("MDN-BOB: Build completed successfully");
  } catch (error) {
    console.error("MDN-BOB: (mdn-bob.js/@init) Error during build:", error);
    process.exit(2);
  }
}

await init();
