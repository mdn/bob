import type { EditorView } from "codemirror";

import {
  languageCSS,
  languageHTML,
  languageJavaScript,
  initCodeEditor,
} from "./codemirror-editor.js";

const cssEditor = document.getElementById("css-editor") as HTMLElement;
const htmlEditor = document.getElementById("html-editor") as HTMLElement;
const jsEditor = document.getElementById("js-editor") as HTMLElement;
const staticHTMLCode = htmlEditor.querySelector("pre") as HTMLElement;
const staticCSSCode = cssEditor.querySelector("pre") as HTMLElement;
const staticJSCode = jsEditor.querySelector("pre") as HTMLElement;
const tabContainer = document.getElementById("tab-container") as HTMLElement;
const tabs =
  tabContainer.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
const tabList = document.getElementById("tablist") as HTMLElement;

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
function setActiveTab(nextActiveTab: HTMLElement, activeTab?: HTMLElement) {
  if (activeTab) {
    // set the currentSelectedTab to false
    activeTab.setAttribute("aria-selected", "false");
    activeTab.setAttribute("tabindex", "-1");
  }

  // set the activated tab to selected
  nextActiveTab.setAttribute("aria-selected", "true");
  nextActiveTab.removeAttribute("tabindex");
  nextActiveTab.focus();
}

/**
 * Set the default tab, and shows the relevant panel
 * @param {Object} tab - The tab to set as default
 */
function setDefaultTab(tab: HTMLElement) {
  const panel = document.getElementById(tab.id + "-panel") as HTMLElement;

  tab.setAttribute("aria-selected", "true");
  tab.removeAttribute("tabindex");

  panel.classList.remove("hidden");
  panel.setAttribute("aria-hidden", "false");

  tab.focus();
}

/**
 * Handles moving focus and activating the next tab in either direction,
 * based on arrow key events
 * @param {String} direction - The direction in which to move tab focus
 * Must be either forward, or reverse.
 */
function setNextActiveTab(direction: string) {
  const activeTab = tabList.querySelector(
    'button[aria-selected="true"]',
  ) as HTMLElement;

  // if the direction specified is not valid, simply return
  if (direction !== "forward" && direction !== "reverse") {
    return;
  }

  if (direction === "forward") {
    if (activeTab.nextElementSibling instanceof HTMLElement) {
      setActiveTab(activeTab.nextElementSibling, activeTab);
      activeTab.nextElementSibling.click();
    } else {
      // reached the last tab, loop back to the first tab
      setActiveTab(tabs[0]);
      tabs[0].click();
    }
  } else if (direction === "reverse") {
    if (activeTab.previousElementSibling instanceof HTMLElement) {
      setActiveTab(activeTab.previousElementSibling, activeTab);
      activeTab.previousElementSibling.click();
    } else {
      // reached the first tab, loop around to the last tab
      setActiveTab(tabs[tabs.length - 1]);
      tabs[tabs.length - 1].click();
    }
  }
}

export const editors: {
  [type: string]: {
    editor: EditorView | undefined;
    code: HTMLElement;
    initialContent: string;
    language: any;
  };
} = {
  html: {
    editor: undefined,
    code: htmlEditor,
    initialContent: staticHTMLCode.querySelector("code")?.textContent || "",
    language: languageHTML(),
  },
  css: {
    editor: undefined,
    code: cssEditor,
    initialContent: staticCSSCode.querySelector("code")?.textContent || "",
    language: languageCSS(),
  },
  js: {
    editor: undefined,
    code: jsEditor,
    initialContent: staticJSCode.querySelector("code")?.textContent || "",
    language: languageJavaScript(),
  },
};

/**
 * Initialise the specified editor if not already initialised
 * @param {Array} editorTypes - The editors to initialise
 * @param {Object} defaultTab - The deafult active tab
 */
export function initEditor(editorTypes: string[], defaultTab: HTMLElement) {
  if (defaultTab) {
    setDefaultTab(defaultTab);
  }
  for (const editorName of editorTypes) {
    if (!(editorName in editors)) {
      continue;
    }
    // enable relevant tabs
    const editorData = editors[editorName as keyof typeof editors];
    document.getElementById(editorName)?.classList.remove("hidden");

    editorData.editor = initCodeEditor(
      editorData.code,
      editorData.initialContent,
      editorData.language,
    );
  }
}

/**
 * Registers the required click and keyboard event listeners
 */
export function registerEventListeners() {
  tabList.addEventListener("click", (event) => {
    const eventTarget = event.target as HTMLElement;
    const role = eventTarget.getAttribute("role");

    if (role === "tab") {
      const activeTab = tabList.querySelector(
        'button[aria-selected="true"]',
      ) as HTMLElement;
      const controls = eventTarget.getAttribute("aria-controls") || "";
      const selectedPanel = document.getElementById(controls) as HTMLElement;

      hideTabPanels();
      setActiveTab(eventTarget, activeTab);

      // now show the selected tabpanel
      selectedPanel.classList.remove("hidden");
      selectedPanel.setAttribute("aria-hidden", "false");
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
