const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const fse = require("fs-extra");
const glob = require("glob");

const getConfig = require("./config");
const pageBuilderUtils = require("./pageBuilderUtils");
const processor = require("./processor");
const tabbedPageBuilder = require("./tabbedPageBuilder");

const config = getConfig();

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
  for (let page in pages) {
    let currentPage = pages[page];
    let cssSource = currentPage.cssExampleSrc;
    let jsSource = currentPage.jsExampleSrc;
    let type = currentPage.type;
    let tmpl = pageBuilderUtils.getPageTmpl(type);
    let outputHTML = "";

    const outputPath =
      config.pagesDir + currentPage.type + "/" + currentPage.fileName;

    // Inject the cache buster
    tmpl = pageBuilderUtils.setCacheBuster(`?v=${selfVersion}`, tmpl);

    // handle both standard and webapi tabbed examples
    if (type.indexOf("tabbed") > -1) {
      fse.outputFileSync(
        outputPath,
        tabbedPageBuilder.buildTabbedExample(tmpl, currentPage)
      );
    } else {
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

      const exampleCode = processor.processExampleCode(
        currentPage.type,
        currentPage.exampleCode
      );

      outputHTML = tmpl.replace("%example-code%", () => exampleCode);

      fse.outputFileSync(outputPath, outputHTML);
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
    ...glob.sync(path.join(root, "lib", "**", "*.js")),
    // And every every other file too
    ...glob.sync(path.join(root, "editor", "**", "*.js")),
    ...glob.sync(path.join(root, "editor", "**", "*.css")),
    ...glob.sync(path.join(root, "editor", "**", "*.html")),
  ];
  const hasher = crypto.createHash("md5");
  filepaths
    .map((fp) => fs.readFileSync(fp, "utf8"))
    .forEach((content) => hasher.update(content));
  return hasher.digest("hex").slice(0, length);
}

/**
 * Iterates over all `meta.json` files. For each file,
 * it passes the list of pages to the `build` function.
 */
function buildPages() {
  const selfVersion = getSelfVersion();
  return new Promise((resolve, reject) => {
    const metaJSONArray = glob.sync(config.metaGlob, {});

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

module.exports = {
  buildPages,
};
