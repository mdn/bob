const processor = require("../lib/processor");

describe("processor", () => {
  describe("preprocessHTML", () => {
    it("should return an HTML string with < replaced by &lt;", () => {
      const html =
        '<html lang="en"><head><title>Testing processor</title></head>' +
        "<body><h1>preprocessHTML</h1></body></html>";
      const expectedOutput =
        '&lt;html lang="en">&lt;head>&lt;title>Testing processor&lt;/title>&lt;/head>' +
        "&lt;body>&lt;h1>preprocessHTML&lt;/h1>&lt;/body>&lt;/html>";

      expect(processor.preprocessHTML(html)).toBe(expectedOutput);
    });
  });

  describe("processCSSInclude", () => {
    it("should return the template string with %example-css-src% replaced with a link tag", () => {
      const expectedOutput =
        '<html lang="en"><head><title>Testing processor</title>' +
        '<link rel="stylesheet" href="../../editor/css/tabbed-editor.css" /></head><body><h1>preprocessHTML</h1></body></html>';
      const tmplSource =
        '<html lang="en"><head><title>Testing processor</title>' +
        "%example-css-src%</head><body><h1>preprocessHTML</h1></body></html>";
      const sourcePath = "editor/css/tabbed-editor.css";

      /* calling `processInclude` with css as the first argument will cause
               `processCSSInclude` to be called internally */
      expect(processor.processInclude("css", tmplSource, sourcePath)).toBe(
        expectedOutput
      );
    });
  });

  describe("processJSInclude", () => {
    it("should return the template string with %example-js-src% replaced with a script tag", () => {
      const expectedOutput =
        '<html lang="en"><head><title>Testing processor</title>' +
        "</head><body><h1>preprocessHTML</h1>" +
        '<script src="../../editor/js/editor.js"></script>' +
        "</body></html>";
      const tmplSource =
        '<html lang="en"><head><title>Testing processor</title>' +
        "</head><body><h1>preprocessHTML</h1>%example-js-src%</body></html>";
      const sourcePath = "editor/js/editor.js";

      /* calling `processInclude` with js as the first argument will cause
               `processJSInclude` to be called internally */
      expect(processor.processInclude("js", tmplSource, sourcePath)).toBe(
        expectedOutput
      );
    });
  });
});
