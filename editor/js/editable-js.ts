import type { EditorView } from "codemirror";
import * as featureDetector from "./editor-libs/feature-detector.js";
import mceConsole from "./editor-libs/console.js";
import * as mceEvents from "./editor-libs/events.js";

import "../css/editor-libs/ui-fonts.css";
import "../css/editor-libs/common.css";
import "../css/editable-js-and-wat.css";
import {
  initCodeEditor,
  getEditorContent,
  languageJavaScript,
} from "./editor-libs/codemirror-editor.js";

(function () {
  const codeBlock = document.getElementById("static-js") as HTMLElement;

  const exampleFeature = codeBlock.dataset["feature"];
  const execute = document.getElementById("execute") as HTMLElement;
  const output = document.querySelector("#console code") as HTMLElement;
  const reset = document.getElementById("reset") as HTMLElement;

  let codeMirror: EditorView | null;
  let staticContainer;
  let liveContainer;

  /**
   * Reads the textContent from the interactiveCodeBlock, sends the
   * textContent to executeLiveExample, and logs the output to the
   * output container
   */
  function applyCode() {
    if (!codeMirror) {
      initCodeMirror();
      // "as EditorView" on next line needed to trick TypeScript
    }
    const currentValue = getEditorContent(codeMirror as EditorView);
    updateOutput(currentValue);
  }

  /**
   * Initialize CodeMirror
   */
  function initCodeMirror() {
    const editorContainer = document.getElementById("editor") as HTMLElement;

    codeMirror = initCodeEditor(
      editorContainer,
      codeBlock.textContent || "",
      languageJavaScript(),
    );
  }

  /**
   * Initialize the interactive editor
   */
  function initInteractiveEditor() {
    /* If the `data-height` attribute is defined on the `codeBlock`, set
           the value of this attribute as a class on the editor element. */
    if (codeBlock?.dataset["height"]) {
      const editor = document.getElementById("editor") as HTMLElement;
      editor.classList.add(codeBlock.dataset["height"]);
    }

    staticContainer = document.getElementById("static") as HTMLElement;
    staticContainer.classList.add("hidden");

    liveContainer = document.getElementById("live") as HTMLElement;
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
  function updateOutput(exampleCode: string) {
    output.classList.add("fade-in");

    try {
      // Create a new Function from the code, and immediately execute it.
      new Function(exampleCode)();
    } catch (event: unknown) {
      output.textContent = "Error: " + (event as Error)?.message;
    }

    output.addEventListener("animationend", () =>
      output.classList.remove("fade-in"),
    );
  }

  /* only execute code in supported browsers */
  if (featureDetector.isDefined(exampleFeature)) {
    document.documentElement.classList.add("js");

    initInteractiveEditor();

    execute.addEventListener("click", () => {
      output.textContent = "";
      applyCode();
    });

    reset.addEventListener("click", (event) => {
      if (
        !window.confirm(
          "Are you sure you want to reset the editor?\nAny changes you have made will be lost.",
        )
      ) {
        event.preventDefault();
        return;
      }

      window.location.reload();
    });
  } else {
    console.warn(
      `Feature ${exampleFeature} is not supported; code editor disabled.`,
    );
  }
})();
