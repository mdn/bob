import CleanCSS from "clean-css";
import fse from "fs-extra";
import uglify from "uglify-es";
import getConfig from "./config.js";

const config = getConfig();

const MAX_LINE_COUNT_OF_SHORT_JS_EXAMPLES = 7;
const MIN_LINE_COUNT_OF_TALL_JS_EXAMPLES = 14;
const MAX_LINE_COUNT_OF_SHORT_WAT_EXAMPLES = 7;
const MIN_LINE_COUNT_OF_TALL_WAT_EXAMPLES = 12;

/**
 * A super simple preprocessor that converts < to &lt;
 * @param {String} html - The HTML as a string
 * @return The processed HTML
 */
export function preprocessHTML(html) {
  const re = /</g;
  return html.replace(re, "&lt;");
}

/**
 * Minifies the CSS and writes the minified code back to disk
 * @param {String} source - The source filepat
 */
function preprocessCSS(source) {
  const minified = new CleanCSS().minify(
    fse.readFileSync(source, "utf8")
  ).styles;
  fse.outputFileSync(config.baseDir + source, minified);
}

/**
 * Uglifies the JS and writes the uglified code back to disk
 * @param {String} source - The source filepat
 */
function preprocessJS(source) {
  const minified = uglify.minify(fse.readFileSync(source, "utf8")).code;
  fse.outputFileSync(config.baseDir + source, minified);
}

/**
 * Sends the CSS source to `preprocessCSS`. Overrite the `%example-css-src%` string
 * with the appropriate link element, setting the value for `href`
 * @param {String} tmpl - The template as a string
 * @param {String} source - The source filepath
 * @returns tmpl - The modified template string
 */
function processCSSInclude(tmpl, source) {
  preprocessCSS(source);
  // inject the link tag into the source
  return tmpl.replace(
    "%example-css-src%",
    `<link rel="stylesheet" href="../../${source}" />`
  );
}

/**
 * Sends the JS source to `preprocessJS`. Overrite the `%example-js-src%` string
 * with the appropriate `script` element, setting the value for `src`
 * @param {String} tmpl - The template as a string
 * @param {String} source - The source filepath
 * @returns tmpl - The modified template string
 */
function processJSInclude(tmpl, source) {
  preprocessJS(source);
  // inject the script tag into the source
  return tmpl.replace(
    "%example-js-src%",
    `<script src="../../${source}"></script>`
  );
}

/**
 * Calls the appropriate processor function based on type
 * @param {String} type - A value of `js` or `css`
 * @param {String} tmpl - The template as a string
 * @param {String} source - The source filepath
 * @returns tmpl - The modified template string
 */
export function processInclude(type, tmpl, source) {
  return type === "css"
    ? processCSSInclude(tmpl, source)
    : processJSInclude(tmpl, source);
}

/**
 * Returns the height of the example block based on the line count
 * @param {Number} lineCount - Count of lines in the source code
 * @returns height - the value of the data-height property
 */
function getJSExampleHeightByLineCount(lineCount) {
  if (lineCount <= MAX_LINE_COUNT_OF_SHORT_JS_EXAMPLES) {
    return "shorter";
  }

  if (lineCount >= MIN_LINE_COUNT_OF_TALL_JS_EXAMPLES) {
    return "taller";
  }
  return "";
}

/**
 * Process the example source code, based on its type.
 * @param {String} exampleCode - The example source code itself
 * @returns {String} jsExample - The example wrapped into code tag
 */
function preprocessJSExample(exampleCode) {
  const lineCount = (exampleCode.match(/\n/g) || []).length + 1;
  const height = getJSExampleHeightByLineCount(lineCount);
  return `<pre><code id="static-js" data-height="${height}">${exampleCode}</code></pre>`;
}

/**
 * Returns the height of the example block based on the line count
 * @param {Number} lineCount - Count of lines in the source code
 * @returns height - the value of the data-height property
 */
function getWatExampleHeightByLineCount(lineCount) {
  if (lineCount <= MAX_LINE_COUNT_OF_SHORT_WAT_EXAMPLES) {
    return "shorter";
  }

  if (lineCount >= MIN_LINE_COUNT_OF_TALL_WAT_EXAMPLES) {
    return "taller";
  }

  return "standard";
}

/**
 * Process the example source code, based on its type.
 * @param {String} watCode - The example wat source code itself
 * @param {String} jsCode - The example JavaScript source code itself
 * @returns {String} jsExample - The examples wrapped into code tag
 */
function preprocessWatExample(watCode, jsCode) {
  const lineCount = (watCode.match(/\n/g) || []).length + 1;
  const height = getWatExampleHeightByLineCount(lineCount);
  return `
        <pre><code id="static-wat" data-height="${height}">${watCode}</code></pre>
        <pre><code id="static-js" data-height="${height}">${jsCode}</code></pre>
    `;
}

/**
 * Process JS example which has written in HTML.
 * @param {String} exampleCode - The example source code itself
 * @param {String} path - path of the example code
 *
 * @returns {String} jsExample - The example wrapped into code tag
 *
 * @deprecated
 */
function handleDeprecatedJSExampleFormat(exampleCode, path) {
  console.warn(
    `MDN-BOB: (processor.js/processExampleCode) HTML source files are deprecated for JS examples. (${path})`
  );
  return exampleCode;
}

/**
 * Process the example source code, based on its type.
 * @param {String} type - `html`, `js`, or `css`
 * @param {String} sourcePath - The path of the source code
 * @returns {String} example - The embeddable example
 */
export function processExampleCode(type, sourcePath) {
  const exampleCode = fse.readFileSync(sourcePath, "utf8");
  switch (type) {
    case "html":
      return preprocessHTML(exampleCode);
    case "css":
      return exampleCode;
    case "js":
      return sourcePath.endsWith(".js")
        ? preprocessJSExample(exampleCode)
        : handleDeprecatedJSExampleFormat(exampleCode, sourcePath);
    default:
      return "";
  }
}

/**
 * Process the example source code, based on its type.
 * @param {String} watSrc - The path of the wat source code
 * @param {String} jsSrc - The path of the JavaScript source code
 * @returns {String} example - The embeddable example
 */
export function processWat(watSrc, jsSrc) {
  const watCode = fse.readFileSync(watSrc, "utf8");
  const jsCode = fse.readFileSync(jsSrc, "utf8");
  return preprocessWatExample(watCode, jsCode);
}
