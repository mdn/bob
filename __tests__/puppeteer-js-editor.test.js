describe("JS Editor", () => {
  beforeAll(async () => {
    await page.goto("http://127.0.0.1:4444/pages/js/array-concat.html");
  });

  it("renders expected output after clicking Run", async () => {
    const expectedOutput = [
      '> "First Log Output: " Array ["a", "b", "c", "d", "e", "f"]',
      '> "Second Log Output: " Array ["a", "b", "c", "D", "E", "F", "G"]',
    ].join(`\n`);

    await page.waitForSelector("#execute");
    await page.click("#execute");

    let outputContent = await page.$eval(".output code", (elem) =>
      elem.innerText.trim()
    );
    await expect(outputContent).toBe(expectedOutput);
  });
});
