import "bytenode";
import is from "is-type-of";
import path from "path";
import fs from "fs";
import BuiltinModule from "module";
const Module = module.constructor.length > 1 ? module.constructor : BuiltinModule;
const extensions = Module._extensions;
function loadFile(filepath) {
  try {
    const extname = path.extname(filepath);
    if (extname && !Module._extensions[extname]) {
      return fs.readFileSync(filepath);
    }
    const obj = require(filepath);
    if (!obj) return obj;
    if (obj.__esModule) return "default" in obj ? obj.default : obj;
    return obj;
  } catch (err) {
    err.message = `[ee-core] load file: ${filepath}, error: ${err.message}`;
    throw err;
  }
}
async function callFn(fn, args, ctx) {
  args = args || [];
  if (!is.function(fn)) return;
  return ctx ? fn.call(ctx, ...args) : fn(...args);
}
function getResolvedFilename(filepath, baseDir) {
  const reg = /[/\\]/g;
  return filepath.replace(baseDir + path.sep, "").replace(reg, "/");
}
function isBytecodeClass(exports) {
  let isClass = false;
  if (exports.toString().indexOf("[class") != -1) {
    isClass = true;
  }
  return isClass;
}
function filePatterns() {
  const files = ["**/*.js", "**/*.jsc"];
  return files;
}
export {
  callFn,
  extensions,
  filePatterns,
  getResolvedFilename,
  isBytecodeClass,
  loadFile
};
