import type { EditorView } from "codemirror";
import { getEditorContent } from "./codemirror-editor.js";

/**
 * Positions the copy to clipboard success message based on the
 * position of the button that triggered the copy event.
 * @param {HTMLButtonElement} copyButton - Button which can trigger copy action
 * @param {HTMLElement} toastElement - The feedback message container
 */
function setToastPosition(
  copyButton: HTMLButtonElement,
  toastElement: HTMLElement,
) {
  /** @var {HTMLElement} */
  const copyBtnParent = copyButton.offsetParent as HTMLElement;
  /* calculate the base top offset by combining the top
    offset of the button's parent element, and the height
    of the button */
  const positionTopBasis = copyBtnParent.offsetTop + copyButton.clientHeight;
  // Add 10px padding to the base to avoid overlapping the button
  const positionTop = positionTopBasis + 10 + "px";
  const positionLeft = copyButton.offsetLeft + "px";

  toastElement.style.top = positionTop;
  toastElement.style.left = positionLeft;
}

/**
 * Makes copyButton copy the textual content of the codeMirrorEditor upon click and show a toast with the text "Copied!"
 * @param {HTMLButtonElement} copyButton
 * @param {EditorView} codeMirrorEditor
 */
export function addClippy(
  copyButton: HTMLButtonElement,
  codeMirrorEditor: EditorView,
) {
  copyButton.addEventListener("click", () => {
    const currentText = getEditorContent(codeMirrorEditor);
    copyText(currentText);

    showToastCopied(copyButton);
  });
}

/**
 *
 * @param {string} text
 */
function copyText(text: string) {
  try {
    // Available only in HTTPs & localhost
    navigator.clipboard.writeText(text);
  } catch (err) {
    console.warn(`Unable to write text to clipboard`, err);
  }
}

/**
 * Displays and adjusts position of the "Copied!" toast
 * @param {HTMLButtonElement} copyButton - Button which can trigger copy action
 */
function showToastCopied(copyButton: HTMLButtonElement) {
  const toastElement = document.getElementById("user-message") as HTMLElement;

  const toggleToast = (show: boolean) => {
    toastElement.classList.toggle("show", show);
    toastElement.setAttribute("aria-hidden", JSON.stringify(!show));
  };

  toggleToast(true);

  setToastPosition(copyButton, toastElement);

  window.setTimeout(() => {
    toggleToast(false);
  }, 1000);
}

/**
 * Hides all instances of the clippy button, then shows
 * the button in the container element passed in
 * @param {HTMLElement} container - The container containing the button to show
 */
export function toggleClippy(container: HTMLElement) {
  /** @var {HTMLElement} */
  const activeClippy = container.querySelector(".copy");
  const clippyButtons = document.querySelectorAll(".copy");

  for (const clippyButton of clippyButtons) {
    const hide = clippyButton !== activeClippy;
    clippyButton.classList.toggle("hidden", hide);
    clippyButton.setAttribute("aria-hidden", JSON.stringify(hide));
  }
}
