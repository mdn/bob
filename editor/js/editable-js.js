import * as featureDetector from "./editor-libs/feature-detector.js";
import mceConsole from "./editor-libs/console.js";
import * as mceEvents from "./editor-libs/events.js";
import * as mceUtils from "./editor-libs/mce-utils.js";

import "../css/editor-libs/ui-fonts.css";
import "../css/editor-libs/common.css";
import "../css/editable-js-and-wat.css";
import {initCodeEditor, getEditorContent, languageJavaScript} from "./editor-libs/codemirror-editor.js";

(function () {
  const codeBlock = document.getElementById("static-js");
  const exampleFeature = codeBlock.dataset["feature"];
  const execute = document.getElementById("execute");
  const output = document.querySelector("#console code");
  const reset = document.getElementById("reset");

  let codeMirror;
  let staticContainer;
  let liveContainer = "";

  /**
   * Reads the textContent from the interactiveCodeBlock, sends the
   * textContent to executeLiveExample, and logs the output to the
   * output container
   */
  function applyCode() {
    const currentValue = getEditorContent(codeMirror);
    updateOutput(currentValue);
  }

  /**
   * Initialize CodeMirror
   */
  function initCodeMirror() {
    const editorContainer = document.getElementById("editor");

    codeMirror = initCodeEditor(editorContainer, codeBlock.textContent, languageJavaScript());
  }

  /**
   * Initialize the interactive editor
   */
  function initInteractiveEditor() {
    /* If the `data-height` attribute is defined on the `codeBlock`, set
           the value of this attribute as a class on the editor element. */
    if (codeBlock.dataset["height"]) {
      const editor = document.getElementById("editor");
      editor.classList.add(codeBlock.dataset["height"]);
    }

    staticContainer = document.getElementById("static");
    staticContainer.classList.add("hidden");

    liveContainer = document.getElementById("live");
    liveContainer.classList.remove("hidden");

    mceConsole();
    mceEvents.register();

    initCodeMirror();
  }

  /**
   * Executes the provided code snippet and logs the result
   * to the output container.
   * @param {String} exampleCode - The code to execute
   */
  function updateOutput(exampleCode) {
    output.classList.add("fade-in");

    try {
      // Create a new Function from the code, and immediately execute it.
      new Function(exampleCode)();
    } catch (event) {
      output.textContent = "Error: " + event.message;
    }

    output.addEventListener("animationend", () => output.classList.remove("fade-in"));
  }

  /* only execute JS in supported browsers. As `document.all`
    is a non standard object available only in IE10 and older,
    this will stop JS from executing in those versions. */
  if (!document.all && featureDetector.isDefined(exampleFeature)) {
    document.documentElement.classList.add("js");

    initInteractiveEditor();

    execute.addEventListener("click", () => {
      output.textContent = "";
      applyCode();
    });

    reset.addEventListener("click", () => window.location.reload());
  }
})();
