import fse from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as processor from "./processor.js";
import { MetaPage, PageType, TabbedPage } from "../types/types";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * Based on the provided `tmplType`, return the relevant
 * template as a string.
 * @param tmplType - The template type
 * @returns The appropriate template as a string
 */
export function getPageTmpl(tmplType: PageType) {
  switch (tmplType) {
    case "css":
      return fse.readFileSync(
        path.join(__dirname, "../editor/tmpl/live-css-tmpl.html"),
        "utf8"
      );
    case "js":
      return fse.readFileSync(
        path.join(__dirname, "../editor/tmpl/live-js-tmpl.html"),
        "utf8"
      );
    case "wat":
      return fse.readFileSync(
        path.join(__dirname, "../editor/tmpl/live-wat-tmpl.html"),
        "utf8"
      );
    case "tabbed":
    case "webapi-tabbed":
    case "mathml":
      return fse.readFileSync(
        path.join(__dirname, "../editor/tmpl/live-tabbed-tmpl.html"),
        "utf8"
      );
    default:
      console.error(`MDN-BOB: No template found for template type ${tmplType}`);
      process.exit(1);
  }
}

/**
 * Sets the active tabs in a comma separated string.
 * @param currentPage - The current page object
 * @param tmpl - The template as a string
 *
 * @returns The processed template with the active tabs set
 */
export function setActiveTabs(currentPage: TabbedPage, tmpl: string) {
  const regex = /%active-tabs%/g;

  if (currentPage.tabs) {
    return tmpl.replace(regex, `data-tabs="${currentPage.tabs}"`);
  } else {
    return tmpl.replace(regex, "");
  }
}

/**
 * Sets the tab that should be open by default.
 * @param currentPage - The current page object
 * @param tmpl - The template as a string
 *
 * @returns The processed template with the default tab id
 */
export function setDefaultTab(currentPage: TabbedPage, tmpl: string) {
  const regex = /%default-tab%/g;

  if (currentPage.defaultTab) {
    return tmpl.replace(regex, `data-default-tab="${currentPage.defaultTab}"`);
  } else {
    return tmpl.replace(regex, "");
  }
}

/**
 * If the `currentPage.type` is of type webapi-tabbed,
 * show the console, else hide. Also set the appropriate
 * `aria-hidden` state
 * @param currentPage - The current page object
 * @param tmpl - The template as a string
 *
 * @returns The processed template with console state set
 */
export function setConsoleState(currentPage: TabbedPage, tmpl: string) {
  const stateRegEx = /%console-state%/g;
  const ariaHiddenStateRegEx = /%console-aria-state%/g;

  if (currentPage.type === "webapi-tabbed") {
    // no class to add, simple clear the pattern
    tmpl = tmpl.replace(stateRegEx, "");
    return tmpl.replace(ariaHiddenStateRegEx, "false");
  } else {
    tmpl = tmpl.replace(stateRegEx, "hidden");
    return tmpl.replace(ariaHiddenStateRegEx, "true");
  }
}

/**
 * Sets the appropriate class on the tabbed editor’s container
 * element based on the height property defined in the example’s
 * meta data
 * @param currentPage - The current page object
 * @param tmpl - The template as a string
 *
 * @returns The processed template with the height class set
 */
export function setEditorHeight(currentPage: TabbedPage, tmpl: string) {
  const regex = /%editor-height%/g;

  if (currentPage.height === undefined) {
    console.error(
      `[BoB] Required height property of ${currentPage.title} is not defined`
    );
    process.exit(1);
  }

  return tmpl.replace(regex, currentPage.height);
}

/**
 * Sets the `<title>` and `<h4>` main page title
 * @param currentPage - The current page object
 * @param tmpl - The template as a string
 *
 * @returns The processed template with the titles set
 */
export function setMainTitle(currentPage: MetaPage, tmpl: string) {
  const regex = /%title%/g;
  let resultsArray: RegExpExecArray | null = null;

  // replace all instances of `%title` with the `currentPage.title`
  while ((resultsArray = regex.exec(tmpl)) !== null) {
    tmpl = tmpl.replace(
      resultsArray[0].trim(),
      processor.preprocessHTML(currentPage.title)
    );
  }
  return tmpl;
}

export function setCacheBuster(string: string, tmpl: string) {
  const regex = /%cache-buster%/g;
  return tmpl.replace(regex, string);
}

export function setEditorType(currentPage: TabbedPage, tmpl: string) {
  const regex = /%editor-type%/g;

  return tmpl.replace(regex, currentPage.type);
}
