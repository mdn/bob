import fse from "fs-extra";

import getConfig from "./config.js";
import { getJSPageHeight, getWatPageHeight } from "./processor.js";
import {
  HeightData,
  HeightDataEditor,
  HeightDataExamples,
  MetaFile,
  MetaPage,
} from "../types/types";
import { globSyncNoEscape } from "./utils.js";

const config = getConfig();

const rootDir = new URL("..", import.meta.url);

/**
 * Content of editor-heights.json in the current projects root
 */
interface EditorHeights {
  editors: HeightDataEditor[];
}

function getEditorHeights() {
  return fse.readJsonSync(
    new URL(config.editorHeights, rootDir)
  ) as EditorHeights;
}

/**
 * Converts content of meta.json to object containing path and editor name of every interactive example present in that file
 *
 * In case meta.json is missing required height property or it has unsupported value, exception is thrown
 * @param metaContent - Content of meta.json as an JS object
 */
function getPagesEditorNames(metaContent: MetaFile) {
  const pages = Object.values(metaContent.pages);
  const editorNames: HeightDataExamples = {};

  for (const page of pages) {
    const height = getEditorName(page);
    if (height !== undefined) {
      const path = getPagePath(page);
      editorNames[path] = height;
    }
  }
  return editorNames;
}

function getPagePath(page: MetaPage) {
  return `pages/${page.type}/${page.fileName}`;
}

/**
 * Returns editor name for a given page, based on its height
 * Every editor name must have a record in editor-heights.json
 * @param page - Object describing single interactive example
 * @return editor name
 */
function getEditorName(page: MetaPage) {
  switch (page.type) {
    case "css":
      return "css";
    case "tabbed":
    case "webapi-tabbed":
    case "mathml":
      switch (page.height) {
        case "tabbed-taller":
        case "tabbed-standard":
        case "tabbed-shorter":
          return page.height;
        default:
          throw new Error(
            `MDN-BOB: (heightBuilder.js) Invalid height property for ${page.fileName}`
          );
      }
    case "js": {
      const height = getJSPageHeight(page.exampleCode);
      switch (height) {
        case "taller":
          return "js-taller";
        case "":
          return "js-standard";
        case "shorter":
          return "js-smaller";
        default:
          throw new Error(
            `MDN-BOB: (heightBuilder.js) Height '${height}' calculated for JS example '${page.fileName}' is invalid`
          );
      }
    }
    case "wat": {
      const height = getWatPageHeight(page.watExampleCode);
      switch (height) {
        case "taller":
          return "wat-taller";
        case "standard":
          return "wat-standard";
        case "shorter":
          return "wat-smaller";
        default:
          throw new Error(
            `MDN-BOB: (heightBuilder.js) Height '${height}' calculated for WAT example '${page.fileName}' is invalid`
          );
      }
    }
    default:
      throw new Error(
        `MDN-BOB: (heightBuilder.js) Unsupported page type ${page}`
      );
  }
}

/**
 * Builds height-data.json containing path and editor name of every interactive example in `examples` property,
 * together with content of editor-heights which contains name and the height of every editor type
 */
export default function buildHeightData() {
  const metaJSONArray = globSyncNoEscape(config.metaGlob);
  const heightData: HeightData = {
    ...getEditorHeights(),
    examples: {},
  };

  for (const metaJson of metaJSONArray) {
    const file = fse.readJsonSync(metaJson) as MetaFile;

    const names = getPagesEditorNames(file);
    Object.assign(heightData.examples, names);
  }

  const jsonData = JSON.stringify(heightData, null, 4);
  fse.outputFileSync(config.heightData, jsonData);
}
