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
  const config = getConfig();

  console.info(`MDN-BOB: Cleaning or creating ${config.baseDir}....`);
  // empty or create `config.baseDir`
  await fse.emptyDir(config.baseDir);

  console.info("MDN-BOB: Copying static assets....");
  utils.copyStaticAssets();

  console.info("MDN-BOB: Compiling editor JavaScript....");
  const promises = bundler.processAndWrite();

  try {
    const values = await Promise.all(promises);

    values.forEach((value) => {
      console.info("MDN-BOB: ", value);
    });

    try {
      console.log(await pageBuilder.buildPages());

      console.log(await bundler.buildBundles());

      console.log(await utils.removeJSBundles());

      console.info("MDN-BOB: Build completed successfully");
    } catch (error) {
      console.error("MDN-BOB: (mdn-bob.js/@init) Error during build:", error);
      process.exit(2);
    }
  } catch (reason) {
    console.error(`MDN-BOB: (bundler.js/@compileJS) ${reason}`);
    process.exit(1);
  }
}

await init();
