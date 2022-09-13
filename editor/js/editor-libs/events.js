import * as clippy from "./clippy.js";
import * as cssEditorUtils from "./css-editor-utils.js";

/**
 * Adds listeners for events from the CSS live examples
 * @param {Object} exampleChoiceList - The object to which events are added
 */
function addCSSEditorEventListeners(exampleChoiceList) {
  exampleChoiceList.addEventListener("cut", copyTextOnly);
  exampleChoiceList.addEventListener("copy", copyTextOnly);

  exampleChoiceList.addEventListener("keyup", function (event) {
    var exampleChoiceParent = event.target.parentElement;

    cssEditorUtils.applyCode(
      exampleChoiceParent.textContent,
      exampleChoiceParent
    );
  });

  var exampleChoices = exampleChoiceList.querySelectorAll(".example-choice");
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
    function (event) {
      // if a theme should be applied, remove all theme classes from the body,
      // then add the correct one. This is a little more verbose than it needs
      // to be to allow for future themes to be added without a change here.
      if (event.data.theme !== undefined) {
        var body = document.querySelector("body");
        for (let i = body.classList.length - 1; i >= 0; i--) {
          const className = body.classList[i];
          if (className.startsWith("theme-")) {
            body.classList.remove(className);
          }
        }
        body.classList.add("theme-" + event.data.theme);
        localStorage.setItem("theme", event.data.theme);
      }
    },
    false
  );
}

document.addEventListener("DOMContentLoaded", function () {
  const theme = localStorage.getItem("theme");
  if (theme !== null) {
    document.querySelector("body").classList.add("theme-" + theme);
  }
});

function sendOwnHeight() {
  if (parent) {
    parent.postMessage(
      { url: window.location.href, height: document.body.scrollHeight },
      "*"
    );
  }
}

/**
 * Ensure that only the text portion of a copy event is stored in the
 * clipboard, by setting both 'text/plain', and 'text/html' to the same
 * plain text value.
 * @param {Object} event - The copy event
 */
function copyTextOnly(event) {
  var selection = window.getSelection();
  var range = selection.getRangeAt(0);

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
  var selected = document.querySelector(".selected");

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
  var exampleChoiceList = document.getElementById("example-choice-list");

  addPostMessageListener();

  if (document.readyState != "loading") {
    sendOwnHeight();
  } else {
    document.addEventListener("DOMContentLoaded", sendOwnHeight);
  }

  // only bind events if the `exampleChoiceList` container exist
  if (exampleChoiceList) {
    addCSSEditorEventListeners(exampleChoiceList);
  }
}
