#!/usr/bin/env node

import fse from "fs-extra";
import webpack, { Stats } from "webpack";

import webpackConfig from "../webpack.config.js";
import getConfig, { Config } from "./config.js";
import * as pageBuilder from "./pageBuilder.js";
import buildHeightData from "./heightBuilder.js";
import * as utils from "./utils.js";

/**
 * Making sure base output directory is created and empty
 *
 * In case Web Pack process is skipped, its output files are not deleted
 */
function cleanBaseDir(config: Config) {
  if (config.doWebPack) {
    fse.emptyDirSync(config.baseDir);
  } else {
    fse.ensureDirSync(config.baseDir);

    const baseFileNames = fse.readdirSync(config.baseDir);
    const baseFilePaths = baseFileNames.map((n) => config.baseDir + n);
    const notWebPackPaths = baseFilePaths.filter(
      (p) => !pathCreatedByWebPack(config, p)
    );
    notWebPackPaths.forEach((filePath) => fse.removeSync(filePath));
  }
}

function pathCreatedByWebPack(config: Config, path: string) {
  return (
    utils.isSamePath(config.destCssDir, path) ||
    utils.isSamePath(config.destJsDir, path)
  );
}

function doWebpack() {
  return new Promise((resolve, reject) => {
    webpack(
      webpackConfig,
      (err: Error | undefined, stats: Stats | undefined) => {
        if (!stats) {
          throw new Error("MDN-BOB: Stats were not delivered by webpack");
        }

        const statsJson = stats.toJson();

        if (err || stats.hasErrors()) {
          if (err) {
            throw err;
          }
          reject(statsJson.errors);
        }

        if (statsJson.warnings) {
          for (const warn of statsJson.warnings) {
            console.warn("Webpack Warning: " + warn.message);
          }
        }

        resolve(undefined);
      }
    );
  });
}

/**
 * Initialization of the module. Calls the follow on functions to generate the pages.
 */
async function init() {
  try {
    const config = getConfig();

    console.info(`MDN-BOB: Cleaning or creating ${config.baseDir}....`);
    cleanBaseDir(config);

    console.info("MDN-BOB: Copying static assets....");
    utils.copyStaticAssets();

    if (config.doWebPack) {
      console.info("MDN-BOB: Running Webpack...");
      await doWebpack();
    } else {
      console.warn(
        "MDN-BOB: Skipped compilation of base JS & CSS shared by all examples"
      );
    }

    console.info("MDN-BOB: Building height-data");
    buildHeightData();
    console.info("MDN-BOB: Height Data was successfully constructed");

    console.info("MDN-BOB: Building pages....");
    console.log(await pageBuilder.buildPages());

    console.info("MDN-BOB: Build completed successfully");
  } catch (error) {
    console.error("MDN-BOB: (mdn-bob.js/@init) Error during build:", error);
    process.exit(2);
  }
}

await init();
