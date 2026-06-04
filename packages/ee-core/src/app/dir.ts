/**
 * @module app/dir
 * @description Application directory initialization module. Creates necessary runtime directories
 * at framework startup, including the hidden app directory under the user's home directory
 * (for storing configuration, etc.), data directory, and log directory.
 */
import fs from 'fs';
import { getUserHomeHiddenAppDir, getLogDir, getDataDir, getAppCustomDataDir } from '../ps/index.js';
import { mkdir } from '../utils/helper.js';
import * as is from '../utils/is.js';

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
  // 在记录日志前，单独捕获异常
  try {
    // 初始化应用自定义数据目录
    let customAppDir = getUserHomeHiddenAppDir();
    // 权限问题，openharmony 环境下，自定义应用目录
    if (is.openharmony()) {
      customAppDir = getAppCustomDataDir();
    }
    if (!fs.existsSync(customAppDir)) {
      mkdir(customAppDir, { mode: 0o755 });
    }
    const dataDir = getDataDir();
    if (!fs.existsSync(dataDir)) {
      mkdir(dataDir, { mode: 0o755 });
    }
    const logDir = getLogDir();
    if (!fs.existsSync(logDir)) {
      mkdir(logDir, { mode: 0o755 });
    }
  } catch (e: unknown) {
    console.error('[dir] initDir error: %s', e instanceof Error ? e.message : String(e));
  }
}
