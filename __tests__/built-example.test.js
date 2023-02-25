import fse from "fs-extra";
import getConfig from "../lib/config.js";

const config = getConfig();

describe("example", () => {
  describe("font-stretch", () => {
    it("should have content of @import directly in css", () => {
      const path = "live-examples/css-examples/fonts/font-stretch.css";
      const content = fse.readFileSync(config.baseDir + path, "utf8");

      const expectedOutput =
        '@font-face{font-family:molot;src:url("/media/fonts/molot.woff2") format("woff2")}#output section{font-size:1.2em;font-family:molot,sans-serif}';

      expect(content).toBe(expectedOutput);
    });
  });
  describe("article", () => {
    it("should have content of `cssHiddenSrc` path", () => {
      const path = "pages/tabbed/article.html";
      const content = fse.readFileSync(config.baseDir + path, "utf8");

      const expectedOutput =
        '@font-face{font-family:molot;src:url("/media/fonts/molot.woff2") format("woff2")}';

      expect(content).toContain(expectedOutput);
    });
  });
  describe("caption", () => {
    it("should have content of both `cssHiddenSrc` paths", () => {
      const path = "pages/tabbed/caption.html";
      const content = fse.readFileSync(config.baseDir + path, "utf8");

      const expectedOutput =
        '@font-face{font-family:molot;src:url("/media/fonts/molot.woff2") format("woff2")}@font-face{font-family:rapscallion;src:url("/media/fonts/rapscall.woff2") format("woff2")}';

      expect(content).toContain(expectedOutput);
    });
  });
});
