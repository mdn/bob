import type { EditorView } from "codemirror";
import * as featureDetector from "./editor-libs/feature-detector.js";
import mceConsole from "./editor-libs/console.js";
import * as mceEvents from "./editor-libs/events.js";
import { watify } from "watify";

import "../css/editor-libs/ui-fonts.css";
import "../css/editor-libs/common.css";
import "../css/editable-js-and-wat.css";
import "../css/editor-libs/tabby.css";
import {
  getEditorContent,
  initCodeEditor,
  languageJavaScript,
  languageWAST,
} from "./editor-libs/codemirror-editor.js";

(async function () {
  const watCodeBlock = document.getElementById("static-wat") as HTMLElement;
  const jsCodeBlock = document.getElementById("static-js") as HTMLElement;
  const exampleFeature = watCodeBlock.dataset["feature"];
  const execute = document.getElementById("execute") as HTMLElement;
  const output = document.querySelector("#console code") as HTMLElement;
  const reset = document.getElementById("reset") as HTMLElement;

  const tabContainer = document.getElementById("tab-container") as HTMLElement;
  const tabs =
    tabContainer.querySelectorAll<HTMLButtonElement>("button[role='tab']");
  const tabList = document.getElementById("tablist") as HTMLElement;

  let watCodeMirror: EditorView | null;
  let jsCodeMirror: EditorView | null;
  let liveContainer;
  let staticContainer;

  /**
   * Hides all tabpanels
   */
  function hideTabPanels() {
    // get all section with a role of tabpanel
    const tabPanels = tabContainer.querySelectorAll("[role='tabpanel']");

    // hide all tabpanels
    for (const panel of tabPanels) {
      panel.classList.add("hidden");
    }
  }

  function registerEventListeners() {
    tabList.addEventListener("click", (event) => {
      const eventTarget = event.target as typeof tabList;
      const role = eventTarget.getAttribute("role");

      if (role === "tab") {
        const activeTab = tabList.querySelector(
          "button[aria-selected='true']",
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
   * Handles moving focus and activating the next tab in either direction,
   * based on arrow key events
   * @param {String} direction - The direction in which to move tab focus
   * Must be either forward, or reverse.
   */
  function setNextActiveTab(direction: string) {
    const activeTab = tabList.querySelector(
      "button[aria-selected='true']",
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

  /**
   * Reads the textContent from the interactiveCodeBlock, sends the
   * textContent to executeLiveExample, and logs the output to the
   * output container
   */
  function applyCode() {
    if (!(watCodeMirror && jsCodeMirror)) {
      initCodeMirror();
      // "as EditorView" on next lines needed to trick TypeScript
    }
    const wat = getEditorContent(watCodeMirror as EditorView);
    const js = getEditorContent(jsCodeMirror as EditorView);
    updateOutput(wat, js);
  }

  /**
   * Initialize CodeMirror
   */
  function initCodeMirror() {
    const watContainer = document.getElementById("wat-editor") as HTMLElement;
    watCodeMirror = initCodeEditor(
      watContainer,
      watCodeBlock.textContent || "",
      languageWAST(),
    );

    const jsContainer = document.getElementById("js-editor") as HTMLElement;
    jsCodeMirror = initCodeEditor(
      jsContainer,
      jsCodeBlock.textContent || "",
      languageJavaScript(),
    );
  }

  /**
   * Initialize the interactive editor
   */
  function initInteractiveEditor() {
    /* If the `data-height` attribute is defined on the `codeBlock`, set
       the value of this attribute as a class on the editor element. */
    if (watCodeBlock.dataset["height"]) {
      const watEditor = document.getElementById("wat-panel") as HTMLElement;
      watEditor.classList.add(watCodeBlock.dataset["height"]);
      const jsEditor = document.getElementById("js-panel") as HTMLElement;
      jsEditor.classList.add(watCodeBlock.dataset["height"]);
    }

    staticContainer = document.getElementById("static") as HTMLElement;
    staticContainer.classList.add("hidden");

    liveContainer = document.getElementById("live") as HTMLElement;
    liveContainer.classList.remove("hidden");

    mceConsole();
    mceEvents.register();

    initCodeMirror();

    registerEventListeners();
  }

  /**
   * compiles the wat code to wasm
   * @param {string} wat
   * @returns {Blob} a blob with the newly created wasm module
   */
  async function compileWat(wat: string): Promise<Blob> {
    const binary = await watify(wat);

    const blob = new Blob([binary], { type: "application/wasm" });
    return blob;
  }

  /**
   * Executes the provided code snippet and logs the result
   * to the output container.
   * @param {String} wat - The wat code to execute
   * @param {String} js - The JavaScript code to execute
   */
  async function updateOutput(wat: string, js: string) {
    output.classList.add("fade-in");

    try {
      const watBlob = await compileWat(wat);

      const watUrl = URL.createObjectURL(watBlob);

      const exampleCode = js.replaceAll("{%wasm-url%}", watUrl);

      // Create an new async function from the code, and immediately execute it.
      // using an async function since WebAssembly.instantiate is async and
      // we need to await in order to capture errors
      const AsyncFunction = Object.getPrototypeOf(
        async function () {},
      ).constructor;
      await new AsyncFunction(exampleCode)();
    } catch (error) {
      console.error(error);
    }

    output.addEventListener("animationend", () =>
      output.classList.remove("fade-in"),
    );
  }

  /* only execute code in supported browsers */
  if ("WebAssembly" in window && featureDetector.isDefined(exampleFeature)) {
    document.documentElement.classList.add("wat");

    initInteractiveEditor();

    execute.addEventListener("click", () => {
      output.textContent = "";
      applyCode();
    });

    reset.addEventListener("click", () => window.location.reload());
  } else {
    console.warn(
      `Feature ${
        "WebAssembly" in window ? exampleFeature : "WebAssembly"
      } is not supported; code editor disabled.`,
    );
  }
})();
