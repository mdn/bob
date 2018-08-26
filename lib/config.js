const cosmiconfig = require('cosmiconfig');

function getConfig() {
    let cosmiConfig = cosmiconfig('bobconfig', {
        cache: false,
        format: 'json',
        sync: true
    });

    return cosmiConfig.loadSync('./.bobconfigrc').config;
}

module.exports = getConfig;
