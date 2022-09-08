import dir from "node-dir";
import fse from "fs-extra";
import path from "path";
import getConfig from "./config.js";

/**
 * Copies all assets recursively in `sourceDir` to the directory specified as `destDir`
 * @param {string} sourceDir - The root relative path to the directory containing assets
 * @param {string} destDir - The root relative path to the directory to copy the assets to
 */
export function copyDirectory(sourceDir, destDir) {
  fse.copySync(sourceDir, destDir, {
    filter: (src) => {
      return ![".DS_Store"].includes(path.basename(src));
    },
  });
}

/**
 * Copies editor and examples static assets
 */
export function copyStaticAssets() {
  const config = getConfig();
  // copy editor static assets
  copyDirectory(
    path.join(__dirname, config.editorMediaRoot),
    config.editorMediaDest
  );

  // copy examples static assets
  copyDirectory(config.examplesMediaRoot, config.examplesMediaDest);

  // copy fonts
  copyDirectory(config.examplesFontsRoot, config.fontsMediaDest);
}

/**
 * Utility function that checks whether the specified directory exists.
 * If not, it creates the directory
 * @param {string} dir - Project root relative path to directory
 */
export function ensureDir(dir) {
  // if the target directory does not exist
  if (!fse.pathExistsSync(dir)) {
    // create it now
    fse.ensureDirSync(dir);
  }
}

/**
 * As a last step, this deletes the JS bundles that was
 * built earlier in the build process.
 */
export function removeJSBundles() {
  return new Promise((resolve, reject) => {
    let bundlesArray = [
      path.join(__dirname, "../editor/js/editable-css-bundle.js"),
      path.join(__dirname, "../editor/js/editable-js-bundle.js"),
      path.join(__dirname, "../editor/js/editable-wat-bundle.js"),
      path.join(__dirname, "../editor/js/editor-bundle.js"),
    ];

    for (let bundle in bundlesArray) {
      try {
        fse.pathExists(bundlesArray[bundle]).then(function () {
          fse.removeSync(bundlesArray[bundle]);
        });
      } catch (error) {
        Error("MDN-BOB: (utils.js/@removeJSBundles) Error during cleanup");
      }
    }
    resolve("MDN-BOB: Cleanup completed successfully");
  });
}
