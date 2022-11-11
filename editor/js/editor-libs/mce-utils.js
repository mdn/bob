/**
 * Find and return the `example-choice` parent of the provided element
 * @param {Object} element - The child element for which to find the
 * `example-choice` parent
 *
 * @return The parent `example-choice` element
 */
export function findParentChoiceElem(element) {
  let parent = element.parentElement;
  let parentClassList = parent.classList;
  while (parent && !parentClassList.contains("example-choice")) {
    // get the next parent
    parent = parent.parentElement;
    // get the new parent's `classList`
    parentClassList = parent.classList;
  }
  return parent;
}

/**
 * Creates a temporary element and tests whether the passed
 * property exists on the `style` property of the element.
 * @param {Object} dataset = The dataset from which to get the property
 */
export function isPropertySupported(dataset) {
  /* If there are no 'property' attributes,
           there is nothing to test, so return true. */
  if (dataset["property"] === undefined) {
    return true;
  }

  // `property` may be a space-separated list of properties.
  const properties = dataset["property"].split(" ");
  /* Iterate through properties: if any of them apply,
        the browser supports this example. */
  const tmpElem = document.createElement("div");
  let supported = false;

  for (let i = 0, l = properties.length; i < l; i++) {
    if (tmpElem.style[properties[i]] !== undefined) {
      supported = true;
    }
  }

  return supported;
}

/**
 * Interrupts the default click event on external links inside
 * the iframe and opens them in a new tab instead
 * @param {Array} externalLinks - all external links inside the iframe
 */
export function openLinksInNewTab(externalLinks) {
  externalLinks.forEach((externalLink) => {
    externalLink.addEventListener("click", (event) => {
      event.preventDefault();
      window.open(externalLink.href);
    });
  });
}

/**
 * Interrupts the default click event on relative links inside
 * the iframe and scrolls to the targeted anchor
 * @param {Object} contentWindow - window object, that contains rootElement & relativeLinks
 * @param {Object} rootElement - root or body element, that contains referenced links
 * @param {Array} relativeLinks - all relative links inside the iframe
 */
export function scrollToAnchors(contentWindow, rootElement, relativeLinks) {
  relativeLinks.forEach((relativeLink) => {
    relativeLink.addEventListener("click", (event) => {
      event.preventDefault();
      let element = rootElement.querySelector(relativeLink.hash);
      if (element) {
        element.scrollIntoView();
        contentWindow.location.hash = relativeLink.hash;
      }
    });
  });
}
