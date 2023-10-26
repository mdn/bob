import CleanCSS from "clean-css";
import fse from "fs-extra";
import uglify from "uglify-js";
import getConfig from "./config.js";
import path from "node:path";
import { JSPageHeight, WATPageHeight } from "../types/types";

const config = getConfig();
const basePath = path.resolve("");

const MAX_LINE_COUNT_OF_SHORT_JS_EXAMPLES = 7;
const MIN_LINE_COUNT_OF_TALL_JS_EXAMPLES = 14;
const MAX_LINE_COUNT_OF_SHORT_WAT_EXAMPLES = 7;
const MIN_LINE_COUNT_OF_TALL_WAT_EXAMPLES = 12;

/**
 * A super simple preprocessor that converts < to &lt;
 * @param html - The HTML as a string
 * @return The processed HTML
 */
export function preprocessHTML(html: string) {
  const re = /</g;
  return html.replace(re, "&lt;");
}

/**
 * Minifies the CSS and writes the minified code back to disk
 */
function preprocessCSS(sourceFilePath: string) {
  const source = fse.readFileSync(sourceFilePath, "utf8");
  const minified = minifyCSS(source, sourceFilePath);
  fse.outputFileSync(config.baseDir + sourceFilePath, minified);
}

export function minifyCSS(source: string, sourceFilePath: string) {
  // We need to change the current working path, so @import will be relative to the sourceFilePath
  // Version 5.3.2 of CleanCSS doesn't provide any config to set the base path
  const sourceFileDirectory = path.dirname(sourceFilePath);
  const absoluteSourcePath = path.resolve(sourceFileDirectory);
  process.chdir(absoluteSourcePath);

  const minified = new CleanCSS().minify(source);

  // Changing back current working path
  process.chdir(basePath);
  return minified.styles;
}

/**
 * Uglifies the JS and writes the uglified code back to disk
 */
function preprocessJS(sourceFilePath: string) {
  const source = fse.readFileSync(sourceFilePath, "utf8");
  const minified = uglify.minify(source).code;
  fse.outputFileSync(config.baseDir + sourceFilePath, minified);
}

/**
 * Sends the CSS source to `preprocessCSS`. Override the `%example-css-src%` string
 * with the appropriate link element, setting the value for `href`
 * @param tmpl - The template as a string
 * @param source - The source filepath
 * @returns tmpl - The modified template string
 */
function processCSSInclude(tmpl: string, source: string) {
  preprocessCSS(source);
  // inject the link tag into the source
  return tmpl.replace(
    "%example-css-src%",
    `<link rel="stylesheet" href="../../${source}" />`,
  );
}

/**
 * Sends the JS source to `preprocessJS`. Override the `%example-js-src%` string
 * with the appropriate `script` element, setting the value for `src`
 * @param tmpl - The template as a string
 * @param source - The source filepath
 * @returns tmpl - The modified template string
 */
function processJSInclude(tmpl: string, source: string) {
  preprocessJS(source);
  // inject the script tag into the source
  return tmpl.replace(
    "%example-js-src%",
    `<script src="../../${source}"></script>`,
  );
}

/**
 * Calls the appropriate processor function based on type
 * @param type - A value of `js` or `css`
 * @param tmpl - The template as a string
 * @param source - The source filepath
 * @returns tmpl - The modified template string
 */
export function processInclude(
  type: "js" | "css",
  tmpl: string,
  source: string,
) {
  return type === "css"
    ? processCSSInclude(tmpl, source)
    : processJSInclude(tmpl, source);
}

/**
 * Returns the height of the example block based on the line count
 * @param lineCount - Count of lines in the source code
 * @returns height - the value of the data-height property
 */
function getJSExampleHeightByLineCount(lineCount: number): JSPageHeight {
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
 * @param exampleCode - The example source code itself
 * @returns jsExample - The example wrapped into code tag
 */
function preprocessJSExample(exampleCode: string) {
  const height = getHeightByLineCount(
    exampleCode,
    getJSExampleHeightByLineCount,
  );
  return `<pre><code id="static-js" data-height="${height}">${exampleCode}</code></pre>`;
}

/**
 * Returns BOB class name used for setting height for JavaScript interactive example present at provided path
 * @param sourcePath - Path to JS example source code. For example: 'pages/tabbed/header.html'
 * @return height - BOB class name used for setting height
 */
export function getJSPageHeight(sourcePath: string) {
  const exampleCode = fse.readFileSync(sourcePath, "utf8");
  return getHeightByLineCount(exampleCode, getJSExampleHeightByLineCount);
}

/**
 * Returns the height of the example block based on the line count
 * @param lineCount - Count of lines in the source code
 * @returns height - the value of the data-height property
 */
function getWatExampleHeightByLineCount(lineCount: number): WATPageHeight {
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
 * @param watCode - The example wat source code itself
 * @param jsCode - The example JavaScript source code itself
 * @returns jsExample - The examples wrapped into code tag
 */
function preprocessWatExample(watCode: string, jsCode: string) {
  const height = getHeightByLineCount(watCode, getWatExampleHeightByLineCount);
  return `
        <pre><code id="static-wat" data-height="${height}">${watCode}</code></pre>
        <pre><code id="static-js" data-height="${height}">${jsCode}</code></pre>
    `;
}

/**
 * Returns BOB class name used for setting height for WAT interactive example present at provided path
 * @param sourcePath - Path to WAT example source code. For example: 'pages/tabbed/header.html'
 * @return height - BOB class name used for setting height
 */
export function getWatPageHeight(watSrc: string) {
  const watCode = fse.readFileSync(watSrc, "utf8");
  return getHeightByLineCount(watCode, getWatExampleHeightByLineCount);
}

/**
 * Counts amount of lines in provided source code, executes provided function with that amount as an argument and returns result of that function
 * @param sourceCode
 * @param linesToHeightFunc - function accepting amount of lines as an argument and returning BOB class name used for setting height
 * @return {String} - BOB class name used for setting height
 */
function getHeightByLineCount<T extends string>(
  sourceCode: string,
  linesToHeightFunc: (lineCount: number) => T,
): T {
  const lineCount = (sourceCode.match(/\n/g) || []).length + 1;
  return linesToHeightFunc(lineCount);
}

/**
 * Process JS example which has written in HTML.
 * @param exampleCode - The example source code itself
 * @param path - path of the example code
 *
 * @returns jsExample - The example wrapped into code tag
 *
 * @deprecated
 */
function handleDeprecatedJSExampleFormat(exampleCode: string, path: string) {
  console.warn(
    `MDN-BOB: (processor.js/processExampleCode) HTML source files are deprecated for JS examples. (${path})`,
  );
  return exampleCode;
}

/**
 * Loads content and preprocesses JS code example
 * @param sourcePath - The path of the source code
 * @returns example - The embeddable example
 */
export function processJsExample(sourcePath: string) {
  const exampleCode = getExampleCode(sourcePath);
  return sourcePath.endsWith(".js")
    ? preprocessJSExample(exampleCode)
    : handleDeprecatedJSExampleFormat(exampleCode, sourcePath);
}

export function getExampleCode(sourcePath: string) {
  return fse.readFileSync(sourcePath, "utf8");
}

/**
 * Process the example source code, based on its type.
 * @param watSrc - The path of the wat source code
 * @param jsSrc - The path of the JavaScript source code
 * @returns example - The embeddable example
 */
export function processWat(watSrc: string, jsSrc: string) {
  const watCode = fse.readFileSync(watSrc, "utf8");
  const jsCode = fse.readFileSync(jsSrc, "utf8");
  return preprocessWatExample(watCode, jsCode);
}
