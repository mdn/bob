describe("Tabbed Editor", () => {
  describe("base test", () => {
    beforeAll(async () => {
      await page.goto("http://127.0.0.1:4444/pages/tabbed/address.html");
    });

    it("loads the expected HTML into the output element", async () => {
      const expectedCSS =
        " address { font-variant-caps: small-caps;}a { font-variant: normal;} ";
      const expectedHTML =
        " <address> James Rockford<br> 2354 Pacific Coast Highway<br> " +
        "California<br> USA<br> +311-555-2368<br> Email: " +
        '<a href="mailto:j.rockford@example.com">j.rockford@example.com</a><br>' +
        "</address> ";

      await page.waitForSelector("#output-iframe");
      const outputIframe = await page.$("#output-iframe");
      const iframeContent = await outputIframe.contentFrame();

      await iframeContent.waitForSelector("#html-output");

      const trimInnerHTML = (elem) =>
        /* trim new lines, then trim matches of two or more consecutive
                   whitespace characters with a single whitespace character */
        elem.innerHTML.replace(/\r?\n|\r/g, "").replace(/\s{2,}/g, " ");

      const htmlOutputContent = await iframeContent.$eval(
        "#html-output",
        trimInnerHTML
      );
      await expect(htmlOutputContent).toBe(expectedHTML);

      const cssOutputContent = await iframeContent.$eval(
        "#css-output",
        trimInnerHTML
      );
      await expect(cssOutputContent).toBe(expectedCSS);
    });

    it("should switch to CSS editor on tab click", async () => {
      await page.waitForSelector("#tablist");
      await page.click("#css");

      const cssPanelClassAttr = await page.$eval("#css-panel", (elem) =>
        elem.getAttribute("class")
      );

      const htmlPanelClassAttr = await page.$eval("#html-panel", (elem) =>
        elem.getAttribute("class")
      );

      await expect(cssPanelClassAttr).toBe("");
      await expect(htmlPanelClassAttr).toBe("hidden");
    });

    it("should switch to HTML editor on tab click", async () => {
      await page.waitForSelector("#tablist");
      // switch to CSS panel
      await page.click("#css");
      // then back to the HTML panel
      await page.click("#html");

      const cssPanelClassAttr = await page.$eval("#css-panel", (elem) =>
        elem.getAttribute("class")
      );

      const htmlPanelClassAttr = await page.$eval("#html-panel", (elem) =>
        elem.getAttribute("class")
      );

      await expect(cssPanelClassAttr).toBe("hidden");
      await expect(htmlPanelClassAttr).toBe("");
    });
  });
});
