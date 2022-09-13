import Prism from "prismjs";

/**
 * Highlights codeblocks of specified code (or target's content) and applies it to the target element
 */
function highlightCode(target, language, code) {
  var highlighted = Prism.highlight(
    code || target.textContent,
    Prism.languages[language]
  );
  target.innerHTML = highlighted;
}

export default highlightCode;
