export let editTimer = undefined;

export function applyCode(
  code,
  choice,
  targetElement?,
  immediateInvalidChange?
) {
  // http://regexr.com/3fvik
  const cssCommentsMatch = /(\/\*)[\s\S]+(\*\/)/g;
  const element = targetElement || document.getElementById("example-element");

  // strip out any CSS comments before applying the code
  code = code.replace(cssCommentsMatch, "");
  // Checking if every CSS declaration in passed code, is supported by the browser
  const codeSupported = isCodeSupported(element, code);

  element.style.cssText = code;

  // clear any existing timer
  clearTimeout(editTimer);

  /**
   * Adding or removing class "invalid" from choice parent, which will typically be <div class="example-choice">
   */
  function setInvalidClass() {
    if (codeSupported) {
      choice.classList.remove("invalid");
    } else {
      choice.classList.add("invalid");
    }
  }

  if (immediateInvalidChange) {
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
 * Creates a temporary element and tests whether any of the provided CSS sets of declarations are fully supported by the user's browser
 * @param {Array} declarationSets - Array in which every element is one or multiple declarations separated by semicolons
 */
export function isAnyDeclarationSetSupported(declarationSets) {
  const tmpElem = document.createElement("div");
  return declarationSets.some(isCodeSupported.bind(null, tmpElem));
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
  const vendorPrefixMatch = /^-(?:webkit|moz|ms|o)-/;
  const style = element.style;
  // Expecting declarations to be separated by ";"
  // Declarations with just white space are ignored
  const declarationsArray = declarations
    .split(";")
    .map((d) => d.trim())
    .filter((d) => d.length > 0);

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
    const prefixMatch = vendorPrefixMatch.exec(declaration);
    const prefix = prefixMatch === null ? "" : prefixMatch[0];
    const declarationNoPrefix =
      prefix === null ? declaration : declaration.slice(prefix.length);
    // Expecting property name to be over, when any whitespace or ":" is found
    const propertyNameSeparator = /[\s:]/;
    return declarationNoPrefix.split(propertyNameSeparator)[0];
  }
  // Clearing previous state
  style.cssText = "";

  // List of found and applied properties with vendor prefix
  const appliedPropertiesWithPrefix = new Set();
  // List of not applied properties - because of lack of support for its name or value
  const notAppliedProperties = new Set();

  for (const declaration of declarationsArray) {
    const previousCSSText = style.cssText;
    // Declarations are added one by one, because browsers sometimes combine multiple declarations into one
    // For example Chrome changes "column-count: auto;column-width: 8rem;" into "columns: 8rem auto;"
    style.cssText += declaration + ";"; // ";" was previous removed while using split method
    // In case property name or value is not supported, browsers skip single declaration, while leaving rest of them intact
    const correctlyApplied = style.cssText !== previousCSSText;

    const vendorPrefixFound = hasVendorPrefix(declaration);
    const propertyName = getPropertyNameNoPrefix(declaration);

    if (correctlyApplied && vendorPrefixFound) {
      // We are saving applied properties with prefix, so equivalent property with no prefix doesn't need to be supported
      appliedPropertiesWithPrefix.add(propertyName);
    } else if (!correctlyApplied && !vendorPrefixFound) {
      notAppliedProperties.add(propertyName);
    }
  }

  if (notAppliedProperties.size !== 0) {
    // If property with vendor prefix is supported, we can ignore the fact that browser doesn't support property with no prefix
    for (const substitute of appliedPropertiesWithPrefix) {
      notAppliedProperties.delete(substitute);
    }
    // If any other declaration is not supported, whole block should be marked as invalid
    if (notAppliedProperties.size !== 0) return false;
  }
  return true;
}

/**
 * Checking support for choices inner code and based on that information adding or removing class "invalid" from them.
 * This function will change styles of 'example-element', so it is important to apply them again.
 * @param choices - elements containing element code, containing css declarations to apply
 */
export function applyInitialSupportWarningState(choices) {
  for (const choice of choices) {
    const codeBlock = choice.querySelector(".cm-content");
    applyCode(codeBlock.textContent, choice, undefined, true);
  }
}

/**
 * Sets the choice to selected, changes the nested code element to be editable,
 * turns of spellchecking. Lastly, it applies the code to the example element
 * by calling applyCode.
 * @param {Object} choice - The selected `example-choice` element
 */
export function choose(choice) {
  choice.classList.add("selected");
  const codeBlock = choice.querySelector(".cm-content");
  applyCode(codeBlock.textContent, choice);
}

/**
 * Resets the default example to visible but, only if it is currently hidden
 */
export function resetDefault() {
  const defaultExample = document.getElementById("default-example");
  const output = document.getElementById("output");

  // only reset to default if the default example is hidden
  if (defaultExample.classList.contains("hidden")) {
    const sections = output.querySelectorAll("section");
    // loop over all sections and set to hidden
    for (let i = 0, l = sections.length; i < l; i++) {
      sections[i].classList.add("hidden");
      sections[i].setAttribute("aria-hidden", "true");
    }
    // show the default example
    defaultExample.classList.remove("hidden");
    defaultExample.setAttribute("aria-hidden", "false");
  }

  resetUIState();
}

/**
 * Resets the UI state by deselecting all example choice
 */
export function resetUIState() {
  const exampleChoiceList = document.getElementById("example-choice-list");
  const exampleChoices = exampleChoiceList.querySelectorAll(".example-choice");

  for (let i = 0, l = exampleChoices.length; i < l; i++) {
    exampleChoices[i].classList.remove("selected");
  }
}
