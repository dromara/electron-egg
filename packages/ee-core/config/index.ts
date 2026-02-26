

import { ConfigLoader } from './config_loader';

interface Instance {
  config: any;
}

const Instance: Instance = {
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
  }
  return Instance["config"];
}

export {
  loadConfig,
  getConfig,
};