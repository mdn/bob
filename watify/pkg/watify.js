import * as wasm from "./watify_bg.wasm";
import { __wbg_set_wasm } from "./watify_bg.js";
__wbg_set_wasm(wasm);
export * from "./watify_bg.js";
