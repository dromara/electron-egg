/**
 * @module app/dir
 * @description 应用目录初始化模块。在框架启动时创建必要的运行目录，
 * 包括用户主目录下的应用隐藏目录（存储配置等）、数据目录和日志目录。
 */
import fs from 'fs';
import { getUserHomeHiddenAppDir, getLogDir, getDataDir } from '../ps/index.js';
import { mkdir } from '../utils/helper.js';

/**
 * 加载并初始化应用运行所需的目录
 *
 * 创建以下目录（如不存在）：
 * - 用户主目录隐藏应用目录（~/.{appName}/）— 存储应用级配置和缓存
 * - 数据目录 — 存储业务数据（如 SQLite 数据库文件）
 * - 日志目录 — 存储运行日志文件
 *
 * 目录权限设为 0o755（所有者可读写执行，其他用户可读和执行）
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
