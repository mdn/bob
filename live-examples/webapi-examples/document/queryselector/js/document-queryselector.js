(function() {
    function getHeader() {
        let documentRoot = getShadowRoot();
        return documentRoot.querySelector('header');
    }

    let header = getHeader();
    console.log('header', getHeader());
    header.style.backgroundColor = '#b2ebf2';
})();
