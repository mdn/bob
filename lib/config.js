const { cosmiconfigSync } = require("cosmiconfig");
const path = require("path");

function getConfig() {
  let configFile = path.join(__dirname, "../.bobconfigrc");
  let cosmiConfig = cosmiconfigSync("bobconfig", {
    cache: false,
    format: "json",
    sync: true,
  });

  return cosmiConfig.load(configFile).config;
}

module.exports = getConfig;
