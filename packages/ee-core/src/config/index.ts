/**
 * @module config
 * @description Configuration module entry point. Provides configuration loading and retrieval functionality.
 *
 * Usage:
 * - loadConfig(): Called once during framework startup to load and merge configuration
 * - getConfig(): Retrieve the final merged runtime configuration
 * - getAppInfo(): Retrieve application basic info (name, paths, environment, etc.)
 */
import { ConfigLoader } from './config_loader.js';
import type { AppInfo, Config } from '../types/index.js';

/** Runtime configuration (assigned after startup) */
let config: Config | null = null;

/**
 * Load configuration
 *
 * Uses ConfigLoader to load and merge default configuration with business configuration.
 * Called by init() in boot.ts during the framework startup flow.
 */
export function loadConfig(): void {
  const loader = new ConfigLoader();
  config = loader.load();
}

/**
 * Get runtime configuration
 *
 * If configuration has not been loaded yet, loading is automatically triggered.
 * Typically used after framework startup to ensure configuration is ready.
 *
 * @returns Complete runtime configuration object
 */
export function getConfig(): Config {
  if (!config) {
    loadConfig();
  }
  return config!;
}

/**
 * Get application basic info
 *
 * @returns Object containing application name, directories, environment, and other info
 */
export function getAppInfo(): AppInfo {
  return {
    name: process.env.EE_APP_NAME || '',
    baseDir: process.env.EE_BASE_DIR || '',
    electronDir: process.env.EE_ELECTRON_DIR || '',
    env: process.env.EE_ENV || 'prod',
    root: process.env.EE_BASE_DIR || '',
  };
}
