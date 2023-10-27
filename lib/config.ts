import { cosmiconfigSync } from "cosmiconfig";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BobConfig } from "../types/types";

/**
 * Combined content of ".bobconfigrc" and process arguments
 */
export type Config = BobConfig & ProcessArguments;

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CONFIG_FILE_PATH = "../.bobconfigrc";

function getConfig(): Config {
  const configFile = path.join(__dirname, CONFIG_FILE_PATH);
  const cosmiConfig = cosmiconfigSync("bobconfig", {
    cache: false,
  });

  const configResult = cosmiConfig.load(configFile);
  if (!configResult) {
    throw new TypeError(`MDN-BOB: Failed to load "${CONFIG_FILE_PATH}"`);
  }

  const config = configResult.config as BobConfig;
  const processArguments = getProcessArguments();
  return {
    ...config,
    ...processArguments,
  };
}

interface ProcessArguments {
  doWebPack: boolean;
}

function getProcessArguments(): ProcessArguments {
  const argv = process.argv;
  return {
    doWebPack: !argv.includes("--skip-webpack"),
  };
}

export default getConfig;
