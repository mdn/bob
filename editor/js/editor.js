(function () {
  "use strict";

  var mceConsole = require("./editor-libs/console");
  var mceEvents = require("./editor-libs/events.js");
  var mceUtils = require("./editor-libs/mce-utils");
  var shadowOutput = require("./editor-libs/shadow-output");
  var templateUtils = require("./editor-libs/template-utils");
  var tabby = require("./editor-libs/tabby");

  var cssEditor = document.getElementById("css-editor");
  var clearConsole = document.getElementById("clear");
  var editorContainer = document.getElementById("editor-container");
  var header = document.querySelector(".output-header");
  var htmlEditor = document.getElementById("html-editor");
  var jsEditor = document.getElementById("js-editor");
  var staticCSSCode = cssEditor.querySelector("pre");
  var staticHTMLCode = htmlEditor.querySelector("pre");
  var staticJSCode = jsEditor.querySelector("pre");
  var timer;

  /**
   * Called by the tabbed editor to combine code from all tabs in an Object
   * @returns Object with code from each tab panel
   * Example
   * --------
   * {
   *     cssContent: 'h1 { background-color: #333; }',
   *     htmlContent: '<h1>Title</h1>'
   * }
   */
  function getOutput() {
    var editorContents = {
      htmlContent: tabby.editors.html.editor.getValue(),
      cssContent: tabby.editors.css.editor.getValue(),
    };

    // not all editor instances have a JS panel
    if (tabby.editors.js.editor) {
      editorContents.jsContent = tabby.editors.js.editor.getValue();
    }

    return editorContents;
  }

  /**
   * Set or update the CSS and HTML in the output pane.
   * @param {Object} content - The content of the template element.
   */
  function render(content) {
    let shadow = document.querySelector("shadow-output").shadowRoot;
    let shadowChildren = shadow.children;

    if (shadowChildren.length) {
      if (typeof ShadyDOM !== "undefined" && ShadyDOM.inUse) {
        shadow.innerHTML = "";
      } else {
        var output = shadow.querySelector(".output");
        output && shadow.removeChild(output);
        var styleElements = shadow.querySelectorAll("style");

        for (var styleElement in styleElements) {
          if (
            styleElements.hasOwnProperty(styleElement) &&
            styleElements[styleElement]
          ) {
            shadow.removeChild(styleElements[styleElement]);
          }
        }
      }
    }

    shadow.appendChild(document.importNode(content, true));
    mceUtils.openLinksInNewTab(shadow.querySelectorAll('a[href^="http"]'));
    mceUtils.scrollToAnchors(shadow, shadow.querySelectorAll('a[href^="#"]'));
  }

  /**
   * Called from the editors on keyup events. Starts a 500 millisecond timer.
   * If no other keyup events happens before the 500 millisecond have elapsed,
   * update the output
   */
  function autoUpdate() {
    // clear the existing timer
    clearTimeout(timer);

    timer = setTimeout(function () {
      templateUtils.createTemplate(getOutput());
      render(templateUtils.getTemplateOutput());
    }, 500);
  }

  header.addEventListener("click", function (event) {
    if (event.target.classList.contains("reset")) {
      window.location.reload();
    }
  });

  htmlEditor.addEventListener("keyup", function () {
    autoUpdate();
  });

  cssEditor.addEventListener("keyup", function () {
    autoUpdate();
  });

  jsEditor.addEventListener("keyup", function () {
    autoUpdate();
  });

  clearConsole.addEventListener("click", function () {
    var webapiConsole = document.querySelector("#console code");
    webapiConsole.textContent = "";
  });

  // hide the static example when JS enabled
  staticHTMLCode.classList.add("hidden");
  // hide the static CSS example
  staticCSSCode.classList.add("hidden");
  // hide the static JS example
  staticJSCode.classList.add("hidden");
  // show the content
  editorContainer.classList.remove("hidden");

  /**
   * @returns {string[]} - IDs of editors that should be visible in the example.
   */
  function getTabs(editorContainer) {
    if (editorContainer.dataset && editorContainer.dataset.tabs) {
      return editorContainer.dataset.tabs.split(",");
    } else {
      return ["html", "css"];
    }
  }

  /**
   * @returns {string} - ID of editor that should be active be default.
   */
  function getDefaultTab(editorContainer, tabs) {
    if (editorContainer.dataset && editorContainer.dataset.defaultTab) {
      return editorContainer.dataset.defaultTab;
    } else if (tabs.includes("js")) {
      return "js";
    } else {
      return "html";
    }
  }

  let tabs = getTabs(editorContainer);
  let defaultTab = getDefaultTab(editorContainer, tabs);
  tabby.initEditor(tabs, document.getElementById(defaultTab));

  mceConsole();

  tabby.registerEventListeners();
  mceEvents.register();

  // register the custom output element
  customElements.define("shadow-output", shadowOutput);

  templateUtils.createTemplate(getOutput());

  document.addEventListener("WebComponentsReady", function () {
    render(templateUtils.getTemplateOutput());
  });
})();
