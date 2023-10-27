/**
 * Content of the ".bobconfigrc"
 */
export interface BobConfig {
  /** Base output directory */
  baseDir: string;
  /** Base output directory of editor's css files */
  destCssDir: string;
  /** Base output directory of editor's js files */
  destJsDir: string;
  /** Path to a directory containing fonts, which will be copied to fontsMediaDest */
  examplesFontsRoot: string;
  /** Path to a directory containing images & other resources, which will be copied to examplesMediaDest */
  examplesMediaRoot: string;
  /** Path to a directory containing images & other resources, used by the editor */
  editorMediaRoot: string;
  /** Path to an output directory, to which files from the editorMediaRoot will be copied */
  editorMediaDest: string;
  /** Path to an output directory, to which files from the examplesMediaRoot will be copied */
  examplesMediaDest: string;
  /** Path to an output directory, to which files from the examplesFontsRoot will be copied */
  fontsMediaDest: string;
  /** glob pattern which is supposed to find meta.json files containing information about examples in the MetaFile format */
  metaGlob: string;
  /** Base output directory of the examples */
  pagesDir: string;
  /** Path to the editor-heights.json */
  editorHeights: string;
  /** Output path of the height-data.json*/
  heightData: string;
}

/**
 * Content of the meta.json file, found in the interactive examples
 */
export interface MetaFile {
  pages: MetaPages;
}

export interface MetaPages {
  [pageName: string]: MetaPage;
}

export type PageType =
  | "css"
  | "js"
  | "wat"
  | "tabbed"
  | "webapi-tabbed"
  | "mathml";

/**
 * Information about an individual example found in the meta.json
 */
export type MetaPage = CSSPage | JSPage | WATPage | TabbedPage;

export interface CommonPage {
  /**
   * Type of an interactive editor
   *
   * It dictates appearance, possible properties and output file directory
   */
  type: PageType;
  /**
   * Text visible as a heading of an example
   */
  title: string;
  /**
   * File name with .html extension, under which example will be generated.
   * It will be created under `pages/${type}/${fileName}`
   */
  fileName: string;
}

export interface CSSPage extends CommonPage {
  type: "css";
  /**
   * Path to HTML code of an example
   */
  exampleCode: string;
  /**
   * Path to CSS code of an example
   */
  cssExampleSrc?: string;
  /**
   * Path to JS code of an example
   */
  jsExampleSrc?: string;
}

export interface JSPage extends CommonPage {
  type: "js";
  /**
   * Path to default code of an example
   */
  exampleCode: string;
}

export interface WATPage extends CommonPage {
  type: "wat";
  /**
   * Path to default code of WebAssembly tab
   */
  watExampleCode: string;
  /**
   * Path to default code of JS tab
   */
  jsExampleCode: string;
}

export interface TabbedPage extends CommonPage {
  type: "tabbed" | "webapi-tabbed" | "mathml";
  /**
   * Path to default code of HTML tab
   */
  exampleCode: string;
  /**
   * Path to default code of CSS tab
   */
  cssExampleSrc?: string;
  /**
   * Path to default code of JS tab.
   * In order for it to be displayed, "tabs" property must contain "js" token
   */
  jsExampleSrc?: string;
  /**
   * Path to a css file which will be included in the example, but it will not be shown to the user
   */
  cssHiddenSrc?: string;
  /**
   * Class name setting height of the editor.
   * Possible values are "tabbed-taller", "tabbed-standard" and "tabbed-shorter"
   */
  height: TabbedPageHeight;
  /**
   *
   * Comma separated tab names which should be displayed above code editor.
   * Possible values are: "html", "css" and "js".
   * The default value is "html,css"
   */
  tabs?: string;
  /**
   * Tab name which should be opened when user visits the editor.
   * Possible values are: "html", "css" and "js".
   * Default value is "js" if JS tab is present in tabs property, "html" is used otherwise
   */
  defaultTab?: TabbedPageTab;
}

export type JSPageHeight = "taller" | "" | "shorter";

export type WATPageHeight = "taller" | "standard" | "shorter";

export type TabbedPageTab = "html" | "css" | "js";

export type TabbedPageHeight =
  | "tabbed-taller"
  | "tabbed-standard"
  | "tabbed-shorter";

/**
 * Content of the height-data.json which includes a height of each editor type and the name of the editor used by every interactive example
 */
export interface HeightData {
  editors: HeightDataEditor[];
  examples: HeightDataExamples;
}

export interface HeightDataEditor {
  /**
   * Unique name of an editor.
   *
   * In order to find out which editor name is supposed to be used by an example, use value of property "examples"
   */
  name: HeightDataEditorName;
  /**
   * Possible heights of the current editor.
   *
   * Each object contains height in pixels and minFrameWidth signifying minimum width of the iframe in which editor is embedded, in order for the height to be applied.
   *
   * Heights are ASC sorted by minFrameWidth
   */
  heights: EditorHeight[];
}

export interface EditorHeight {
  /**
   * Minimum width of the iframe in which editor is embedded, in order for the height to be applied
   */
  minFrameWidth: number;
  /**
   * Height of the editor in pixels
   */
  height: number;
}

/**
 * Object containing every built interactive example, in which property key is full path to the example and property value is name of the HeightDataEditor
 */
export type HeightDataExamples = Record<string, HeightDataEditorName>;

export type HeightDataEditorName = string;
