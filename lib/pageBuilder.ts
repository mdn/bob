import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fse from "fs-extra";
import getConfig from "./config.js";
import { globSyncNoEscape } from "./utils.js";
import * as pageBuilderUtils from "./pageBuilderUtils.js";
import * as processor from "./processor.js";
import * as tabbedPageBuilder from "./tabbedPageBuilder.js";

const config = getConfig();
const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * Traverse the list of pages, and uses the meta data to generate the final
 * HTML source documents to `/docs/pages/[css|js]`
 * @param {object} pages - An object containing directives for building the pages
 *
 * Example object:
 *
 * "borderTopColor": {
 *     "baseTmpl": "editor/tmpl/live-css-tmpl.html",
 *     "cssExampleSrc": "live-examples/css-examples/css/border-top-color.css",
 *     "exampleCode": "live-examples/css-examples/border-top-color.html",
 *     "fileName": "border-top-color.html",
 *     "type": "css"
 * }
 *
 */
function build(pages, selfVersion = "") {
  for (const page in pages) {
    const currentPage = pages[page];
    const cssSource = currentPage.cssExampleSrc;
    const jsSource = currentPage.jsExampleSrc;
    const type = currentPage.type;
    let tmpl = pageBuilderUtils.getPageTmpl(type);
    let outputHTML = "";
    let exampleCode;

    const outputPath =
      config.pagesDir + currentPage.type + "/" + currentPage.fileName;

    // Inject the cache buster
    tmpl = pageBuilderUtils.setCacheBuster(`?v=${selfVersion}`, tmpl);

    // handle both standard and webapi tabbed examples
    switch (type) {
      case "tabbed":
      case "webapi-tabbed":
      case "mathml":
        fse.outputFileSync(
          outputPath,
          tabbedPageBuilder.buildTabbedExample(tmpl, currentPage)
        );
        break;
      case "wat":
        // set main title
        tmpl = pageBuilderUtils.setMainTitle(currentPage, tmpl);

        exampleCode = processor.processWat(
          currentPage.watExampleCode,
          currentPage.jsExampleCode
        );

        outputHTML = tmpl.replace("%example-code%", () => exampleCode);

        fse.outputFileSync(outputPath, outputHTML);
        break;
      case "css":
      case "js":
        // is there a linked CSS file
        if (cssSource) {
          // inject the link tag into the source
          tmpl = processor.processInclude("css", tmpl, cssSource);
        } else {
          // clear out the template string
          tmpl = tmpl.replace("%example-css-src%", "");
        }

        // is there a linked JS file
        if (jsSource) {
          // inject the script tag into the source
          tmpl = processor.processInclude("js", tmpl, jsSource);
        } else {
          // clear out the template string
          tmpl = tmpl.replace("%example-js-src%", "");
        }

        // set main title
        tmpl = pageBuilderUtils.setMainTitle(currentPage, tmpl);

        exampleCode = processor.processExampleCode(
          currentPage.type,
          currentPage.exampleCode
        );

        outputHTML = tmpl.replace("%example-code%", () => exampleCode);

        fse.outputFileSync(outputPath, outputHTML);
        break;
    }
  }
}

/**
 * Return a (short) string that indicates what verion of this tool we're
 * running. Because the `package.json` doesn't necessarily change between
 * versions we need to gather both from that and from the relevant .js files.
 */
function getSelfVersion(length = 7) {
  const root = path.resolve(__dirname, "..");
  const filepaths = [
    path.join(root, "package.json"),
    // This is broad but let's make it depend on every .js file
    // in this file's folder
    ...globSyncNoEscape(path.join(root, "lib", "**", "*.js")),
    // And every every other file too
    ...globSyncNoEscape(path.join(root, "editor", "**", "*.js")),
    ...globSyncNoEscape(path.join(root, "editor", "**", "*.css")),
    ...globSyncNoEscape(path.join(root, "editor", "**", "*.html")),
  ];
  const hasher = crypto.createHash("sha256");
  filepaths
    .map((fp) => fs.readFileSync(fp, "utf8"))
    .forEach((content) => hasher.update(content));
  return hasher.digest("hex").slice(0, length);
}

/**
 * Iterates over all `meta.json` files. For each file,
 * it passes the list of pages to the `build` function.
 */
export function buildPages() {
  const selfVersion = getSelfVersion();
  return new Promise((resolve, reject) => {
    const metaJSONArray = globSyncNoEscape(config.metaGlob);

    for (const metaJson of metaJSONArray) {
      const file = fse.readJsonSync(metaJson);
      try {
        build(file.pages, selfVersion);
      } catch (error) {
        console.error(
          `MDN-BOB: (pageBuilder.js/@buildPages) Error while building pages ${metaJson}: ${error}`
        );
        reject(
          Error(
            `MDN-BOB: (pageBuilder.js/@buildPages) Error while building pages: ${metaJson}: ${error}`
          )
        );
      }
    }
    resolve("MDN-BOB: Pages built successfully");
  });
}
