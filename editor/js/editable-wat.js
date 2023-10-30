import * as featureDetector from "./editor-libs/feature-detector.js";
import mceConsole from "./editor-libs/console.js";
import * as mceEvents from "./editor-libs/events.js";
import wabtConstructor from "wabt";

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
  const watCodeBlock = document.getElementById("static-wat");
  const jsCodeBlock = document.getElementById("static-js");
  const exampleFeature = watCodeBlock.dataset["feature"];
  const execute = document.getElementById("execute");
  const output = document.querySelector("#console code");
  const reset = document.getElementById("reset");
  const wabt = await wabtConstructor();

  const tabContainer = document.getElementById("tab-container");
  const tabs = tabContainer.querySelectorAll("button[role='tab']");
  const tabList = document.getElementById("tablist");

  let watCodeMirror;
  let jsCodeMirror;
  let liveContainer = "";
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
      const eventTarget = event.target;
      const role = eventTarget.getAttribute("role");

      if (role === "tab") {
        const activeTab = tabList.querySelector("button[aria-selected='true']");
        const selectedPanel = document.getElementById(
          eventTarget.getAttribute("aria-controls"),
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
   * Handles moving focus and activating the next tab in either direction,
   * based on arrow key events
   * @param {String} direction - The direction in which to move tab focus
   * Must be either forward, or reverse.
   */
  function setNextActiveTab(direction) {
    const activeTab = tabList.querySelector("button[aria-selected='true']");

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

  /**
   * Reads the textContent from the interactiveCodeBlock, sends the
   * textContent to executeLiveExample, and logs the output to the
   * output container
   */
  function applyCode() {
    const wat = getEditorContent(watCodeMirror);
    const js = getEditorContent(jsCodeMirror);
    updateOutput(wat, js);
  }

  /**
   * Initialize CodeMirror
   */
  function initCodeMirror() {
    const watContainer = document.getElementById("wat-editor");
    watCodeMirror = initCodeEditor(
      watContainer,
      watCodeBlock.textContent,
      languageWAST(),
    );

    const jsContainer = document.getElementById("js-editor");
    jsCodeMirror = initCodeEditor(
      jsContainer,
      jsCodeBlock.textContent,
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
      const watEditor = document.getElementById("wat-panel");
      watEditor.classList.add(watCodeBlock.dataset["height"]);
      const jsEditor = document.getElementById("js-panel");
      jsEditor.classList.add(watCodeBlock.dataset["height"]);
    }

    staticContainer = document.getElementById("static");
    staticContainer.classList.add("hidden");

    liveContainer = document.getElementById("live");
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
  async function compileWat(wat) {
    const encoder = new TextEncoder();
    const watBuffer = encoder.encode(wat);
    const module = wabt.parseWat("", watBuffer, {
      exceptions: true,
      mutable_globals: true,
      sat_float_to_int: true,
      sign_extension: true,
      simd: true,
      multi_value: true,
      bulk_memory: true,
      reference_types: true,
    });
    module.resolveNames();
    module.validate();
    const binary = module.toBinary({ log: true, write_debug_names: true });

    const blob = new Blob([binary.buffer.buffer], { type: "application/wasm" });
    return blob;
  }

  /**
   * Executes the provided code snippet and logs the result
   * to the output container.
   * @param {String} wat - The wat code to execute
   * @param {String} js - The JavaScript code to execute
   */
  async function updateOutput(wat, js) {
    output.classList.add("fade-in");

    try {
      const watBlob = await compileWat(wat);

      const watUrl = URL.createObjectURL(watBlob);

      const exampleCode = js.replaceAll("{%wasm-url%}", watUrl);

      // Create an new async function from the code, and immediately execute it.
      // using an async function since WebAssembly.instantiate is async and
      // we need to await in order to capture errors
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const AsyncFunction = async function () {}.constructor;
      await new AsyncFunction(exampleCode)();
    } catch (error) {
      console.error(error);
    }

    output.addEventListener("animationend", () =>
      output.classList.remove("fade-in"),
    );
  }

  /* only execute JS in supported browsers. As `document.all`
  is a non standard object available only in IE10 and older,
  this will stop JS from executing in those versions. */
  if ("WebAssembly" in window && featureDetector.isDefined(exampleFeature)) {
    document.documentElement.classList.add("wat");

    initInteractiveEditor();

    execute.addEventListener("click", () => {
      output.textContent = "";
      applyCode();
    });

    reset.addEventListener("click", () => window.location.reload());
  }
})();
