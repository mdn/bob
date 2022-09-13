import * as featureDetector from "./editor-libs/feature-detector.js";
import mceConsole from "./editor-libs/console.js";
import * as mceEvents from "./editor-libs/events.js";
import * as mceUtils from "./editor-libs/mce-utils.js";
import wabtConstructor from "wabt";

(function () {
  var watCodeBlock = document.getElementById("static-wat");
  var jsCodeBlock = document.getElementById("static-js");
  var exampleFeature = watCodeBlock.dataset["feature"];
  var execute = document.getElementById("execute");
  var liveContainer = "";
  var output = document.querySelector("#console code");
  var reset = document.getElementById("reset");
  var wabtInitialized = wabtConstructor();

  var tabContainer = document.getElementById("tab-container");
  var tabs = tabContainer.querySelectorAll("button[role='tab']");
  var tabList = document.getElementById("tablist");

  var watCodeMirror;
  var jsCodeMirror;
  var staticContainer;
  var wabt;
  wabtInitialized.then((res) => {
    wabt = res;
  });

  /**
   * Hides all tabpanels
   */
  function hideTabPanels() {
    // get all section with a role of tabpanel
    var tabPanels = tabContainer.querySelectorAll("[role='tabpanel']");

    // hide all tabpanels
    for (var panel of tabPanels) {
      panel.classList.add("hidden");
    }
  }

  function registerEventListeners() {
    tabList.addEventListener("click", function (event) {
      var eventTarget = event.target;
      var role = eventTarget.getAttribute("role");

      if (role === "tab") {
        var activeTab = tabList.querySelector("button[aria-selected='true']");
        var selectedPanel = document.getElementById(
          eventTarget.getAttribute("aria-controls")
        );

        hideTabPanels();
        setActiveTab(eventTarget, activeTab);

        // now show the selected tabpanel
        selectedPanel.classList.remove("hidden");
        selectedPanel.setAttribute("aria-hidden", false);
        // refresh the CodeMirror UI for this view
        // editors[eventTarget.id].editor.refresh();

        watCodeMirror.refresh();
        jsCodeMirror.refresh();
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
    var activeTab = tabList.querySelector("button[aria-selected='true']");

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
    var wat = watCodeMirror.getDoc().getValue();
    var js = jsCodeMirror.getDoc().getValue();
    updateOutput(wat, js);
  }

  /**
   * Initialize CodeMirror
   */
  function initCodeMirror() {
    var editorContainer = document.getElementById("wat-editor");
    // eslint-disable-next-line new-cap
    watCodeMirror = CodeMirror(editorContainer, {
      autofocus: true,
      inputStyle: "contenteditable",
      lineNumbers: true,
      lineWrapping: true,
      mode: "wast",
      undoDepth: 5,
      tabindex: 0,
      value: watCodeBlock.textContent,
    });

    var editorContainer = document.getElementById("js-editor");
    // eslint-disable-next-line new-cap
    jsCodeMirror = CodeMirror(editorContainer, {
      autofocus: true,
      inputStyle: "contenteditable",
      lineNumbers: true,
      lineWrapping: true,
      mode: "javascript",
      undoDepth: 5,
      tabindex: 0,
      value: jsCodeBlock.textContent,
    });
  }

  /**
   * Initialize the interactive editor
   */
  function initInteractiveEditor() {
    /* If the `data-height` attribute is defined on the `codeBlock`, set
       the value of this attribute as a class on the editor element. */
    if (watCodeBlock.dataset["height"]) {
      var watEditor = document.getElementById("wat-panel");
      watEditor.classList.add(watCodeBlock.dataset["height"]);
      var jsEditor = document.getElementById("js-panel");
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
    await wabtInitialized;
    var encoder = new TextEncoder();
    let watBuffer = encoder.encode(wat);
    let module = wabt.parseWat("", watBuffer, {
      exceptions: true,
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
      let watBlob = await compileWat(wat);

      let watUrl = URL.createObjectURL(watBlob);

      const exampleCode = js.replaceAll("{%wasm-url%}", watUrl);

      // Create an new async function from the code, and immediately execute it.
      // using an async function since WebAssembly.instantiate is async and
      // we need to await in order to capture errors
      let AsyncFunction = Object.getPrototypeOf(
        async function () {}
      ).constructor;
      await new AsyncFunction(exampleCode)();
    } catch (error) {
      console.error(error);
    }

    output.addEventListener("animationend", function () {
      output.classList.remove("fade-in");
    });
  }

  /* only execute JS in supported browsers. As `document.all`
  is a non standard object available only in IE10 and older,
  this will stop JS from executing in those versions. */
  if ("WebAssembly" in window && featureDetector.isDefined(exampleFeature)) {
    document.documentElement.classList.add("wat");

    initInteractiveEditor();

    execute.addEventListener("click", function () {
      output.textContent = "";
      applyCode();
    });

    reset.addEventListener("click", function () {
      window.location.reload();
    });
  }
})();
