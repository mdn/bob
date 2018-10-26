const fse = require('fs-extra');
const glob = require('glob');

const getConfig = require('./config');
const pageBuilderUtils = require('./pageBuilderUtils');
const processor = require('./processor');
const tabbedPageBuilder = require('./tabbedPageBuilder');

const config = getConfig();

/**
 * Traverse the list of pages, and uses the meta data to generate the final
 * HTML source documents to `/docs/pages/[css|js]`
 * @param {object} pages - An object containing directives for building the pages
 *
 * Example object:
 *
 * "borderTopColor": {
 *     "baseTmpl": "editor/tmpl/live-css-tmpl.html",
 *     "cssExampleSrc": "live-examples/css-examples/css/border-top-color.css",
 *     "exampleCode": "live-examples/css-examples/border-top-color.html",
 *     "fileName": "border-top-color.html",
 *     "type": "css"
 * }
 *
 */
function build(pages) {
    for (let page in pages) {
        let currentPage = pages[page];
        let cssSource = currentPage.cssExampleSrc;
        let jsSource = currentPage.jsExampleSrc;
        let type = currentPage.type;
        let tmpl = pageBuilderUtils.getPageTmpl(type);
        let outputHTML = '';

        const exampleCode = fse.readFileSync(currentPage.exampleCode, 'utf8');
        const outputPath =
            config.pagesDir + currentPage.type + '/' + currentPage.fileName;

        // inject the perf script in the head of the template
        tmpl = pageBuilderUtils.injectPerf(tmpl);

        // handle both standard and webapi tabbed examples
        if (type.indexOf('tabbed') > -1) {
            fse.outputFileSync(
                outputPath,
                tabbedPageBuilder.buildTabbedExample(tmpl, currentPage)
            );
        } else {
            // is there a linked CSS file
            if (cssSource) {
                // inject the link tag into the source
                tmpl = processor.processInclude('css', tmpl, cssSource);
            } else {
                // clear out the template string
                tmpl = tmpl.replace('%example-css-src%', '');
            }

            // is there a linked JS file
            if (jsSource) {
                // inject the script tag into the source
                tmpl = processor.processInclude('js', tmpl, jsSource);
            } else {
                // clear out the template string
                tmpl = tmpl.replace('%example-js-src%', '');
            }

            // set main title
            tmpl = pageBuilderUtils.setMainTitle(currentPage, tmpl);

            if (currentPage.type === 'html') {
                let processedHTML = processor.preprocessHTML(exampleCode);
                /* Note: Using String.prototype.replace's replacement function instead of
                replacement string at 2nd argument because replacement string has weird
                behavior to $ (dollar sign). More info:
                https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter */
                outputHTML = tmpl.replace(
                    '%example-code%',
                    () => processedHTML
                );
            } else {
                outputHTML = tmpl.replace('%example-code%', () => exampleCode);
            }
            fse.outputFileSync(outputPath, outputHTML);
        }
    }
}

/**
 * Builds an index page for all example pages
 * mimicking the MDN production site
 */
function buildMdnMock(pages) {
    let mdnMockHTML = pageBuilderUtils.getPageTmpl('mdn-mock');

    const pageEntries = Object.values(pages).map(page => ({
        type: page.type,
        html: `
            <li>
                <a data-src="/${config.pagesPath}/${page.type}/${page.fileName}">
                    ${page.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </a>
            </li>
        `
    }));

    const htmlPerType = pageEntries.reduce((acc, entry) => ({
        ...acc,
        [entry.type]: (acc[entry.type] || '') + entry.html
    }), {});

    const types = [...new Set(pageEntries.map(entry => entry.type))]

    for (let type of types) {
        mdnMockHTML = mdnMockHTML.replace(`%pages-${type}%`, htmlPerType[type]);
    }

    fse.outputFileSync(config.baseDir + config.mdnMockFilename, mdnMockHTML);
}

/**
 * Iterates over all `meta.json` files. For each file,
 * it passes the list of pages to the `build` function.
 */
function buildPages() {
    let pages = {};

    return new Promise((resolve, reject) => {
        const metaJSONArray = glob.sync(config.metaGlob, {});

        for (const metaJson of metaJSONArray) {
            const file = fse.readJsonSync(metaJson);
            try {
                build(file.pages);
                pages = Object.assign({}, pages, file.pages);
            } catch (error) {
                console.error(
                    `MDN-BOB: (pageBuilder.js/@buildPages) Error while building pages ${metaJson}: ${error}`
                );
                reject(
                    Error(
                        `MDN-BOB: (pageBuilder.js/@buildPages) Error while building pages: ${metaJson}: ${error}`
                    )
                );
            }
        }

        if (process.env.NODE_ENV === 'development') {
            buildMdnMock(pages);
        }

        resolve('MDN-BOB: Pages built successfully');
    });
}

module.exports = {
    buildPages
};
