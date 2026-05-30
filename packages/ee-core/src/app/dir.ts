/**
 * @module app/dir
 * @description Application directory initialization module. Creates necessary runtime directories
 * at framework startup, including the hidden app directory under the user's home directory
 * (for storing configuration, etc.), data directory, and log directory.
 */
import fs from 'fs';
import { getUserHomeHiddenAppDir, getLogDir, getDataDir } from '../ps/index.js';
import { mkdir } from '../utils/helper.js';

/**
 * Load and initialize directories required for application runtime
 *
 * Creates the following directories (if they don't exist):
 * - Hidden app directory under user home (~/.{appName}/) — Stores app-level configuration and cache
 * - Data directory — Stores business data (e.g. SQLite database files)
 * - Log directory — Stores runtime log files
 *
 * Directory permissions set to 0o755 (owner: read/write/execute; others: read/execute)
 */
export function loadDir(): void {
  initDir();
}

function initDir(): void {
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
