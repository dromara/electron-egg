'use strict';

const shortcut = require('./lib/shortcut');
const tray = require('./lib/tray');
const awaken = require('./lib/awaken');

module.exports = () => {
  // shortcut
  shortcut.setup();

  // tray
  tray.setup();

  // awaken 
  awaken.setup();

  // Open third party software
  
  
}
