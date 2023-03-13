import { postParentMessage } from "./events.js";

const ACTION_COUNTS_KEY = "action-counts";

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

const actionCounts = readActionsCounts();
let lastAction = null;

/**
 * @param {string} key
 * @param {boolean} once
 */
export function postActionMessage(key, deduplicate = false) {
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
  window.addEventListener("focus", () => postActionMessage("focus"));

  window.addEventListener("copy", () => postActionMessage("copy"));
  window.addEventListener("cut", () => postActionMessage("cut"));
  window.addEventListener("paste", () => postActionMessage("paste"));

  window.addEventListener("click", (event) => {
    const id = event.target.id;
    if (id) {
      postActionMessage(`click@${id}`);
    }
  });
});
