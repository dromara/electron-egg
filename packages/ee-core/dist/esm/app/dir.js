import fs from "fs";
import { getUserHomeHiddenAppDir, getLogDir, getDataDir } from "../ps";
import { mkdir } from "../utils/helper";
function loadDir() {
  initDir();
}
function initDir() {
  const homeHiddenAppDir = getUserHomeHiddenAppDir();
  if (!fs.existsSync(homeHiddenAppDir)) {
    mkdir(homeHiddenAppDir, { mode: 493 });
  }
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) {
    mkdir(dataDir, { mode: 493 });
  }
  const logDir = getLogDir();
  if (!fs.existsSync(logDir)) {
    mkdir(logDir, { mode: 493 });
  }
}
export {
  loadDir
};
