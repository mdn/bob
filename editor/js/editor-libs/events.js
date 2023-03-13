import * as clippy from "./clippy.js";
import * as cssEditorUtils from "./css-editor-utils.js";
import { getStorageItem, storeItem } from "./utils.js";

/**
 * Adds listeners for events from the CSS live examples
 * @param {Object} exampleChoiceList - The object to which events are added
 */
function addCSSEditorEventListeners(exampleChoiceList) {
  exampleChoiceList.addEventListener("cut", copyTextOnly);
  exampleChoiceList.addEventListener("copy", copyTextOnly);

  exampleChoiceList.addEventListener("keyup", (event) => {
    const exampleChoiceParent = event.target.parentElement;

    cssEditorUtils.applyCode(
      exampleChoiceParent.textContent,
      exampleChoiceParent.closest(".cm-scroller")
    );
  });

  const exampleChoices = exampleChoiceList.querySelectorAll(".example-choice");
  Array.from(exampleChoices).forEach((choice) => {
    choice.addEventListener("click", handleChoiceEvent);
  });
}

/**
 * Adds postMessage listener for communication from the parent page.
 * Currently only used by the CSS editor.
 */
function addPostMessageListener() {
  window.addEventListener(
    "message",
    (event) => {
      // if a theme should be applied, remove all theme classes from the body,
      // then add the correct one. This is a little more verbose than it needs
      // to be to allow for future themes to be added without a change here.
      if (event.data.theme !== undefined) {
        const body = document.querySelector("body");
        for (let i = body.classList.length - 1; i >= 0; i--) {
          const className = body.classList[i];
          if (className.startsWith("theme-")) {
            body.classList.remove(className);
          }
        }
        body.classList.add("theme-" + event.data.theme);
        storeItem("theme", event.data.theme);
      }
    },
    false
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const theme = getStorageItem("theme");
  if (theme !== null) {
    document.querySelector("body").classList.add("theme-" + theme);
  }
});

function sendOwnHeight() {
  postParentMessage("height", { height: document.body.scrollHeight });
}

export function postParentMessage(type, values) {
  parent?.postMessage({ type, url: window.location.href, ...values }, "*");
}

/**
 * Ensure that only the text portion of a copy event is stored in the
 * clipboard, by setting both 'text/plain', and 'text/html' to the same
 * plain text value.
 * @param {Object} event - The copy event
 */
function copyTextOnly(event) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  event.preventDefault();
  event.stopPropagation();

  event.clipboardData.setData("text/plain", range.toString());
  event.clipboardData.setData("text/html", range.toString());
}

function handleChoiceEvent() {
  onChoose(this);
}

/**
 * Called when a new `example-choice` has been selected.
 * @param {Object} choice - The selected `example-choice` element
 */
export function onChoose(choice) {
  const selected = document.querySelector(".selected");

  // highlght the code we are leaving
  if (selected && !choice.classList.contains("selected")) {
    cssEditorUtils.resetDefault();
  }

  cssEditorUtils.choose(choice);
  clippy.toggleClippy(choice);
}

/**
 * Called by the main JS file after all other initialization
 * has been completed.
 */
export function register() {
  const exampleChoiceList = document.getElementById("example-choice-list");

  addPostMessageListener();

  if (document.readyState !== "loading") {
    sendOwnHeight();
  } else {
    document.addEventListener("DOMContentLoaded", sendOwnHeight);
  }

  // only bind events if the `exampleChoiceList` container exist
  if (exampleChoiceList) {
    addCSSEditorEventListeners(exampleChoiceList);
  }
}
