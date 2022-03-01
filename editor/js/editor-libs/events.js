var clippy = require("./clippy");
var cssEditorUtils = require("./css-editor-utils");

/**
 * Adds listeners for events from the CSS live examples
 * @param {Object} exampleChoiceList - The object to which events are added
 */
function addCSSEditorEventListeners(exampleChoiceList) {
  "use strict";
  exampleChoiceList.addEventListener("cut", copyTextOnly);
  exampleChoiceList.addEventListener("copy", copyTextOnly);
  exampleChoiceList.addEventListener("paste", handlePasteEvents);

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
 * Adds listener for JavaScript errors, and logs them to GA
 */
function addJSErrorListener() {
  "use strict";
  /**
   * Catches JavaScript errors from the editor that bubble up to the
   * window and passes them on to GA
   */
  window.onerror = function (msg, url, lineNo, columnNo, error) {
    var errorDetails = [
      "URL: " + url,
      "Line: " + lineNo,
      "Column: " + columnNo,
      "Error object: " + JSON.stringify(error),
    ].join(" - ");
  };
}



/**
 * Adds postMessage listener for communication from the parent page.
 * Currently only used by the CSS editor.
 */
function addPostMessageListener() {
  "use strict";

  window.addEventListener(
    "message",
    function (event) {
      // Note that we are not checking the origin property to verify
      // the source of the message. This is because we can't know if
      // we're on developer.mozilla.org or wiki.developer.mozilla.org.
      // Since we're just setting a CSS style based on the message
      // there is no security risk.
      if (event.data.smallViewport !== undefined) {
        var editorWrapper = document.querySelector(".editor-wrapper");

        if (event.data.smallViewport) {
          editorWrapper.classList.add("small-desktop-and-below");
        } else {
          editorWrapper.classList.remove("small-desktop-and-below");
        }
      }

      // if a theme should be applied, remove all theme classes from the body,
      // then add the correct one. This is a little more verbose than it needs
      // to be to allow for future themes to be added without a change here.
      if (event.data.theme !== undefined) {
        var body = document.querySelector("body");
        for (let i = body.classList.length - 1; i >= 0; i--) {
          const className = body.classList[i];
          if (className.startsWith('theme-')) {
            body.classList.remove(className);
          }
        }
        body.classList.add('theme-' + event.data.theme);
        localStorage.setItem('theme', event.data.theme)
      }
    },
    false
  );
}

document.addEventListener("onreadystatechange", function(){
  const theme = localStorage.getItem('theme')
  if (theme !== null){
     document.querySelector("body").classList.add("theme-"+theme);
  }
});

function sendOwnHeight() {
  if (parent){
    parent.postMessage({url: window.location.href, height: document.body.scrollHeight}, '*');
  }
}

/**
 * Ensure that only the text portion of a copy event is stored in the
 * clipboard, by setting both 'text/plain', and 'text/html' to the same
 * plain text value.
 * @param {Object} event - The copy event
 */
function copyTextOnly(event) {
  "use strict";
  var selection = window.getSelection();
  var range = selection.getRangeAt(0);

  event.preventDefault();
  event.stopPropagation();

  event.clipboardData.setData("text/plain", range.toString());
  event.clipboardData.setData("text/html", range.toString());
}

/**
 * Handles paste events for the CSS editor. Concatenates the new text
 * from the clipboard with the existing, and syntax highlights the
 * result.
 * @param {Object} event - The paste event object
 */
function handlePasteEvents(event) {
  "use strict";
  var clipboardText = event.clipboardData.getData("text/plain");
  var parentPre = event.target.offsetParent;
  var parentCodeElem = parentPre.querySelector("code");
  var startValue = parentCodeElem.textContent;

  event.preventDefault();
  event.stopPropagation();

  parentCodeElem.innerText = startValue + "\n" + clipboardText;

  Prism.highlightElement(parentCodeElem);
}

function handleChoiceEvent() {
  module.exports.onChoose(this);
}

module.exports = {
  /**
   * Called when a new `example-choice` has been selected.
   * @param {Object} choice - The selected `example-choice` element
   */
  onChoose: function (choice) {
    var selected = document.querySelector(".selected");

    // highlght the code we are leaving
    if (selected && !choice.classList.contains("selected")) {
      var highlighted = Prism.highlight(
        selected.firstChild.textContent,
        Prism.languages.css
      );
      selected.firstChild.innerHTML = highlighted;

      cssEditorUtils.resetDefault();
    }

    cssEditorUtils.choose(choice);
    clippy.toggleClippy(choice);
  },
  /**
   * Called by the main JS file after all other initialization
   * has been completed.
   */
  register: function () {
    "use strict";
    var exampleChoiceList = document.getElementById("example-choice-list");

    addJSErrorListener();
    addPostMessageListener();


    if (document.readyState != 'loading'){
      sendOwnHeight();
    } else {
      document.addEventListener('DOMContentLoaded', sendOwnHeight);
    }

    // only bind events if the `exampleChoiceList` container exist
    if (exampleChoiceList) {
      addCSSEditorEventListeners(exampleChoiceList);
    }
  },
};
