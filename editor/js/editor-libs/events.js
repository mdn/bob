import * as clippy from "./clippy.js";
import * as cssEditorUtils from "./css-editor-utils.js";

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

function postParentMessage(type, values) {
  parent?.postMessage({ type, url: window.location.href, ...values }, "*");
}

const ACTION_COUNTS_KEY = "action-counts";

function readActionsCounts() {
  try {
    const value = JSON.parse(localStorage.getItem(ACTION_COUNTS_KEY));
    window.console.log("readActionsCount", value);
    if (value && value.href === window.location.href && value.counts) {
      return value.counts;
    }
  } catch (e) {
    window.console.warn("Unable to read action counts from localStorage", e);
  }

  return {};
}

function persistActionCounts(counts) {
  try {
    localStorage.setItem(
      ACTION_COUNTS_KEY,
      JSON.stringify({
        href: window.location.href,
        counts,
      })
    );
  } catch (e) {
    window.console.warn("Unable to write action counts to localStorage", e);
  }
}

const actionCounts = readActionsCounts();
let lastAction = null;

/**
 * @param {string} key
 * @param {boolean} once
 */
export function postActionMessage(key, deduplicate = false) {
  actionCounts[key] = actionCounts[key] ?? 0;

  if (deduplicate && key === lastAction) {
    return;
  } else {
    lastAction = key;
  }

  let source = `${key} -> ${actionCounts[key]}`;
  actionCounts[key]++;
  persistActionCounts(actionCounts);

  postParentMessage("action", { source });
}

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("focus", () => postActionMessage("focus"));

  window.addEventListener("copy", () => postActionMessage("copy"));
  window.addEventListener("cut", () => postActionMessage("cut"));
  window.addEventListener("paste", () => postActionMessage("paste"));

  window.addEventListener("click", (event) => {
    const id = event.target.id;
    if (id) {
      postActionMessage(`click@${id}`);
    }
  });

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
  postParentMessage("height", { height: document.body.scrollHeight });
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
