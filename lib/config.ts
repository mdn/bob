import { cosmiconfigSync } from "cosmiconfig";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function getConfig() {
  const configFile = path.join(__dirname, "../.bobconfigrc");
  const cosmiConfig = cosmiconfigSync("bobconfig", {
    cache: false,
  });

  const config = cosmiConfig.load(configFile).config;
  const progressArguments = getProgressArguments();
  return {
    ...config,
    ...progressArguments,
  };
}

function getProgressArguments() {
  const argv = process.argv;
  return {
    doWebPack: !argv.includes("--skip-webpack"),
  };
}

export default getConfig;
