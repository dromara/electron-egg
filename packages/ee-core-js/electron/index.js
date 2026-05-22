'use strict';

const { createElectron } = require("./app");
const { getMainWindow, setCloseAndQuit, getCloseAndQuit } = require("./window");

// load socket server
function loadElectron() {
  createElectron();
}

module.exports = {
  loadElectron,
  getMainWindow,
  setCloseAndQuit,
  getCloseAndQuit
};