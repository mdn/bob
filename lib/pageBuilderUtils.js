const fse = require('fs-extra');
const path = require('path');
const uglify = require('uglify-es');

const processor = require('./processor');

module.exports = {
    /**
     * Based on the provided `tmplType`, return the relevant
     * template as a string.
     * @param {String} tmplType - The template type
     * @returns The appropriate template as a string
     */
    getPageTmpl: function(tmplType) {
        switch (tmplType) {
            case 'css':
                try {
                    return fse.readFileSync(
                        path.join(
                            __dirname,
                            '../editor/tmpl/live-css-tmpl.html'
                        ),
                        'utf8'
                    );
                } catch (error) {
                    console.error('Error loading file', error);
                }
            case 'js':
                try {
                    return fse.readFileSync(
                        path.join(
                            __dirname,
                            '../editor/tmpl/live-js-tmpl.html'
                        ),
                        'utf8'
                    );
                } catch (error) {
                    console.error('Error loading file', error);
                }
            case 'tabbed':
            case 'webapi-tabbed':
                try {
                    return fse.readFileSync(
                        path.join(
                            __dirname,
                            '../editor/tmpl/live-tabbed-tmpl.html'
                        ),
                        'utf8'
                    );
                } catch (error) {
                    console.error('Error loading file', error);
                }
            default:
                console.error(
                    `MDN-BOB: No template found for template type ${tmplType}`
                );
                process.exit(1);
        }
    },
    /**
     * Load, minifies, and then injects the contents of
     * `js/editor-libs/perf.js` into the head of the document
     * @param {string} tmpl - The template as a string
     * @return {string} The template as a string with the perf script injected
     */
    injectPerf(tmpl) {
        const regex = /%inject-perf%/g;
        const perfJs = path.join(__dirname, '../editor/js/editor-libs/perf.js');
        let minified = uglify.minify(fse.readFileSync(perfJs, 'utf8')).code;
        return tmpl.replace(regex, minified);
    },
    /**
     * Sets the active tabs in a comma separated string.
     * @param {Object} currentPage - The current page object
     * @param {String} tmpl - The template as a string
     *
     * @returns The processed template with the active tabs set
     */
    setActiveTabs: function(currentPage, tmpl) {
        const regex = /%active-tabs%/g;

        if (currentPage.tabs) {
            return tmpl.replace(regex, `data-tabs="${currentPage.tabs}"`);
        } else {
            return tmpl.replace(regex, '');
        }
    },
    /**
     * Sets the appropriate class on the tabbed editor’s container
     * element based on the height property defined in the example’s
     * meta data
     * @param {Object} currentPage - The current page object
     * @param {String} tmpl - The template as a string
     *
     * @returns The processed template with the height class set
     */
    setEditorHeight: function(currentPage, tmpl) {
        const regex = /%editor-height%/g;

        if (currentPage.height === undefined) {
            console.error(
                `[BoB] Required height property of ${
                    currentPage.title
                } is not defined`
            );
            process.exit(1);
        }

        return tmpl.replace(regex, currentPage.height);
    },
    /**
     * Sets the `<title>` and `<h4>` main page title
     * @param {Object} currentPage - The current page object
     * @param {String} tmpl - The template as a string
     *
     * @returns The processed template with the titles set
     */
    setMainTitle: function(currentPage, tmpl) {
        const regex = /%title%/g;
        let resultsArray = [];

        // replace all instances of `%title` with the `currentPage.title`
        while ((resultsArray = regex.exec(tmpl)) !== null) {
            tmpl = tmpl.replace(
                resultsArray[0].trim(),
                processor.preprocessHTML(currentPage.title)
            );
        }
        return tmpl;
    }
};
