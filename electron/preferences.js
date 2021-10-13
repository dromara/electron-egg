'use strict';

const is = require('electron-is');
const config = require('./config');
const shortcut = require('./lib/shortcut');
const tray = require('./lib/tray');
const awaken = require('./lib/awaken');
const security = require('./lib/security');
const chromeExtension = require('./lib/chromeExtension');

module.exports = async () => {
  // shortcut
  shortcut.setup();

  // tray
  tray.setup();

  // awaken 
  awaken.setup();

  // security 
  security.setup();

  // chrome extension
  await chromeExtension.setup();

  // check update
  const updateConfig = config.get('autoUpdate');
  if ((is.windows() && updateConfig.windows) || (is.macOS() && updateConfig.macOS)
    || (is.linux() && updateConfig.linux)) {
    const autoUpdater = require('./lib/autoUpdater');
    autoUpdater.checkUpdate();
  }
}
