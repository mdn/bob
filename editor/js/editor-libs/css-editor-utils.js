export let editTimer = undefined;

export function applyCode(code, choice, targetElement, immediateInvalidChange) {
  // http://regexr.com/3fvik
  var cssCommentsMatch = /(\/\*)[\s\S]+(\*\/)/g;
  var element = targetElement || document.getElementById("example-element");

  // strip out any CSS comments before applying the code
  code = code.replace(cssCommentsMatch, "");
    // Checking if every CSS declaration in passed code, is supported by the browser
    let codeSupported = isCodeSupported(element, code);

  element.style.cssText = code;

  // clear any existing timer
  clearTimeout(editTimer);

  /**
   * Adding or removing class "invalid" from choice parent, which will typically be <div class="example-choice">
   */
  let setInvalidClass = function() {
    if (codeSupported) {
      choice.parentNode.classList.remove('invalid');
    } else {
      choice.parentNode.classList.add('invalid');
    }
  };

  if(immediateInvalidChange) {
    // Setting class immediately
    setInvalidClass();
  } else {
    /* Start a new timer. This will ensure that the state is
    not marked as invalid, until the user has stopped typing
    for 500ms */
    editTimer = setTimeout(setInvalidClass, 500);
  }
}

/**
 * Checks if every passed declaration is supported by the browser.
 * In case browser recognizes property with vendor prefix(like -webkit-), lacking support for unprefixed property is ignored.
 * Properties with vendor prefix not recognized by the browser are always ignored.
 * @param element - any element on which cssText can be tested
 * @param declarations - list of css declarations with no curly brackets. They need to be separated by ";" and declaration key-value needs to be separated by ":". Function expects no comments.
 * @returns {boolean} - true if every declaration is supported by the browser. Properties with vendor prefix are excluded.
 */
export function isCodeSupported(element, declarations) {
    var vendorPrefixMatch = /^-(?:webkit|moz|ms|o)-/;
    var style = element.style;
    // Expecting declarations to be separated by ";"
    // Declarations with just white space are ignored
    var declarationsArray = declarations.split(";")
        .map(d => d.trim())
        .filter(d => d.length > 0);

    /**
     * @returns {boolean} - true if declaration starts with -webkit-, -moz-, -ms- or -o-
     */
    function hasVendorPrefix(declaration) {
        return vendorPrefixMatch.test(declaration);
    }

    /**
     * Looks for property name by cutting off optional vendor prefix at the beginning
     * and then cutting off rest of the declaration, starting from any whitespace or ":" in property name.
     * @param declaration - single css declaration, with not white space at the beginning
     * @returns {string} - property name without vendor prefix.
     */
    function getPropertyNameNoPrefix(declaration) {
        var prefixMatch = vendorPrefixMatch.exec(declaration);
        var prefix = prefixMatch === null ? "" : prefixMatch[0];
        var declarationNoPrefix = prefix === null ? declaration : declaration.slice(prefix.length);
        // Expecting property name to be over, when any whitespace or ":" is found
        var propertyNameSeparator = /[\s:]/;
        return declarationNoPrefix.split(propertyNameSeparator)[0];
    }
    // Clearing previous state
    style.cssText = "";

    // List of found and applied properties with vendor prefix
    let appliedPropertiesWithPrefix = new Set();
    // List of not applied properties - because of lack of support for its name or value
    let notAppliedProperties = new Set();

    for (let declaration of declarationsArray) {
        let previousCSSText = style.cssText;
        // Declarations are added one by one, because browsers sometimes combine multiple declarations into one
        // For example Chrome changes "column-count: auto;column-width: 8rem;" into "columns: 8rem auto;"
        style.cssText += declaration + ";"; // ";" was previous removed while using split method
        // In case property name or value is not supported, browsers skip single declaration, while leaving rest of them intact
        let correctlyApplied = style.cssText !== previousCSSText;

        let vendorPrefixFound = hasVendorPrefix(declaration);
        let propertyName = getPropertyNameNoPrefix(declaration);

        if (correctlyApplied && vendorPrefixFound) {
            // We are saving applied properties with prefix, so equivalent property with no prefix doesn't need to be supported
            appliedPropertiesWithPrefix.add(propertyName);
        } else if (!correctlyApplied && !vendorPrefixFound) {
            notAppliedProperties.add(propertyName);
        }
    }

    if (notAppliedProperties.size !== 0) {
        // If property with vendor prefix is supported, we can ignore the fact that browser doesn't support property with no prefix
        for (let substitute of appliedPropertiesWithPrefix) {
            notAppliedProperties.delete(substitute);
        }
        // If any other declaration is not supported, whole block should be marked as invalid
        if (notAppliedProperties.size !== 0)
            return false;
    }
    return true;
}

/**
 * Checking support for choices inner code and based on that information adding or removing class "invalid" from them.
 * This function will change styles of 'example-element', so it is important to apply them again.
 * @param choices - elements containing element code, containing css declarations to apply
 */
export function applyInitialSupportWarningState(choices) {
    for(let choice of choices) {
        let codeBlock = choice.querySelector("code");
        applyCode(codeBlock.textContent, codeBlock.parentNode, undefined, true);
    }
}

/**
 * Sets the choice to selected, changes the nested code element to be editable,
 * turns of spellchecking. Lastly, it applies the code to the example element
 * by calling applyCode.
 * @param {Object} choice - The selected `example-choice` element
 */
export function choose(choice) {
  var codeBlock = choice.querySelector("code");

  choice.classList.add("selected");

  codeBlock.setAttribute("contentEditable", true);
  codeBlock.setAttribute("spellcheck", false);

  applyCode(codeBlock.textContent, codeBlock.parentNode);
}

/**
 * Resets the default example to visible but, only if it is currently hidden
 */
export function resetDefault() {
  var defaultExample = document.getElementById("default-example");
  var output = document.getElementById("output");

  // only reset to default if the default example is hidden
  if (defaultExample.classList.contains("hidden")) {
    var sections = output.querySelectorAll("section");
    // loop over all sections and set to hidden
    for (var i = 0, l = sections.length; i < l; i++) {
      sections[i].classList.add("hidden");
      sections[i].setAttribute("aria-hidden", true);
    }
    // show the default example
    defaultExample.classList.remove("hidden");
    defaultExample.setAttribute("aria-hidden", false);
  }

  resetUIState();
}

/**
 * Resets the UI state by deselecting all example choice
 */
export function resetUIState() {
  var exampleChoiceList = document.getElementById("example-choice-list");
  var exampleChoices = exampleChoiceList.querySelectorAll(".example-choice");

  for (var i = 0, l = exampleChoices.length; i < l; i++) {
    exampleChoices[i].classList.remove("selected");
  }
}
