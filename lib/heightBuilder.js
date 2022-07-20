import fse from "fs-extra";
import glob from "glob";

import getConfig from "./config.js";
import { getJSPageHeight, getWatPageHeight } from "./processor.js";

const config = getConfig();

/**
 * Converts content of meta.json to object containing path and height of every interactive example present in that file
 *
 * In case meta.json is missing required height property or it has unsupported value, record is skipped
 * @param metaContent - Content of meta.json as an JS object
 */
function getPagesHeightData(metaContent) {
  const pages = Object.values(metaContent.pages);
  const heightData = {};

  for (const page of pages) {
    const height = getPageHeight(page);
    if (height !== undefined) {
      const path = getPagePath(page);
      heightData[path] = height;
    }
  }
  return heightData;
}

function getPagePath(page) {
  return `pages/${page.type}/${page.fileName}`;
}

/**
 * Returns YARI class name used for setting height of interactive example provided as an argument in form of an object which can be found in meta.json files
 * @param page - Object describing single interactive example
 * @return {String|undefined} height - YARI class name used for setting height of interactive example
 */
function getPageHeight(page) {
  if (page.height !== undefined) {
    return page.height;
  }
  let jsHeight;

  switch (page.type) {
    case "css":
      return "default"; // All examples have the same height
    case "tabbed":
    case "webapi-tabbed":
      console.error(
        `MDN-BOB: (heightBuilder.js) Missing height property for ${page.fileName}`
      );
      return undefined;
    case "js":
      // Yari expects those values for JS editor: "shorter", "default", "taller"
      jsHeight = getJSPageHeight(page.exampleCode);
      return jsHeight === "" ? "default" : jsHeight;
    case "wat":
      // Yari expects those values for WAT editor: "tabbed-shorter", "tabbed-standard", "tabbed-taller"
      return "tabbed-" + getWatPageHeight(page.watExampleCode);
    default:
      console.error(
        `MDN-BOB: (heightBuilder.js) Unsupported page type ${page.type}`
      );
      return undefined;
  }
}

/**
 * Builds height-data.json containing object of path and height of every interactive example
 */
export default function buildHeightData() {
  const metaJSONArray = glob.sync(config.metaGlob, {});
  const heightData = {};

  for (const metaJson of metaJSONArray) {
    const file = fse.readJsonSync(metaJson);

    const metaHeights = getPagesHeightData(file);
    Object.assign(heightData, metaHeights);
  }

  const jsonData = JSON.stringify(heightData, null, 4);
  fse.outputFileSync(config.heightData, jsonData);
}
