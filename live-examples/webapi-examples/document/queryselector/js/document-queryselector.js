(function() {
    function getHeader() {
        let shadowRoot = getShadowRoot();
        return shadowRoot.querySelector('header');
    }

    let header = getHeader();
    console.log('header', getHeader());
    header.style.backgroundColor = '#b2ebf2';
})();
