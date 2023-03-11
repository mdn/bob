// TODO This is a temporary ts-ignore, used until converting codemirror-editor to ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getEditorContent } from "./codemirror-editor.js";
import { EditorView } from "codemirror";

/**
 * Positions the copy to clipboard success message based on the
 * position of the button that triggered the copy event.
 * @param copyButton - Button which can trigger copy action
 * @param toastElement - The feedback message container
 */
function setToastPosition(
  copyButton: HTMLButtonElement,
  toastElement: HTMLElement
) {
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
 */
export function addClippy(
  copyButton: HTMLButtonElement,
  codeMirrorEditor: EditorView
) {
  copyButton.addEventListener("click", () => {
    const currentText = getEditorContent(codeMirrorEditor);
    copyText(currentText);

    showToastCopied(copyButton);
  });
}

function copyText(text: string) {
  if (navigator.clipboard)
    // Available only in HTTPs & localhost
    navigator.clipboard.writeText(text);
}

/**
 * Displays and adjusts position of the "Copied!" toast
 * @param copyButton - Button which can trigger copy action
 */
function showToastCopied(copyButton: HTMLButtonElement) {
  const toastElement = document.getElementById("user-message") as HTMLElement;

  toastElement.classList.add("show");
  toastElement.setAttribute("aria-hidden", "false");

  setToastPosition(copyButton, toastElement);

  window.setTimeout(() => {
    toastElement.classList.remove("show");
    toastElement.setAttribute("aria-hidden", "true");
  }, 1000);
}

/**
 * Hides all instances of the clippy button, then shows
 * the button in the container element passed in
 * @param {Object} container - The container containing the button to show
 */
export function toggleClippy(container: HTMLElement) {
  const activeClippy = container.querySelector(".copy") as HTMLElement;
  const clippyButtons = document.querySelectorAll(".copy");

  for (let i = 0, l = clippyButtons.length; i < l; i++) {
    clippyButtons[i].classList.add("hidden");
    clippyButtons[i].setAttribute("aria-hidden", "true");
  }

  activeClippy.classList.remove("hidden");
  activeClippy.setAttribute("aria-hidden", "false");
}
