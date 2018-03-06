'use strict';

const cosmiconfig = require('cosmiconfig');

function getConfig() {
  let cosmiConfig = cosmiconfig('bobconfig', {
    cache: false,
    format: 'json',
    sync: true
  });

  return cosmiConfig.load().config;
}

module.exports = getConfig;
