import {
  languageCSS,
  languageHTML,
  languageJavaScript,
  initCodeEditor,
} from "./codemirror-editor.js";

const cssEditor = document.getElementById("css-editor");
const htmlEditor = document.getElementById("html-editor");
const jsEditor = document.getElementById("js-editor");
const staticHTMLCode = htmlEditor.querySelector("pre");
const staticCSSCode = cssEditor.querySelector("pre");
const staticJSCode = jsEditor.querySelector("pre");
const tabContainer = document.getElementById("tab-container");
const tabs = tabContainer.querySelectorAll('button[role="tab"]');
const tabList = document.getElementById("tablist");

/**
 * Hides all tabpanels
 */
function hideTabPanels() {
  // get all section with a role of tabpanel
  const tabPanels = tabContainer.querySelectorAll('[role="tabpanel"]');

  // hide all tabpanels
  for (const panel of tabPanels) {
    panel.classList.add("hidden");
  }
}

/**
 * Sets the newly activated tab as active, and ensures that
 * the previously active tab is unset.
 * @param {Object} nextActiveTab - The tab to activate
 * @param {Object} [activeTab] - The current active tab
 */
function setActiveTab(nextActiveTab, activeTab) {
  if (activeTab) {
    // set the currentSelectedTab to false
    activeTab.setAttribute("aria-selected", false);
    activeTab.setAttribute("tabindex", -1);
  }

  // set the activated tab to selected
  nextActiveTab.setAttribute("aria-selected", true);
  nextActiveTab.removeAttribute("tabindex");
  nextActiveTab.focus();
}

/**
 * Set the default tab, and shows the relevant panel
 * @param {Object} tab - The tab to set as default
 */
function setDefaultTab(tab) {
  const panel = document.getElementById(tab.id + "-panel");

  tab.setAttribute("aria-selected", true);
  tab.removeAttribute("tabindex");

  panel.classList.remove("hidden");
  panel.setAttribute("aria-hidden", false);

  tab.focus();
}

/**
 * Handles moving focus and activating the next tab in either direction,
 * based on arrow key events
 * @param {String} direction - The direction in which to move tab focus
 * Must be either forward, or reverse.
 */
function setNextActiveTab(direction) {
  const activeTab = tabList.querySelector('button[aria-selected="true"]');

  // if the direction specified is not valid, simply return
  if (direction !== "forward" && direction !== "reverse") {
    return;
  }

  if (direction === "forward") {
    if (activeTab.nextElementSibling) {
      setActiveTab(activeTab.nextElementSibling, activeTab);
      activeTab.nextElementSibling.click();
    } else {
      // reached the last tab, loop back to the first tab
      setActiveTab(tabs[0]);
      tabs[0].click();
    }
  } else if (direction === "reverse") {
    if (activeTab.previousElementSibling) {
      setActiveTab(activeTab.previousElementSibling, activeTab);
      activeTab.previousElementSibling.click();
    } else {
      // reached the first tab, loop around to the last tab
      setActiveTab(tabs[tabs.length - 1]);
      tabs[tabs.length - 1].click();
    }
  }
}

export const editors = {
  html: {
    editor: undefined,
    code: htmlEditor,
    initialContent: staticHTMLCode.querySelector("code").textContent,
    language: languageHTML(),
  },
  css: {
    editor: undefined,
    code: cssEditor,
    initialContent: staticCSSCode.querySelector("code").textContent,
    language: languageCSS(),
  },
  js: {
    editor: undefined,
    code: jsEditor,
    initialContent: staticJSCode.querySelector("code").textContent,
    language: languageJavaScript(),
  },
};

/**
 * Initialise the specified editor if not already initialised
 * @param {Array} editorTypes - The editors to initialise
 * @param {Object} defaultTab - The deafult active tab
 */
export function initEditor(editorTypes, defaultTab) {
  if (defaultTab) {
    setDefaultTab(defaultTab);
  }
  for (const editorName of editorTypes) {
    // enable relevant tabs
    const editorData = editors[editorName];
    document.getElementById(editorName).classList.remove("hidden");

    editorData.editor = initCodeEditor(
      editorData.code,
      editorData.initialContent,
      editorData.language
    );
  }
}

/**
 * Registers the required click and keyboard event listeners
 */
export function registerEventListeners() {
  tabList.addEventListener("click", (event) => {
    const eventTarget = event.target;
    const role = eventTarget.getAttribute("role");

    if (role === "tab") {
      const activeTab = tabList.querySelector('button[aria-selected="true"]');
      const selectedPanel = document.getElementById(
        eventTarget.getAttribute("aria-controls")
      );

      hideTabPanels();
      setActiveTab(eventTarget, activeTab);

      // now show the selected tabpanel
      selectedPanel.classList.remove("hidden");
      selectedPanel.setAttribute("aria-hidden", false);
    }
  });

  tabList.addEventListener("keyup", (event) => {
    event.stopPropagation();
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        setNextActiveTab("forward");
        break;
      case "ArrowLeft":
      case "ArrowUp":
        setNextActiveTab("reverse");
        break;
      case "Home":
        setActiveTab(tabs[0]);
        break;
      case "End":
        setActiveTab(tabs[tabs.length - 1]);
        break;
      case "default":
        return;
    }
  });
}
