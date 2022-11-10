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
