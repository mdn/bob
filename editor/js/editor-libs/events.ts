import * as clippy from "./clippy.js";
import * as cssEditorUtils from "./css-editor-utils.js";
import { initTelemetry } from "./telemetry";
import { getStorageItem, storeItem } from "./utils";

/**
 * Adds listeners for events from the CSS live examples
 * @param exampleChoiceList - The object to which events are added
 */
export function addCSSEditorEventListeners(exampleChoiceList: HTMLElement) {
  exampleChoiceList.addEventListener("keyup", (event) => {
    const target = event.target as typeof exampleChoiceList;
    const exampleChoiceParent = target.parentElement;

    if (exampleChoiceParent) {
      cssEditorUtils.applyCode(
        exampleChoiceParent.textContent,
        exampleChoiceParent.closest(".example-choice")
      );
    }
  });

  const exampleChoices = exampleChoiceList.querySelectorAll(".example-choice");
  Array.from(exampleChoices).forEach((choice) => {
    choice.addEventListener("click", (e) =>
      onChoose(e.currentTarget as HTMLElement)
    );
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
        if (!body) {
          return;
        }
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
    const body = document.querySelector("body");
    if (body) {
      body.classList.add("theme-" + theme);
    }
  }
});

function sendOwnHeight() {
  postParentMessage("height", { height: document.body.scrollHeight });
}

export function postParentMessage(
  type: string,
  values: Record<string, string | number>
) {
  parent?.postMessage({ type, url: window.location.href, ...values }, "*");
}

/**
 * Called when a new `example-choice` has been selected.
 * @param choice - The selected `example-choice` element
 */
export function onChoose(choice: HTMLElement) {
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

  initTelemetry();
}
