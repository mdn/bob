module.exports = {
    /**
     * Posts a message to the parent with the data object to be sent
     * to GA
     */
    trackEvent: function(eventDetails) {
        'use strict';
        // We use '*' as the origin so that we can post messages to
        // developer.mozilla.org or wiki.developer.mozilla.org or the
        // staging site. There is no confidential data being sent so
        // this is not a security risk.
        window.parent.postMessage(eventDetails, '*');
    },
    /**
     * Creates an object that is passed to trackEvent, recording
     * the users selecting a different CSS example
     */
    trackCSSExampleSelection: function() {
        'use strict';
        this.trackEvent({
            category: 'Interactive Example - CSS',
            action: 'New CSS example selected',
            label: 'Interaction Events'
        });
    },
    /**
     * Creates an object that is passed to trackEvent, recording
     * the clicks on the JS examples run button.
     */
    trackRunClicks: function() {
        'use strict';
        this.trackEvent({
            category: 'Interactive Example - JS',
            action: 'Clicked run',
            label: 'Interaction Events'
        });
    }
};
