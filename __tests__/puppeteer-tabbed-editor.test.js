describe('Tabbed Editor', () => {
    describe('base test', () => {
        beforeAll(async () => {
            await page.goto('http://127.0.0.1:4444/pages/tabbed/address.html');
        });

        it('loads the expected HTML into the output element', async () => {
            const expectedOutput =
                '<style>' +
                '.output{background-color:#fff;color:#15141aff;' +
                'font-size:0.9rem;line-height:1.5;overflow:scroll;' +
                'padding:1rem;}' +
                '</style>'+
                '<style>' +
                'address { font-variant-caps: small-caps;}a { font-variant: normal;}' +
                '</style><div class=\"output\" style=\"height: 62%;\">' +
                '<address> James Rockford<br> 2354 Pacific Coast Highway<br> ' +
                'California<br> USA<br> +311-555-2368<br> Email: ' +
                '<a href=\"mailto:j.rockford@example.com\">j.rockford@example.com</a><br>' +
                '</address></div>';

            await page.waitForSelector('#output');

            let outputContent = await page.$eval(
                '#output shadow-output',
                elem =>
                    /* trim new lines, then trim matches of two or more consecutive
                   whitespace characters with a single whitespace character */
                    elem.shadowRoot.innerHTML
                        .replace(/\r?\n|\r/g, '')
                        .replace(/\s{2,}/g, ' ')
            );
            await expect(outputContent).toBe(expectedOutput);
        });

        it('should switch to CSS editor on tab click', async () => {
            await page.waitForSelector('#tablist');
            await page.click('#css');

            let cssPanelClassAttr = await page.$eval('#css-panel', elem =>
                elem.getAttribute('class')
            );

            let htmlPanelClassAttr = await page.$eval('#html-panel', elem =>
                elem.getAttribute('class')
            );

            await expect(cssPanelClassAttr).toBe('');
            await expect(htmlPanelClassAttr).toBe('hidden');
        });

        it('should switch to HTML editor on tab click', async () => {
            await page.waitForSelector('#tablist');
            // switch to CSS panel
            await page.click('#css');
            // then back to the HTML panel
            await page.click('#html');

            let cssPanelClassAttr = await page.$eval('#css-panel', elem =>
                elem.getAttribute('class')
            );

            let htmlPanelClassAttr = await page.$eval('#html-panel', elem =>
                elem.getAttribute('class')
            );

            await expect(cssPanelClassAttr).toBe('hidden');
            await expect(htmlPanelClassAttr).toBe('');
        });
    });

    describe('test dynamic output container height', () => {
        test('set the appropriate height for shorter examples', async () => {
            const expectedStyleValue = 'height: 62%;';

            await page.goto('http://127.0.0.1:4444/pages/tabbed/address.html');
            await page.waitForSelector('#output');

            let styleValue = await page.$eval('shadow-output', elem =>
                elem.shadowRoot.querySelector('.output').getAttribute('style')
            );
            await expect(styleValue).toBe(expectedStyleValue);
        });

        test('set the appropriate height for standard examples', async () => {
            const expectedStyleValue = 'height: 67%;';

            await page.goto('http://127.0.0.1:4444/pages/tabbed/header.html');
            await page.waitForSelector('#output');

            let styleValue = await page.$eval('shadow-output', elem =>
                elem.shadowRoot.querySelector('.output').getAttribute('style')
            );
            await expect(styleValue).toBe(expectedStyleValue);
        });

        test('set the appropriate height for taller examples', async () => {
            const expectedStyleValue = 'height: 76%;';

            await page.goto('http://127.0.0.1:4444/pages/tabbed/article.html');
            await page.waitForSelector('#output');

            let styleValue = await page.$eval('shadow-output', elem =>
                elem.shadowRoot.querySelector('.output').getAttribute('style')
            );
            await expect(styleValue).toBe(expectedStyleValue);
        });
    });
});
