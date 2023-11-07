/**
 * Returns the Object definition that matches the string value
 * @param {String} feature - The string value to match against
 * @returns The matched feature as an Object
 */
function getFeatureObject(feature: string) {
  let featureObj = undefined;

  switch (feature) {
    case "array-entries":
      featureObj = Array.prototype.entries;
      break;
    case "shared-array-buffer":
      featureObj = window.SharedArrayBuffer;
  }

  return featureObj;
}

/**
 * Tests whether the provided feature is supported. It
 * does this by checking the `typeof` the feature.
 * @param {String?} feature - The feature to test ex. 'array-entries'
 */
export function isDefined(feature?: string | undefined) {
  // if the feature parameter is undefined, return true
  if (feature === undefined) {
    return true;
  }

  return getFeatureObject(feature) !== undefined;
}

export function isMathMLSupported() {
  // Test used by MathML polyfill in YARI (https://github.com/mdn/yari/blob/main/client/src/document/mathml-polyfill)
  const offscreenContainer = document.createElement("div");
  const mathMLNamespace = "http://www.w3.org/1998/Math/MathML";
  const mathElement = document.createElementNS(mathMLNamespace, "math");
  const mspaceElement = document.createElementNS(mathMLNamespace, "mspace");
  mspaceElement.setAttribute("height", "23px");
  mspaceElement.setAttribute("width", "77px");
  mathElement.append(mspaceElement);
  offscreenContainer.append(mathElement);
  offscreenContainer.classList.add("offscreen");

  const mathMLTestElement = document.body.appendChild(offscreenContainer);
  if (!mspaceElement) {
    return false;
  }
  const box = mspaceElement.getBoundingClientRect();
  document.body.removeChild(mathMLTestElement);
  if (!box) {
    return false;
  }
  return Math.abs(box.height - 23) <= 1 && Math.abs(box.width - 77) <= 1;
}
