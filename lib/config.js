const cosmiconfig = require('cosmiconfig');
const path = require('path');

function getConfig() {
    let configFile = path.join(__dirname, '../.bobconfigrc');
    let cosmiConfig = cosmiconfig('bobconfig', {
        cache: false,
        format: 'json',
        sync: true
    });

    return cosmiConfig.loadSync(configFile).config;
}

module.exports = getConfig;
