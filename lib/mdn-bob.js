#!/usr/bin/env node

const fse = require("fs-extra");

const bundler = require("./bundler");
const getConfig = require("./config");
const pageBuilder = require("./pageBuilder");
const utils = require("./utils");

/**
 * Initialization of the module. Calls the follow on functions to generate the pages.
 */
function init() {
  const config = getConfig();

  console.info(`MDN-BOB: Cleaning or creating ${config.baseDir}....`);
  // empty or create `config.baseDir`
  fse.emptyDirSync(config.baseDir);

  console.info("MDN-BOB: Copying static assets....");
  utils.copyStaticAssets();

  console.info("MDN-BOB: Compiling editor JavaScript....");
  const promises = bundler.processAndWrite();

  Promise.all(promises).then(
    (values) => {
      values.forEach((value) => {
        console.info("MDN-BOB: ", value);
      });

      pageBuilder
        .buildPages()
        .then((result) => {
          console.info(result);
          return bundler.buildBundles();
        })
        .then((result) => {
          console.info(result);
          return utils.removeJSBundles();
        })
        .then((result) => {
          console.info(result);
          console.info("MDN-BOB: Build completed successfully");
        })
        .catch((error) => {
          console.error(
            "MDN-BOB: (mdn-bob.js/@init) Error during build:",
            error
          );
          process.exit(2);
        });
    },
    (reason) => {
      console.error(`MDN-BOB: (bundler.js/@compileJS) ${reason}`);
      process.exit(1);
    }
  );
}

init();
