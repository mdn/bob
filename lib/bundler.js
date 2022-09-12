import browserify from "browserify";
import CleanCSS from "clean-css";
import esmify from "esmify";
import fs from "node:fs";
import fse from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import uglify from "uglify-es";
import getConfig from "./config.js";
import * as utils from "./utils.js";

const config = getConfig();

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * Takes an array of paths and return the resolved
 * paths using a combination of `path.join` and `__dirname`
 * @param {Array} filePaths - Array of file paths
 * @returns Array of correctly resolved file paths
 */
function getFullPaths(filePaths) {
  return filePaths.map((file) => {
    if (file.startsWith("/")) {
      return path.join(process.cwd(), file);
    } else {
      return path.join(__dirname, file);
    }
  });
}

/**
 * Minifies the source code and writes the result to disk
 * @param {String} type - The type of source i.e. css or js
 * @param {String} source - The source code to minify and write
 * @param {String} fileName - The output file name
 */
function minifyAndWriteFile(type, source, fileName) {
  if (type === "js") {
    let uglified = uglify.minify(source);
    try {
      fse.outputFileSync(config.destJsDir + fileName + ".js", uglified.code);
    } catch (error) {
      console.error("MDN-BOB: Error writing JS bundle to disk", error);
      throw error;
    }
  } else if (type === "css") {
    let minified = new CleanCSS().minify(source);
    try {
      fse.outputFileSync(
        config.destCssDir + fileName + ".css",
        minified.styles
      );
    } catch (error) {
      console.error("MDN-BOB: Error writing CSS bundle to disk", error);
      throw error;
    }
  }
}

/** Do what https://www.npmjs.com/package/concat but all synchronous.
 * Return a string of the finished string.
 *
 * @param {[String]} paths - file paths all expected to exist and be able to read
 */
function concatSync(paths, delimiter = "\n") {
  return paths.map((fp) => fs.readFileSync(fp, "utf8")).join(delimiter);
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

  let result = concatSync(resolvedPaths);
  minifyAndWriteFile(type, result, fileName);
}

/**
 * Traverse the list of bundles, and uses the data to generate the final
 * CSS and JavaScript bundles to `/docs/[css|js]`
 * @returns {Object} A `Promise` that will resolve if all bundles are built successfully
 */
export function buildBundles() {
  return new Promise((resolve, reject) => {
    fse
      .readJson(path.join(__dirname, config.bundleConfig))
      .then((bundles) => {
        const editorBundles = bundles.bundles;
        for (let bundle in editorBundles) {
          let currentBundle = editorBundles[bundle];
          let currentFilename = currentBundle.destFileName;

          if (currentBundle.javascript) {
            buildBundle("js", currentFilename, currentBundle.javascript);
          }
          if (currentBundle.css) {
            buildBundle("css", currentFilename, currentBundle.css);
          }
        }
        resolve("MDN-BOB: Bundles built successfully");
      })
      .catch(reject);
  });
}

/**
 * Queue up an array of promises that will be resolved once all
 * files have been processed, and written to disk.
 * @returns {Array} An array of promises
 */
export function processAndWrite() {
  const entryFiles = config.editorBundles.split(",");
  let filePromises = [];

  for (let file in entryFiles) {
    let promise = new Promise((resolve, reject) => {
      let currentFile = entryFiles[file];
      let outputBaseFileName = currentFile.substr(
        0,
        currentFile.indexOf(".js")
      );
      let outputFilename = `${outputBaseFileName}-bundle.js`;
      let writableOutputFile = fs.createWriteStream(
        path.join(__dirname, outputFilename)
      );

      try {
        let reader = browserify(path.join(__dirname, entryFiles[file]), {
          plugin: [esmify],
        }).bundle();
        reader.pipe(writableOutputFile);
        reader.on("end", () => {
          resolve(`${outputFilename} written to disk`);
        });
      } catch (error) {
        reject(Error("MDN-BOB: (bundler.js/@compileJS) Error compiling JS"));
      }
    });
    filePromises.push(promise);
  }
  return filePromises;
}
