import * as clippy from "./clippy.js";
import * as cssEditorUtils from "./css-editor-utils.js";

/**
 * Adds listeners for events from the CSS live examples
 * @param {Object} exampleChoiceList - The object to which events are added
 */
export function addCSSEditorEventListeners(exampleChoiceList) {
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

/**
 * Adds key & value to {@link localStorage}, without throwing an exception when it is unavailable
 */
function storeItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`Unable to write ${key} to localStorage`, err);
  }
}

/**
 * @returns the value of a given key from {@link localStorage}, or null when the key wasn't found.
 * It doesn't throw an exception when {@link localStorage} is unavailable
 */
function getStorageItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`Unable to read ${key} from localStorage`, err);
    return null;
  }
}

function sendOwnHeight() {
  if (parent) {
    parent.postMessage(
      { url: window.location.href, height: document.body.scrollHeight },
      "*"
    );
  }
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
  addPostMessageListener();

  if (document.readyState !== "loading") {
    sendOwnHeight();
  } else {
    document.addEventListener("DOMContentLoaded", sendOwnHeight);
  }
}
