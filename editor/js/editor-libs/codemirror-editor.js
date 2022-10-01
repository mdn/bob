import { EditorView } from "codemirror";
import { EditorState } from "@codemirror/state";
import * as commands from "@codemirror/commands";
import * as view from "@codemirror/view";
import {
  bracketMatching,
  syntaxHighlighting,
  indentOnInput,
  foldKeymap,
  HighlightStyle,
  LRLanguage,
} from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { lintKeymap } from "@codemirror/lint";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { wast } from "@codemirror/lang-wast";
import { html } from "@codemirror/lang-html";
import { css, cssLanguage } from "@codemirror/lang-css";

import { parseMixed } from "@lezer/common";
import { tags } from "@lezer/highlight";
import { parser as jsParser } from "@lezer/javascript";
import { parser as htmlParser } from "@lezer/html";
import { parser as cssParser } from "@lezer/css";

import "../../css/editor-libs/codemirror-override.css";

/**
 * Adds tab character in current place of selection when Tab button was clicked.
 * When Tab button was clicked together with shift, tab character is removed from line beginning
 */
const TAB_KEY_MAP = {
  key: "Tab",
  run: commands.insertTab,
  shift: commands.indentLess,
};

/**
 * Translates CSS tags from [highlight.js](https://github.com/lezer-parser/css/blob/main/src/highlight.js) to code mirror CSS classes.
 */
const CSS_HIGHLIGHT_STYLE_SPECS = [
  { tag: [tags.definitionKeyword], class: "" }, // "import charset namespace keyframes"
  { tag: [tags.controlKeyword], class: "" }, // "media supports"
  { tag: [tags.namespace], class: "cm-tag" }, // Identifier of @namespace
  { tag: [tags.tagName], class: "cm-tag" }, // Tag Selector
  { tag: [tags.className], class: "cm-qualifier" }, // Class Selector
  { tag: [tags.constant(tags.className)], class: "cm-variable-3" }, // ":valid", "::cue"
  { tag: [tags.labelName], class: "cm-builtin" }, // Id Selector
  { tag: [tags.propertyName], class: "cm-property" }, // property-name: value;
  { tag: [tags.attributeName], class: "cm-tag" }, // name inside [name="value"]
  { tag: [tags.number], class: "cm-number" }, // NumberLiteral
  { tag: [tags.operatorKeyword], class: "cm-keyword" }, // "not", "only"
  { tag: [tags.atom], class: "cm-keyword" }, // "initial", "all", "blue"
  { tag: [tags.variableName], class: "cm-variable-2" }, // --variable
  { tag: [tags.unit], class: "cm-number" }, // "%", "px"
  { tag: [tags.definitionOperator], class: "" }, // Selectors: "*",  "&"
  { tag: [tags.keyword], class: "cm-keyword" }, // "all", "from", "to", "selector", "all", "@layer"
  { tag: [tags.compareOperator], class: "" }, // "~=", "^=", "|=", "$=", "*="
  { tag: [tags.logicOperator], class: "cm-keyword" }, // ">",  "~", "+", "and", "or"
  { tag: [tags.arithmeticOperator], class: "" }, // "+", "-"
  { tag: [tags.modifier], class: "cm-keyword" }, // !important
  { tag: [tags.blockComment], class: "cm-comment" }, // /* comment */
  { tag: [tags.string], class: "cm-string" }, // "text"
  { tag: [tags.derefOperator], class: "cm-builtin" }, // "#" in ID Selector
  { tag: [tags.separator], class: "" }, // ";" , ","
  { tag: [tags.paren], class: "" }, // "(", ")"
  { tag: [tags.squareBracket], class: "" }, // "[", "]"
  { tag: [tags.brace], class: "" }, // "{", "}"
  { tag: [tags.color], class: "cm-atom" }, // "#fff"
];

/**
 * Translates HTML tags from [highlight.js](https://github.com/lezer-parser/html/blob/main/src/highlight.js) to code mirror CSS classes.
 */
const HTML_HIGHLIGHT_STYLE_SPECS = [
  { tag: [tags.content], class: "" }, // Element Content
  { tag: [tags.angleBracket], class: "cm-bracket" }, // "<", ">"
  { tag: [tags.tagName], class: "cm-tag" }, // Tag Name
  { tag: tags.invalid, class: "tag_invalid" },
  { tag: [tags.attributeName], class: "cm-attribute" }, // Attribute Name
  { tag: [tags.attributeValue], class: "cm-string" }, // Attribute Value
  { tag: [tags.definitionOperator], class: "" }, // "="
  { tag: [tags.character], class: "cm-atom" }, // "&lt;"
  { tag: [tags.blockComment], class: "cm-comment" }, // <!-- comment -->
  { tag: [tags.processingInstruction], class: "cm-meta" }, // <?php ?>
  { tag: [tags.documentMeta], class: "cm-meta" }, // <!DOCTYPE html>
];

/**
 * Translates HTML tags from [highlight.js](https://github.com/lezer-parser/javascript/blob/main/src/highlight.js) to code mirror CSS classes.
 */
const JS_HIGHLIGHT_STYLE_SPECS = [
  { tag: tags.comment, class: "cm-comment" },
  { tag: tags.name, class: "cm-string" },
  { tag: tags.tagName, class: "cm-tag" },
  { tag: tags.propertyName, class: "cm-property" },
  { tag: tags.attributeName, class: "cm-attribute" },
  { tag: tags.literal, class: "cm-atom" },
  { tag: tags.string, class: "cm-string" },
  { tag: tags.number, class: "cm-number" },
  { tag: tags.keyword, class: "cm-keyword" },
  { tag: tags.operator, class: "cm-operator" },
  { tag: tags.angleBracket, class: "cm-bracket" },
  { tag: tags.unit, class: "cm-number" },
  { tag: tags.atom, class: "cm-keyword" },
  { tag: tags.className, class: "cm-qualifier" },
  { tag: tags.null, class: "cm-atom" }, // "null"
  { tag: tags.variableName, class: "" }, // variables, "undefined", "NaN", "Infinity"
  { tag: tags.modifier, class: "cm-property" }, // "get", "set", "async", "static"
  { tag: [tags.special(tags.string)], class: "cm-string-2" }, // Template Strings
  { tag: tags.labelName, class: "" }, // "label: while();"
];

/**
 * Translates HTML tags from [highlight.js](https://github.com/lezer-parser/javascript/blob/main/src/highlight.js) to code mirror CSS classes.
 */
const WAST_HIGHLIGHT_STYLE_SPECS = [
  { tag: tags.keyword, class: "cm-keyword" }, // "func", "import", "module
  { tag: tags.typeName, class: "cm-string" }, // "anyref", "dataref", "i31ref", "funcref", "i32", "f64"
  { tag: tags.number, class: "cm-number" }, // +12.3, -1, 0xFF
  { tag: tags.string, class: "cm-string" }, // "text"
  { tag: tags.variableName, class: "cm-variable-2" }, // $var
  { tag: tags.lineComment, class: "cm-comment" }, // ";;"
  { tag: tags.blockComment, class: "cm-comment" }, // "(; comment ;)"
  { tag: tags.paren, class: "" }, // "(", ")"
];

/**
 * @param specs - an array that associates the given styles to the given tags
 * @return {Extension} - Code Mirror extension attaching class names to a given tags
 */
function highlighting(specs) {
  return syntaxHighlighting(HighlightStyle.define(specs), { fallback: false });
}

/**
 *
 * @param specs - an array that associates the given styles to the given tags
 * @param scope - language for which extension will be active
 * @param nodeName - optional name of Syntax Nodes for which extension will be active
 * @return {Extension} - Code Mirror extension attaching class names to a given tags, but only to a given language or node tree
 */
function scopedHighlighting(specs, scope, nodeName = undefined) {
  const style = HighlightStyle.define(specs, { scope: scope });
  if (nodeName) {
    style.scope = (node) => node.name === nodeName; // This line overrides internal scope check, because alternative parsers don't attach chosen language to props
  }
  return syntaxHighlighting(style, { fallback: false });
}

/**
 * @param callback {function(): *} returning a value to memoize
 * @return {*} - first result of provided function
 */
function memo(callback) {
  let value;
  return () => (value === undefined ? ((value = callback()), value) : value);
}

/**
 * @return {LRLanguage} - new language capable of parsing JavaScript and CSS inside HTML code
 */
function mixedHTML() {
  const mixedHTMLParser = htmlParser.configure({
    wrap: parseMixed((node) => {
      //ScriptText & StyleText can be found in [html.grammar](https://github.com/lezer-parser/html/blob/main/src/html.grammar)
      if (node.name == "ScriptText") {
        return { parser: jsParser };
      } else if (node.name == "StyleText") {
        return { parser: cssParser };
      }
      return null;
    }),
  });

  return LRLanguage.define({ parser: mixedHTMLParser });
}

/**
 * Set of basic extensions, that every editor should have.
 * This list is mostly based on [basic setup](https://github.com/codemirror/basic-setup)
 */
const BASE_EXTENSIONS = [
  view.highlightSpecialChars(),
  commands.history(),
  view.drawSelection(),
  view.dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  view.rectangularSelection(),
  view.crosshairCursor(),
  highlightSelectionMatches(),
  view.keymap.of([
    ...closeBracketsKeymap,
    ...commands.defaultKeymap,
    ...searchKeymap,
    ...commands.historyKeymap,
    ...foldKeymap,
    ...lintKeymap,
    TAB_KEY_MAP,
  ]),
];

/**
 * Function returning JavaScript language extensions, which should be passed to {initCodeEditor}
 */
export const languageJavaScript = memo(() => ({
  extensions: [javascript(), highlighting(JS_HIGHLIGHT_STYLE_SPECS)],
}));

/**
 * Function returning CSS language extensions, which should be passed to {initCodeEditor}
 */
export const languageCSS = memo(() => ({
  extensions: [css(), highlighting(CSS_HIGHLIGHT_STYLE_SPECS)],
}));

/**
 * Function returning WAST language extensions, which should be passed to {initCodeEditor}
 */
export const languageWAST = memo(() => ({
  extensions: [
    wast(),
    EditorView.lineWrapping, //Makes long lines be wrapped to a new line, instead of creating horizontal scrollbar
    highlighting(WAST_HIGHLIGHT_STYLE_SPECS),
  ],
}));

/**
 * Function returning HTML language extensions, which should be passed to {initCodeEditor}
 */
export const languageHTML = memo(() => {
  const language = mixedHTML();
  return {
    extensions: [
      language,
      EditorView.lineWrapping, //Makes long lines be wrapped to a new line, instead of creating horizontal scrollbar
      //CSS in <style> + JS in <script> + HTML as a default
      scopedHighlighting(CSS_HIGHLIGHT_STYLE_SPECS, cssLanguage, "StyleSheet"),
      scopedHighlighting(
        JS_HIGHLIGHT_STYLE_SPECS,
        javascriptLanguage,
        "Script"
      ),
      scopedHighlighting(HTML_HIGHLIGHT_STYLE_SPECS, language),
    ],
  };
});

/**
 * Creates new standalone code editor
 * @param editorContainer - HTML element which will have its content replaced with the editor
 * @param initialContent - Initial textual content of the editor
 * @param language - Object containing language specific extensions to attach. It can be result of function call to {languageJavaScript}, {languageCSS}, {languageHTML}, {languageWAST}
 * @param options - An object containing additional options, such as disabling line numbers
 * @return {EditorView} - Code editor which should be saved, so it's content can be fetched by {getEditorContent}
 */
export function initCodeEditor(
  editorContainer,
  initialContent,
  language,
  options = { lineNumbers: true }
) {
  const extensions = [...BASE_EXTENSIONS, ...language.extensions];

  if (options.lineNumbers) {
    extensions.push(view.lineNumbers(), view.gutter());
  }

  return new EditorView({
    doc: initialContent,
    extensions,
    parent: editorContainer,
  });
}

/**
 *
 * @param editorView - code editor returned by {initCodeEditor}
 * @return {string} - current textual content of provided editor
 */
export function getEditorContent(editorView) {
  return editorView.state.doc.toString();
}
