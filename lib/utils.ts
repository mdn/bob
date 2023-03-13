import fse from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import getConfig from "./config.js";
import { globSync } from "glob";

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
 * Compares both arguments after trimming and removing end slash
 */
export function isSamePath(p1, p2) {
  const removeEndSlash = (path) => {
    if (path.endsWith("/")) {
      return path.substring(0, path.length - 1);
    }
    return path;
  };

  const normalize = (path) => removeEndSlash(path.trim());

  return normalize(p1) == normalize(p2);
}

/**
 * Performs synchronous glob search for the specified pattern and returns an array of absolute paths that were found
 */
export function globSyncNoEscape(shellPath: string) {
  return globSync(shellPath, {
    windowsPathsNoEscape: true,
  });
}
