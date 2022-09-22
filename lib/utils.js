import dir from "node-dir";
import fse from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import getConfig from "./config.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

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
