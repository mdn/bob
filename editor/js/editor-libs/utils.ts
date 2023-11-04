/**
 * Adds key & value to {@link localStorage}, without throwing an exception when it is unavailable
 */
export function storeItem(key: string, value: any) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`Unable to write ${key} to localStorage`, err);
  }
}

/**
 * @returns the value of a given key from {@link localStorage}, or null when the key wasn't found.
 * It doesn't throw an exception when {@link localStorage} is unavailable
 */
export function getStorageItem(key: string) {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`Unable to read ${key} from localStorage`, err);
    return null;
  }
}
