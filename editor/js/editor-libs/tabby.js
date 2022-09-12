var cssEditor = document.getElementById("css-editor");
var htmlEditor = document.getElementById("html-editor");
var jsEditor = document.getElementById("js-editor");
var staticHTMLCode = htmlEditor.querySelector("pre");
var staticCSSCode = cssEditor.querySelector("pre");
var staticJSCode = jsEditor.querySelector("pre");
var tabContainer = document.getElementById("tab-container");
var tabs = tabContainer.querySelectorAll('button[role="tab"]');
var tabList = document.getElementById("tablist");

/**
 * Hides all tabpanels
 */
function hideTabPanels() {
  // get all section with a role of tabpanel
  var tabPanels = tabContainer.querySelectorAll('[role="tabpanel"]');

  // hide all tabpanels
  for (var panel of tabPanels) {
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
  var panel = document.getElementById(tab.id + "-panel");

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
  var activeTab = tabList.querySelector('button[aria-selected="true"]');

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
    config: {
      lineNumbers: true,
      lineWrapping: true,
      mode: "htmlmixed",
      value: staticHTMLCode.querySelector("code").textContent,
      autoRefresh: true,
    },
  },
  css: {
    editor: undefined,
    code: cssEditor,
    config: {
      lineNumbers: true,
      mode: "css",
      value: staticCSSCode.querySelector("code").textContent,
      autoRefresh: true,
    },
  },
  js: {
    editor: undefined,
    code: jsEditor,
    config: {
      lineNumbers: true,
      mode: "javascript",
      value: staticJSCode.querySelector("code").textContent,
      autoRefresh: true,
    },
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
  for (var editor of editorTypes) {
    // enable relevant tabs
    document.getElementById(editor).classList.remove("hidden");
    // eslint-disable-next-line new-cap
    editors[editor].editor = CodeMirror(
      editors[editor].code,
      editors[editor].config
    );
  }
}

/**
 * Registers the required click and keyboard event listeners
 */
export function registerEventListeners() {
  tabList.addEventListener("click", function (event) {
    var eventTarget = event.target;
    var role = eventTarget.getAttribute("role");

    if (role === "tab") {
      var activeTab = tabList.querySelector('button[aria-selected="true"]');
      var selectedPanel = document.getElementById(
        eventTarget.getAttribute("aria-controls")
      );

      hideTabPanels();
      setActiveTab(eventTarget, activeTab);

      // now show the selected tabpanel
      selectedPanel.classList.remove("hidden");
      selectedPanel.setAttribute("aria-hidden", false);
      // refresh the CodeMirror UI for this view
      editors[eventTarget.id].editor.refresh();
    }
  });

  tabList.addEventListener("keyup", function (event) {
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
