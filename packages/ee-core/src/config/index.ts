import { ConfigLoader } from './config_loader.js';
import type { Config } from '../types/index.js';

let config: Config | null = null;

export function loadConfig(): void {
  const loader = new ConfigLoader();
  config = loader.load();
}

export function getConfig(): Config {
  if (!config) {
    loadConfig();
  }
  return config!;
}
