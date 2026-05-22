'use strict';

const { ConfigLoader } = require('./config_loader');

const Instance = {
  config: null,
};

function loadConfig() {
  const configLoader = new ConfigLoader();
  Instance["config"] = configLoader.load();
  return Instance["config"];
}

function getConfig() {
  if (!Instance["config"]) {
    loadConfig();
  };
  return Instance["config"];
}

module.exports = {
  loadConfig,
  getConfig,
};