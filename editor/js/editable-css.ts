import * as clippy from "./editor-libs/clippy.js";
import * as mceEvents from "./editor-libs/events.js";
import * as cssEditorUtils from "./editor-libs/css-editor-utils.js";
import {
  initCodeEditor,
  languageCSS,
} from "./editor-libs/codemirror-editor.js";

import "../css/editor-libs/ui-fonts.css";
import "../css/editor-libs/common.css";
import "../css/editable-css.css";

(function () {
  const exampleChoiceList = document.getElementById(
    "example-choice-list",
  ) as HTMLElement;

  const exampleChoices = exampleChoiceList.querySelectorAll(
    ".example-choice",
  ) as NodeListOf<HTMLElement>;
  const exampleDeclarations = Array.from(
    exampleChoices,
    (choice) => choice.querySelector("code")?.textContent,
  );
  const editorWrapper = document.getElementById(
    "editor-wrapper",
  ) as HTMLElement;
  const output = document.getElementById("output") as HTMLElement;
  const warningNoSupport = document.getElementById(
    "warning-no-support",
  ) as HTMLElement;

  const originalChoices: string[] = [];
  let initialChoice = 0;

  function applyCodeMirror(target: HTMLElement, code: string) {
    return initCodeEditor(target, code, languageCSS(), {
      lineNumbers: false,
    });
  }

  /**
   * Enables and initializes the live code editor
   */
  function enableLiveEditor() {
    editorWrapper.classList.remove("hidden");
    exampleChoiceList.classList.add("live");
    output.classList.remove("hidden");

    for (let i = 0, l = exampleChoices.length; i < l; i++) {
      const exampleChoice = exampleChoices[i];
      const choiceButton = document.createElement("button");
      const choiceButtonText = document.createElement("span");
      const choiceCode = exampleChoice.querySelector("code") as HTMLElement;
      const copyButton = exampleChoice.getElementsByClassName(
        "copy",
      )[0] as HTMLButtonElement;

      originalChoices.push(choiceCode.textContent || "");

      const codeMirrorEditor = applyCodeMirror(
        exampleChoice.querySelector("pre") as HTMLElement,
        choiceCode.textContent || "",
      );

      choiceButton.setAttribute("type", "button");
      choiceButton.classList.add("example-choice-button");
      choiceButtonText.classList.add("visually-hidden");
      choiceButtonText.textContent = "Choose example " + (i + 1);

      choiceButton.append(choiceButtonText);
      exampleChoice.append(choiceButton);

      if (exampleChoice.getAttribute("initial-choice")) {
        initialChoice = indexOf(exampleChoices, exampleChoice);
      }

      choiceCode.remove();

      clippy.addClippy(copyButton, codeMirrorEditor);
    }

    mceEvents.register();
    mceEvents.addCSSEditorEventListeners(exampleChoiceList);
    handleResetEvents();
    handleChoiceHover();
    // Adding or removing class "invalid"
    cssEditorUtils.applyInitialSupportWarningState(exampleChoices);
  }

  /**
   * Attached an event handler on the reset button, and handles
   * reset all the CSS examples to their original state
   */
  function handleResetEvents() {
    const resetButton = document.getElementById("reset") as HTMLElement;

    resetButton.addEventListener("click", (event) => {
      if (!window.confirm("Do you really want to reset everything?")) {
        event.preventDefault();
        return;
      }

      exampleChoices.forEach((e, i) => {
        const preEl = e.querySelector("pre") as HTMLElement;

        // Remove original codemirror
        for (const e of preEl.children) {
          e.remove();
        }
        e.classList.remove("invalid", "selected");
        applyCodeMirror(preEl, originalChoices[i]);
      });

      // Adding or removing class "invalid"
      cssEditorUtils.applyInitialSupportWarningState(exampleChoices);

      // if there is an initial choice set, set it as selected
      if (initialChoice) {
        mceEvents.onChoose(exampleChoices[initialChoice] as HTMLElement);
        clippy.toggleClippy(exampleChoices[initialChoice] as HTMLElement);
      } else {
        mceEvents.onChoose(exampleChoices[0] as HTMLElement);
        clippy.toggleClippy(exampleChoices[0] as HTMLElement);
      }
    });
  }

  function indexOf(exampleChoices: NodeListOf<Element>, choice: Element) {
    for (let i = 0, l = exampleChoices.length; i < l; i++) {
      if (exampleChoices[i] === choice) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Attach mouse events to example choices
   * for allowing clippy button to display on hover
   * and otherwise return to intial hidden state
   */
  function handleChoiceHover() {
    for (let i = 0, l = exampleChoices.length; i < l; i++) {
      const choice = exampleChoices[i];
      const copyBtn = choice.querySelector(".copy") as HTMLElement;

      copyBtn.setAttribute("aria-label", "Copy to clipboard");

      choice.addEventListener("mouseover", () => {
        copyBtn.setAttribute("aria-hidden", "false");
      });
      choice.addEventListener("mouseout", () => {
        copyBtn.setAttribute("aria-hidden", "true");
      });
    }
  }

  /* only show the live code view if JS is enabled and the property is supported. */
  if (cssEditorUtils.isAnyDeclarationSetSupported(exampleDeclarations)) {
    enableLiveEditor();
    mceEvents.onChoose(exampleChoices[initialChoice] as HTMLElement);
    clippy.toggleClippy(exampleChoices[initialChoice] as HTMLElement);
  } else {
    warningNoSupport.classList.remove("hidden");
  }
})();
