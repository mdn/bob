import { postParentMessage } from "./events.js";

const ACTION_COUNTS_KEY = "action-counts";

/**
 * Reads action counts from local storage.
 * Ignores action counts that belong to another example.
 *
 * @returns The action counts from the previous session, if available.
 */
function readActionsCounts() {
  try {
    const value = JSON.parse(localStorage.getItem(ACTION_COUNTS_KEY));
    if (value && value.href === window.location.href && value.counts) {
      return value.counts;
    }
  } catch (e) {
    window.console.warn("Unable to read action counts from localStorage", e);
  }

  return {};
}

/**
 * Writes action counts to local storage, to persist them between reloads.
 *
 * @param {object} counts - The current action counts.
 */
function persistActionCounts(counts) {
  try {
    localStorage.setItem(
      ACTION_COUNTS_KEY,
      JSON.stringify({
        href: window.location.href,
        counts,
      })
    );
  } catch (e) {
    window.console.warn("Unable to write action counts to localStorage", e);
  }
}

/**
 * Action counts by key.
 * Used to distinguish 1st/2nd/etc occurrences of the same event.
 */
const actionCounts = readActionsCounts();

/**
 * Last observed action.
 * Used to ignore multiple input actions until another action happened.
 */
let lastAction = null;

/**
 * Records an action, by counting it and forwarding it to the window parent.
 *
 * @param {string} key - Distinct name of the type of action.
 * @param {boolean} deduplicate - Should multiple actions of the same type be ignored until another action occurred?
 */
export function recordAction(key, deduplicate = false) {
  actionCounts[key] = actionCounts[key] ?? 0;

  if (deduplicate && key === lastAction) {
    return;
  } else {
    lastAction = key;
  }

  let source = `${key} -> ${actionCounts[key]}`;
  actionCounts[key]++;
  persistActionCounts(actionCounts);

  postParentMessage("action", { source });
}

document.addEventListener("DOMContentLoaded", () => {
  // User focuses the iframe.
  window.addEventListener("focus", () => recordAction("focus"));

  // User copies / cuts / paste text in the iframe.
  window.addEventListener("copy", () => recordAction("copy"));
  window.addEventListener("cut", () => recordAction("cut"));
  window.addEventListener("paste", () => recordAction("paste"));

  // User clicks on any element with an id.
  window.addEventListener("click", (event) => {
    const id = event.target.id;
    if (id) {
      recordAction(`click@${id}`);
    }
  });
});
