import { cosmiconfigSync } from "cosmiconfig";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function getConfig() {
  let configFile = path.join(__dirname, "../.bobconfigrc");
  let cosmiConfig = cosmiconfigSync("bobconfig", {
    cache: false,
    format: "json",
    sync: true,
  });

  return cosmiConfig.load(configFile).config;
}

export default getConfig;
