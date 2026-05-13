'use strict';

const fs = require('fs');
const { getUserHomeHiddenAppDir, getLogDir, getDataDir } = require('../ps');
const { mkdir } = require('../utils/helper');
function loadDir() {
  initDir();
}

function initDir() {
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

module.exports = {
  loadDir
};