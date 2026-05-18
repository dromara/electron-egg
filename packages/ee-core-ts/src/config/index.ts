import { ConfigLoader } from './config_loader.js';

let config: Record<string, unknown> | null = null;

export function loadConfig(): void {
  const loader = new ConfigLoader();
  config = loader.load();
}

export function getConfig(): Record<string, unknown> {
  if (!config) {
    throw new Error('Config not loaded. Call loadConfig() first.');
  }
  return config;
}
