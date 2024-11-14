import mceConsole from "./editor-libs/console.js";
import * as mceEvents from "./editor-libs/events.js";
import * as mceUtils from "./editor-libs/mce-utils.js";
import * as tabby from "./editor-libs/tabby.js";
import { getEditorContent } from "./editor-libs/codemirror-editor.js";
import { isMathMLSupported } from "./editor-libs/feature-detector.js";

import "../css/editor-libs/ui-fonts.css";
import "../css/editor-libs/common.css";
import "../css/editor-libs/shadow-fonts.css";
import "../css/editor-libs/tabby.css";
import "../css/tabbed-editor.css";

(function () {
  const clearConsole = document.getElementById("clear") as HTMLElement;
  const editorContainer = document.getElementById(
    "editor-container",
  ) as HTMLElement;
  const tabContainer = document.getElementById("tab-container") as HTMLElement;
  const iframeContainer = document.getElementById("output") as HTMLElement;
  const header = document.querySelector(".output-header") as HTMLElement;
  const cssEditor = document.getElementById("css-editor") as HTMLElement;
  const htmlEditor = document.getElementById("html-editor") as HTMLElement;
  const jsEditor = document.getElementById("js-editor") as HTMLElement;
  const staticCSSCode = cssEditor.querySelector("pre") as HTMLPreElement;
  const staticHTMLCode = htmlEditor.querySelector("pre") as HTMLPreElement;
  const staticJSCode = jsEditor.querySelector("pre") as HTMLPreElement;
  const outputIFrame = document.getElementById(
    "output-iframe",
  ) as HTMLIFrameElement;
  const outputTemplate = getOutputTemplate();
  const editorType = editorContainer.dataset.editorType;

  let appliedHeightAdjustment = false;
  let timer: NodeJS.Timeout | undefined;

  /**
   * @returns {string} - Interactive example output template, formed by joining together contents of #output-head and #output-body, found in live-tabbed-tmpl.html
   */
  function getOutputTemplate() {
    /* Document is split into two templates, just because <template> parser omits <html>, <head> and <body> tags.*/
    const templateOutputHead = document.getElementById(
      "output-head",
    ) as HTMLElement;
    const templateOutputBody = document.getElementById(
      "output-body",
    ) as HTMLElement;

    return `
<!DOCTYPE html>
<html id="output-root">
<head>${templateOutputHead.innerHTML}</head>
<body>${templateOutputBody.innerHTML}</body>
</html>
`;
  }

  /**
   * Applies CSS, HTML & JavaScript content found in the editor, to the output template
   * @param outputTemplate - HTML page containing %css-content%, %html-content% and %js-content% texts, that will be replaced with actual values
   * @param outputData - Object holding CSS, HTML & JavaScript code, that is supposed to be applied on the template
   * @returns {string} - raw html string
   */
  function applyEditorContentToTemplate(
    outputTemplate: string,
    outputData: { [editor: string]: string },
  ) {
    let content = outputTemplate;
    content = content.replace("%css-content%", outputData.cssContent);
    content = content.replace("%html-content%", outputData.htmlContent);
    content = content.replace("%js-content%", outputData.jsContent);
    return content;
  }

  /**
   * Called by the tabbed editor to combine code from all tabs in an Object
   * @returns Object with code from each tab panel
   * Example
   * --------
   * {
   *     cssContent: 'h1 { background-color: #333; }',
   *     htmlContent: '<h1>Title</h1>'
   * }
   */
  function getOutput() {
    const editorContents: { [editor: string]: string } = {};

    setContent("htmlContent", "html");
    setContent("cssContent", "css");
    setContent("jsContent", "js");

    function setContent(propertyName: string, editorName: string) {
      const editor = tabby.editors[editorName].editor;
      editorContents[propertyName] = editor ? getEditorContent(editor) : "";
    }
    return editorContents;
  }

  /**
   * Fetches HTML, CSS & JavaScript code from tabbed editor, applies them to output template and updates iframe with new content
   */
  function refreshOutput() {
    const editorData = getOutput();
    const content = applyEditorContentToTemplate(outputTemplate, editorData);

    outputIFrame.srcdoc = content;
    /* Some time after this operation, browser will invoke load event*/
  }

  /**
   * Performs operations on iframe content, that was just loaded and shown to the user
   * It prepares links, handles URL fragments, adjusts frame height, hooks console logs and then evaluates JS editor code
   */
  function onOutputLoaded() {
    const contentWindow = outputIFrame.contentWindow as Window &
      typeof globalThis;
    const contentBody = contentWindow.document.body as HTMLBodyElement;

    mceUtils.openLinksInNewTab(contentBody.querySelectorAll('a[href^="http"]'));
    mceUtils.scrollToAnchors(
      contentWindow,
      contentBody,
      contentBody.querySelectorAll('a[href^="#"]'),
    );

    adjustFrameHeight();

    /* Listeners are removed, every time content is refreshed */
    contentWindow.addEventListener("resize", () => adjustFrameHeight());
    /* Hooking console logs */
    mceConsole(contentWindow);

    executeJSEditorCode();
  }

  /**
   * Executing content of JavaScript editor, passed to global function "executeExample" declared in live-tabbed-tmpl.html
   * This process is purposefully delayed, so console logs hooks are attached first
   */
  function executeJSEditorCode() {
    type JSEditorWindow = Window & { executeExample: () => void };
    (outputIFrame.contentWindow as JSEditorWindow).executeExample();
  }

  /**
   * When screen width is small and output iframe is located below tab container, this function adjusts iframe height to height of its content
   * When viewport width changes and iframe gets relocated to near tab container, height value set here is removed
   */
  function adjustFrameHeight() {
    const iframeBelowTabContainer =
      iframeContainer.offsetTop >=
      tabContainer.offsetTop + tabContainer.offsetHeight;
    if (iframeBelowTabContainer) {
      /* When iframe is below tab container(which happens on small screens), we want it to take as low amount of space as possible */
      const iframeContent = outputIFrame.contentWindow?.document.getElementById(
        "html-output",
      ) as HTMLElement;
      const iframeContentHeight = iframeContent.clientHeight;
      const iframeHeight = outputIFrame.clientHeight;

      /* Setting height of iframe to be the same as height of its content */
      if (iframeContentHeight !== iframeHeight) {
        outputIFrame.style.height = iframeContentHeight + "px";
        appliedHeightAdjustment = true;
      }
    } else {
      /* In case iframe was previously below tab container and its height was set to a fixed value,
      we need to clear that value, so iframe fills the whole container now */
      if (appliedHeightAdjustment) {
        outputIFrame.style.height = "";
        appliedHeightAdjustment = false;
      }
    }
  }

  /**
   * Called from the editors on keyup events. Starts a 500 millisecond timer.
   * If no other keyup events happens before the 500 millisecond have elapsed,
   * update the output
   */
  function autoUpdate() {
    // clear the existing timer
    clearTimeout(timer);

    timer = setTimeout(() => refreshOutput(), 500);
  }

  if (editorType === "mathml" && !isMathMLSupported()) {
    const notSupportedWarning = document.getElementById(
      "warning-mathml-not-supported",
    ) as HTMLElement;
    notSupportedWarning.classList.remove("hidden");
    return;
  }

  outputIFrame.addEventListener("load", () => onOutputLoaded());

  header.addEventListener("click", (event) => {
    const target = event.target as typeof header;
    if (!target.classList.contains("reset")) {
      return;
    }

    if (!window.confirm("Do you really want to reset everything?")) {
      event.preventDefault();
      return;
    }

    window.location.reload();
  });

  htmlEditor.addEventListener("keyup", () => autoUpdate());

  cssEditor.addEventListener("keyup", () => autoUpdate());

  jsEditor.addEventListener("keyup", () => autoUpdate());

  clearConsole.addEventListener("click", () => {
    const webapiConsole = document.querySelector(
      "#console code",
    ) as HTMLElement;
    webapiConsole.textContent = "";
  });

  // hide the static example when JS enabled
  staticHTMLCode.classList.add("hidden");
  // hide the static CSS example
  staticCSSCode.classList.add("hidden");
  // hide the static JS example
  staticJSCode.classList.add("hidden");
  // show the content
  editorContainer.classList.remove("hidden");

  /**
   * @returns {string[]} - IDs of editors that should be visible in the example.
   */
  function getTabs(editorContainer: HTMLElement) {
    if (editorContainer.dataset && editorContainer.dataset.tabs) {
      return editorContainer.dataset.tabs.split(",");
    } else {
      return ["html", "css"];
    }
  }

  /**
   * @returns {string} - ID of editor that should be active be default.
   */
  function getDefaultTab(editorContainer: HTMLElement, tabs: string[]) {
    if (editorContainer.dataset && editorContainer.dataset.defaultTab) {
      return editorContainer.dataset.defaultTab;
    } else if (tabs.includes("js")) {
      return "js";
    } else {
      return "html";
    }
  }

  const tabs = getTabs(editorContainer);
  const defaultTab = getDefaultTab(editorContainer, tabs);
  tabby.initEditor(tabs, document.getElementById(defaultTab) as HTMLElement);

  mceConsole();

  tabby.registerEventListeners();
  mceEvents.register();

  refreshOutput();
})();
