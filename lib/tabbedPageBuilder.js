import fse from "fs-extra";
import * as pageBuilderUtils from "./pageBuilderUtils.js";
import * as processor from "./processor.js";

/**
 * Replace the template tag with the CSS source, or an empty string
 * @param {Object} currentPage - The current page as an Object
 * @param {String} tmpl - The template as a string
 * @returns the processed template string
 */
function addCSS(currentPage, tmpl) {
  if (currentPage.cssExampleSrc) {
    tmpl = tmpl.replace(
      "%example-css-src%",
      fse.readFileSync(currentPage.cssExampleSrc, "utf8")
    );
  } else {
    tmpl.replace("%example-css-src%", "");
  }

  return tmpl;
}

/**
 * Replace the template tag with the preprocessed HTML source
 * @param {Object} currentPage - The current page as an Object
 * @param {String} tmpl - The template as a string
 * @returns the processed template string
 */
function addHTML(currentPage, tmpl) {
  const exampleCode = fse.readFileSync(currentPage.exampleCode, "utf8");
  const processedHTML = processor.preprocessHTML(exampleCode);
  return tmpl.replace("%example-code%", () => processedHTML);
}

/**
 * Replace the template tag with the JavaScript source, or an empty string
 * @param {Object} currentPage - The current page as an Object
 * @param {String} tmpl - The template as a string
 * @returns the processed template string
 */
function addJS(currentPage, tmpl) {
  if (currentPage.jsExampleSrc) {
    tmpl = tmpl.replace(
      "%example-js-src%",
      fse.readFileSync(currentPage.jsExampleSrc, "utf8")
    );
  } else {
    tmpl = tmpl.replace("%example-js-src%", "");
  }

  return tmpl;
}

/**
 * Builds and returns the HTML source for a tabbed example
 * @param {String} tmpl - The template as a string
 * @param {Object} currentPage - The currentPage meta data as an Object
 * @returns {String} The HTML for a tabbed example
 */
export function buildTabbedExample(tmpl, currentPage) {
  // set main title
  tmpl = pageBuilderUtils.setMainTitle(currentPage, tmpl);
  // set the height of the editor container
  tmpl = pageBuilderUtils.setEditorHeight(currentPage, tmpl);
  // set the active tabs to show
  tmpl = pageBuilderUtils.setActiveTabs(currentPage, tmpl);
  // set the default tab to open
  tmpl = pageBuilderUtils.setDefaultTab(currentPage, tmpl);
  // set the console state
  tmpl = pageBuilderUtils.setConsoleState(currentPage, tmpl);

  // add the example CSS
  tmpl = addCSS(currentPage, tmpl);
  // add the example HTML
  tmpl = addHTML(currentPage, tmpl);
  // add the example JS
  tmpl = addJS(currentPage, tmpl);
  return tmpl;
}
