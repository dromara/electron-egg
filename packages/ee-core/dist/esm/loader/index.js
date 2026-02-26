import is from "is-type-of";
import fs from "fs";
import path from "path";
import * as CoreUtils from "../core/utils";
import { getElectronDir } from "../ps";
function loadFile(filepath, ...inject) {
  let fullpath = filepath;
  const isAbsolute = path.isAbsolute(fullpath);
  if (!isAbsolute) {
    fullpath = path.join(getElectronDir(), fullpath);
  }
  fullpath = fullpath && resolveModule(fullpath);
  if (!fullpath || !fs.existsSync(fullpath)) {
    let errorMsg = `[ee-core] [loader/index] loadFile ${filepath} does not exist`;
    throw new Error(errorMsg);
  }
  let ret = CoreUtils.loadFile(fullpath);
  if (is.function(ret) && !is.class(ret) && !CoreUtils.isBytecodeClass(ret)) {
    ret = ret(...inject);
  }
  return ret;
}
function requireFile(filepath) {
  return CoreUtils.loadFile(filepath);
}
function execFile(filepath, ...inject) {
  let ret = CoreUtils.loadFile(filepath);
  if (is.class(ret) || CoreUtils.isBytecodeClass(ret)) {
    ret = new ret(inject);
  } else if (is.function(ret)) {
    ret = ret(inject);
  }
  return ret;
}
function resolveModule(filepath) {
  let fullpath;
  try {
    fullpath = require.resolve(filepath);
  } catch (e) {
    if (filepath && (filepath.endsWith(".defalut") || filepath.endsWith(".prod"))) {
      fullpath = filepath + ".jsc";
    } else if (filepath && filepath.endsWith(".js")) {
      fullpath = filepath + "c";
    }
    if (!fs.existsSync(filepath) && (!fullpath || !fs.existsSync(fullpath))) {
      let files = { filepath, fullpath };
      console.warn(`[ee-core] [loader] resolveModule unknow filepath: ${JSON.stringify(files)}`);
      return void 0;
    }
  }
  return fullpath;
}
function getFullpath(filepath) {
  let fullpath;
  const isAbsolute = path.isAbsolute(filepath);
  if (!isAbsolute) {
    filepath = path.join(getElectronDir(), filepath);
  }
  fullpath = resolveModule(filepath);
  if (!fullpath || !fs.existsSync(fullpath)) {
    throw new Error(`[ee-core] [loader] getFullpath filepath ${filepath} not exists`);
  }
  return fullpath;
}
export {
  execFile,
  getFullpath,
  loadFile,
  requireFile,
  resolveModule
};
