'use strict';

/**
 * Setup the global configuration
 * Override the target origin with ?origin=<origin URL>
 * This uses URLSearchParams, which is supported in modern browsers.
 * No polyfill or fallback is provided, because this override is for
 * development and testing.
 * https://stackoverflow.com/a/979995/10612
 */
function setupConfig() {
    var origin = 'https://developer.mozilla.org';
    if (window.URL) {
        var url = new URL(window.location.href);
        if (url.searchParams) {
            var param = url.searchParams.get('origin');
            if (param) {
                origin = param;
            }
        }
    }
    window.ieConfig = {
        origin: origin
    };
}

/**
 * Posts a name to set as a mark to Kuma for
 * processing and beaconing to GA
 * @param {Object} perf - The performance object sent to Kuma
 */
function postToKuma(perf) {
    window.parent.postMessage(perf, window.ieConfig.origin);

    // We're experimenting with a new UX for MDN on beta.developer.mozilla.org
    // and really want to get these perf metrics for interactive examples
    // when they are displayed on the new beta domain. But the origin is
    // built into the rendered HTML that is shared by the beta and non-beta
    // sites, so the postMessage call above will fail silently if we're
    // embedded within a page on the beta site. As a hacky workaround
    // we post the message again, with a 'beta.' prefix added to the origin.
    //
    // TODO(djf): remove this second postMessage() when the beta
    // site becomes the main site
    var originParts = window.ieConfig.origin.split('://');
    var betaOrigin = originParts[0] + '://beta.' + originParts[1];
    window.parent.postMessage(perf, betaOrigin);
}

setupConfig();
postToKuma({ markName: 'interactive-editor-loading' });

/**
 * Posts marks to set on the Kuma side, based on certain
 * events during document loading. These will then be made
 * available in performance tools, and beaconed to GA
 */
document.addEventListener('readystatechange', function(event) {
    switch (event.target.readyState) {
        case 'interactive':
            postToKuma({
                markName: 'interactive-editor-interactive',
                measureName: 'ie-time-to-interactive',
                startMark: 'interactive-editor-loading',
                endMark: 'interactive-editor-interactive'
            });
            break;
        case 'complete':
            postToKuma({
                markName: 'interactive-editor-complete',
                measureName: 'ie-time-to-complete',
                startMark: 'interactive-editor-loading',
                endMark: 'interactive-editor-complete'
            });
            break;
    }
});
