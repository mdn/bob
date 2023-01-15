/**
 * Returns the Object definition that matches the string value
 * @param {String} feature - The string value to match against
 * @returns The matched feature as an Object
 */
function getFeatureObject(feature) {
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
 * @param {String} feature - The feature to test ex. 'array-entries'
 */
export function isDefined(feature) {
  // if the feature parameter is undefined, return true
  if (feature === undefined) {
    return true;
  }

  return getFeatureObject(feature) !== undefined;
}

export function isMathMLSupported() {
  // Test of Modernizr (https://github.com/Modernizr/Modernizr/blob/master/feature-detects/mathml.js) based on work by Davide (@dpvc) and David (@davidcarlisle)
  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.display = "inline-block";
  div.innerHTML = "<math><mfrac><mi>xx</mi><mi>yy</mi></mfrac></math>";

  const addedElement = document.body.appendChild(div);
  const hasMathML = div.offsetHeight > div.offsetWidth;
  document.body.removeChild(addedElement);
  return hasMathML;
}
