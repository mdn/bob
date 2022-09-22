#!/usr/bin/env node

import fse from "fs-extra";
import * as bundler from "./bundler.js";
import getConfig from "./config.js";
import * as pageBuilder from "./pageBuilder.js";
import * as utils from "./utils.js";

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

    console.info("MDN-BOB: Building pages....");
    console.log(await pageBuilder.buildPages());

    console.info("MDN-BOB: Creating CodeMirror bundles....");
    console.log(await bundler.buildBundles());

    console.info("MDN-BOB: Build completed successfully");
  } catch (error) {
    console.error("MDN-BOB: (mdn-bob.js/@init) Error during build:", error);
    process.exit(2);
  }
}

await init();
