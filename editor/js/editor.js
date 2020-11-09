(function() {
    'use strict';

    var mceConsole = require('./editor-libs/console');
    var mceEvents = require('./editor-libs/events.js');
    var mceUtils = require('./editor-libs/mce-utils');
    var shadowOutput = require('./editor-libs/shadow-output');
    var templateUtils = require('./editor-libs/template-utils');
    var tabby = require('./editor-libs/tabby');

    var cssEditor = document.getElementById('css-editor');
    var clearConsole = document.getElementById('clear');
    var editorContainer = document.getElementById('editor-container');
    var header = document.querySelector('.output-header');
    var htmlEditor = document.getElementById('html-editor');
    var jsEditor = document.getElementById('js-editor');
    var staticCSSCode = cssEditor.querySelector('pre');
    var staticHTMLCode = htmlEditor.querySelector('pre');
    var staticJSCode = jsEditor.querySelector('pre');
    var timer;

    /**
     * Called by the tabbed editor to combine code from all tabs in an Object
     * @returns Object with code from each tab panel
     * Example
     * --------
     * {
     *     cssContent: 'h1 { background-color: #333; }',
     *     htmlContent: '<h1>Title</h1>'
     * }
     */
    function getOutput() {
        var editorContents = {
            htmlContent: tabby.editors.html.editor.getValue(),
            cssContent: tabby.editors.css.editor.getValue()
        };

        // not all editor instances have a JS panel
        if (tabby.editors.js.editor) {
            editorContents.jsContent = tabby.editors.js.editor.getValue();
        }

        return editorContents;
    }

    /**
     * Sets the height of the output container inside the shadow dom
     * based on the class present on the editor container
     * @param {Object} outputContainer - the output container inside the shadow dom
     */
    function setOutputHeight(outputContainer) {
        // styling for the polyfilled shadow is different
        if (typeof ShadyDOM !== 'undefined' && ShadyDOM.inUse) {
            outputContainer.style.height = '92%';
        } else if (editorContainer.classList.contains('tabbed-shorter')) {
            outputContainer.style.height = '62%';
        } else if (editorContainer.classList.contains('tabbed-standard')) {
            outputContainer.style.height = '67%';
        } else if (editorContainer.classList.contains('tabbed-taller')) {
            outputContainer.style.height = '76%';
        }
    }

    /**
     * Set or update the CSS and HTML in the output pane.
     * @param {Object} content - The content of the template element.
     */
    function render(content) {
        let shadow = document.querySelector('shadow-output').shadowRoot;
        let shadowChildren = shadow.children;

        if (shadowChildren.length) {
            if (typeof ShadyDOM !== 'undefined' && ShadyDOM.inUse) {
                shadow.innerHTML = '';
            } else {
                shadow.removeChild(shadow.querySelector('div'));
                var styleElements = shadow.querySelectorAll('style');

                for (var styleElement in styleElements) {
                    if (styleElements.hasOwnProperty(styleElement) && styleElements[styleElement]) {
                        shadow.removeChild(styleElements[styleElement]);
                    }
                }
            }
        }

        shadow.appendChild(document.importNode(content, true));
        setOutputHeight(shadow.querySelector('div'));
        mceUtils.openLinksInNewTab(shadow.querySelectorAll('a[href^="http"]'));
        mceUtils.scrollToAnchors(
            shadow,
            shadow.querySelectorAll('a[href^="#"]')
        );
    }

    /**
     * Called from the editors on keyup events. Starts a 500 millisecond timer.
     * If no other keyup events happens before the 500 millisecond have elapsed,
     * update the output
     */
    function autoUpdate() {
        // clear the existing timer
        clearTimeout(timer);

        timer = setTimeout(function() {
            templateUtils.createTemplate(getOutput());
            render(templateUtils.getTemplateOutput());
        }, 500);
    }

    header.addEventListener('click', function(event) {
        if (event.target.classList.contains('reset')) {
            window.location.reload();
        }
    });

    htmlEditor.addEventListener('keyup', function() {
        autoUpdate();
    });

    cssEditor.addEventListener('keyup', function() {
        autoUpdate();
    });

    jsEditor.addEventListener('keyup', function() {
        autoUpdate();
    });

    clearConsole.addEventListener('click', function() {
        var webapiConsole = document.querySelector('#console code');
        webapiConsole.textContent = '';
    });

    // hide the static example when JS enabled
    staticHTMLCode.classList.add('hidden');
    // hide the static CSS example
    staticCSSCode.classList.add('hidden');
    // hide the static JS example
    staticJSCode.classList.add('hidden');
    // show the header
    header.classList.remove('hidden');

    /* Initialise the editors. If there is a `dataset` property
       of type `tabs` on the `editorContainer`, pass its value
       to `initEditor` */
    if (editorContainer.dataset && editorContainer.dataset.tabs) {
        tabby.initEditor(
            editorContainer.dataset.tabs.split(','),
            document.getElementById('js')
        );
    } else {
        tabby.initEditor(['html', 'css'], document.getElementById('html'));
    }

    mceConsole();

    tabby.registerEventListeners();

    // register the custom output element
    customElements.define('shadow-output', shadowOutput);

    templateUtils.createTemplate(getOutput());

    document.addEventListener('WebComponentsReady', function() {
        render(templateUtils.getTemplateOutput());
    });

    /* Ensure that performance is supported before
       gathering the performance metric */
    if (performance !== undefined) {
        document.addEventListener('readystatechange', function(event) {
            if (event.target.readyState === 'complete') {
                /* loadEventEnd happens a split second after we
                   reached complete. So we wait an additional
                   100ms before getting it’ value */
                setTimeout(function() {
                    mceEvents.trackloadEventEnd(
                        'Tabbed editor load time',
                        performance.timing.loadEventEnd
                    );
                    // Posts mark to set on the Kuma side and used in measure
                    mceUtils.postToKuma({
                        markName: 'tabbed-ie-load-event-end'
                    });
                }, 100);
            }
        });
    }
})();
