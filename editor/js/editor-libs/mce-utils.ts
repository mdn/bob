/**
 * Find and return the `example-choice` parent of the provided element
 * @param {HTMLElement} element - The child element for which to find the
 * `example-choice` parent
 *
 * @return The parent `example-choice` element
 */
export function findParentChoiceElem(element: HTMLElement) {
  let parent = element.parentElement as HTMLElement;
  let parentClassList = parent.classList;
  while (parent && !parentClassList.contains("example-choice")) {
    // get the next parent
    parent = parent.parentElement as HTMLElement;
    // get the new parent's `classList`
    parentClassList = parent.classList;
  }
  return parent;
}
/**
 * Interrupts the default click event on external links inside
 * the iframe and opens them in a new tab instead
 * @param {Array} externalLinks - all external links inside the iframe
 */
export function openLinksInNewTab(
  externalLinks: NodeListOf<HTMLAnchorElement>,
) {
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
export function scrollToAnchors(
  contentWindow: Window,
  rootElement: HTMLElement,
  relativeLinks: NodeListOf<HTMLAnchorElement>,
) {
  relativeLinks.forEach((relativeLink) => {
    relativeLink.addEventListener("click", (event) => {
      event.preventDefault();
      const element = rootElement.querySelector(relativeLink.hash);
      if (element) {
        element.scrollIntoView();
        contentWindow.location.hash = relativeLink.hash;
      }
    });
  });
}
