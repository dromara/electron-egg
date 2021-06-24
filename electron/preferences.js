'use strict';

const shortcut = require('./lib/shortcut');
const tray = require('./lib/tray');

module.exports = () => {
  // shortcut
  shortcut.setup();

  // tray
  tray.setup();
}
