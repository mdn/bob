import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fse from "fs-extra";
import glob from "glob";
import getConfig from "./config.js";
import * as pageBuilderUtils from "./pageBuilderUtils.js";
import * as processor from "./processor.js";
import * as tabbedPageBuilder from "./tabbedPageBuilder.js";
import { MetaFile, MetaPage, MetaPages } from "../types/types";
import { getExampleCode } from "./processor.js";

const config = getConfig();
const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * Traverse the list of pages, and uses the meta data to generate the final
 * HTML source documents to `/docs/pages/[css|js]`
 * @param pages - An object containing directives for building the pages
 * @param selfVersion - Editor version, used for cache busting
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
function build(pages: MetaPages, selfVersion = "") {
  for (const page in pages) {
    const currentPage = pages[page];
    const tmpl = pageBuilderUtils.getPageTmpl(currentPage.type);

    const outputPath =
      config.pagesDir + currentPage.type + "/" + currentPage.fileName;

    const filledTmpl = fillPageTemplate(tmpl, currentPage, selfVersion);

    fse.outputFileSync(outputPath, filledTmpl);
  }
}

function fillPageTemplate(
  tmpl: string,
  currentPage: MetaPage,
  selfVersion: string
) {
  const type = currentPage.type;

  // Inject the cache buster
  tmpl = pageBuilderUtils.setCacheBuster(`?v=${selfVersion}`, tmpl);

  let exampleCode: string;

  switch (type) {
    case "tabbed":
    case "webapi-tabbed":
    case "mathml":
      return tabbedPageBuilder.buildTabbedExample(currentPage, tmpl);
    case "wat":
      // set main title
      tmpl = pageBuilderUtils.setMainTitle(currentPage, tmpl);

      exampleCode = processor.processWat(
        currentPage.watExampleCode,
        currentPage.jsExampleCode
      );

      return tmpl.replace("%example-code%", () => exampleCode);
    case "css":
      // set main title
      tmpl = pageBuilderUtils.setMainTitle(currentPage, tmpl);

      // is there a linked CSS file
      if (currentPage.cssExampleSrc) {
        // inject the link tag into the source
        tmpl = processor.processInclude("css", tmpl, currentPage.cssExampleSrc);
      } else {
        // clear out the template string
        tmpl = tmpl.replace("%example-css-src%", "");
      }

      // is there a linked JS file
      if (currentPage.jsExampleSrc) {
        // inject the script tag into the source
        tmpl = processor.processInclude("js", tmpl, currentPage.jsExampleSrc);
      } else {
        // clear out the template string
        tmpl = tmpl.replace("%example-js-src%", "");
      }

      exampleCode = getExampleCode(currentPage.exampleCode);

      return tmpl.replace("%example-code%", () => exampleCode);
    case "js":
      // set main title
      tmpl = pageBuilderUtils.setMainTitle(currentPage, tmpl);

      exampleCode = processor.processJsExample(currentPage.exampleCode);

      return tmpl.replace("%example-code%", () => exampleCode);
  }
}

/**
 * Return a (short) string that indicates what version of this tool we're
 * running. Because the `package.json` doesn't necessarily change between
 * versions we need to gather both from that and from the relevant .js files.
 */
function getSelfVersion(length = 7) {
  const root = path.resolve(__dirname, "..");
  const filepaths = [
    path.join(root, "package.json"),
    // This is broad but let's make it depend on every .js file
    // in this file's folder
    ...glob.sync(path.join(root, "lib", "**", "*.js")),
    // And every every other file too
    ...glob.sync(path.join(root, "editor", "**", "*.js")),
    ...glob.sync(path.join(root, "editor", "**", "*.css")),
    ...glob.sync(path.join(root, "editor", "**", "*.html")),
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
    const metaJSONArray = glob.sync(config.metaGlob, {});

    for (const metaJson of metaJSONArray) {
      const file = fse.readJsonSync(metaJson) as MetaFile;
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
