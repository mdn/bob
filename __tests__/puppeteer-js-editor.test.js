describe('JS Editor', () => {
    beforeAll(async () => {
        await page.goto('http://127.0.0.1:4444/pages/js/array-concat.html');
    });

    it('renders expected output after clicking Run', async () => {
        const expectedOutput = '> Array ["a", "b", "c", "d", "e", "f"]';

        await page.waitForSelector('#execute');
        await page.click('#execute');

        let outputContent = await page.$eval('#output code', elem =>
            elem.innerText.trim()
        );
        await expect(outputContent).toBe(expectedOutput);
    });
});
