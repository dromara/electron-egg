import fs from 'fs';
import { getUserHomeHiddenAppDir, getLogDir, getDataDir } from '../ps/index.js';
import { mkdir } from '../utils/helper.js';

export function loadDir(): void {
  initDir();
}

function initDir(): void {
  const homeHiddenAppDir = getUserHomeHiddenAppDir();
  if (!fs.existsSync(homeHiddenAppDir)) {
    mkdir(homeHiddenAppDir, { mode: 0o755 });
  }
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) {
    mkdir(dataDir, { mode: 0o755 });
  }
  const logDir = getLogDir();
  if (!fs.existsSync(logDir)) {
    mkdir(logDir, { mode: 0o755 });
  }
}
