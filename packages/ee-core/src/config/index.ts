/**
 * @module config
 * @description 配置模块入口。提供配置的加载和获取功能。
 *
 * 使用方式：
 * - loadConfig()：在框架启动时调用一次，加载并合并配置
 * - getConfig()：获取最终合并后的运行时配置
 * - getAppInfo()：获取应用基础信息（名称、路径、环境等）
 */
import { ConfigLoader } from './config_loader.js';
import type { AppInfo, Config } from '../types/index.js';

/** 运行时配置（启动后赋值） */
let config: Config | null = null;

/**
 * 加载配置
 *
 * 使用 ConfigLoader 加载并合并默认配置与业务配置。
 * 在框架启动流程中由 boot.ts 的 init() 调用。
 */
export function loadConfig(): void {
  const loader = new ConfigLoader();
  config = loader.load();
}

/**
 * 获取运行时配置
 *
 * 若配置尚未加载，会自动触发加载。
 * 通常在框架启动后使用，确保配置已就绪。
 *
 * @returns 完整的运行时配置对象
 */
export function getConfig(): Config {
  if (!config) {
    loadConfig();
  }
  return config!;
}

/**
 * 获取应用基础信息
 *
 * @returns 包含应用名称、目录、环境等信息对象
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
