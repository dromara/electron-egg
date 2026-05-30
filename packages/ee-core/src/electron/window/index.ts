/**
 * @module electron/window
 * @description 主窗口管理模块。负责创建 BrowserWindow、加载页面内容、
 * 处理开发/生产环境下的页面加载逻辑。
 *
 * 页面加载策略：
 * - 远程模式（remote.enable=true）：加载远程 URL
 * - 开发模式：加载前端 dev server（http://localhost:8080），等待服务就绪
 * - 生产模式 + cross 接管：等待跨进程服务就绪后加载其 URL
 * - 生产模式（默认）：加载本地打包的 HTML 文件
 */
import debug from 'debug';
import { isObject } from '../../utils/type_check.js';
import path from 'path';
import axios from 'axios';
import { BrowserWindow } from 'electron';
import { getConfig } from '../../config/index.js';
import { eventBus, WindowReady } from '../../app/events.js';
import { env, isDev, getBaseDir } from '../../ps/index.js';
import { coreLogger } from '../../log/index.js';
import { loadFile } from '../../loader/index.js';
import { isFileProtocol } from '../../utils/index.js';
import { getHtmlFilepath } from '../../html/index.js';
import { fileIsExist, sleep } from '../../utils/helper.js';
import { extend } from '../../utils/extend.js';
import { cross } from '../../cross/index.js';

const debugLog = debug('ee-core:electron:window');

/**
 * 等待 URL 可达
 *
 * 通过 HTTP GET 请求轮询检查服务是否就绪。
 * 用于等待前端 dev server 或跨进程服务启动完成。
 *
 * @param url - 待检查的 URL
 * @param options - 轮询选项
 * @param options.retries - 最大重试次数
 * @param options.intervalMs - 重试间隔（毫秒）
 * @param options.timeoutMs - 单次请求超时（毫秒）
 * @returns URL 是否在重试次数内可达
 */
async function waitForUrl(url: string, options: { retries: number; intervalMs: number; timeoutMs: number }): Promise<boolean> {
  let count = 0;
  let ready = false;
  while (!ready && count < options.retries) {
    await sleep(options.intervalMs);
    try {
      await axios({
        method: 'get',
        url,
        timeout: options.timeoutMs,
        proxy: false,
        headers: { 'Accept': 'text/html, application/json, text/plain, */*' },
      });
      ready = true;
    } catch {
      // 服务未就绪，继续重试
    }
    count++;
  }
  return ready;
}

/** 主窗口实例和退出标志 */
const Instance: {
  mainWindow: BrowserWindow | null;
  closeAndQuit: boolean;
} = {
  mainWindow: null,
  closeAndQuit: true,
};

/**
 * 获取主窗口实例
 *
 * @returns BrowserWindow 实例，未创建时返回 null
 */
export function getMainWindow(): BrowserWindow | null {
  return Instance.mainWindow;
}

/**
 * 创建主应用窗口
 *
 * 使用 config.windowsOption 配置创建 BrowserWindow。
 * 配置中 openDevTools=true 时自动打开开发者工具。
 * 窗口创建后发射 WindowReady 生命周期事件。
 *
 * @returns BrowserWindow 实例
 */
export function createMainWindow(): BrowserWindow {
  const { openDevTools, windowsOption } = getConfig() as {
    openDevTools: boolean | Electron.OpenDevToolsOptions;
    windowsOption: ConstructorParameters<typeof BrowserWindow>[0];
  };
  const win = new BrowserWindow(windowsOption);
  Instance.mainWindow = win;

  // 开发者工具
  if (isObject(openDevTools)) {
    win.webContents.openDevTools(openDevTools as unknown as Electron.OpenDevToolsOptions);
  } else if (openDevTools === true) {
    win.webContents.openDevTools({ mode: 'bottom' });
  }

  eventBus.emitLifecycle(WindowReady);
  return win;
}

/**
 * 恢复主窗口
 *
 * 如果窗口被最小化则恢复，然后显示并聚焦。
 * 用于第二个实例启动时激活已有实例的窗口。
 */
export function restoreMainWindow(): void {
  if (Instance.mainWindow) {
    if (Instance.mainWindow.isMinimized()) {
      Instance.mainWindow.restore();
    }
    Instance.mainWindow.show();
    Instance.mainWindow.focus();
  }
}

/**
 * 设置关闭并退出标志
 *
 * @param flag - true 表示应用将在窗口关闭后退出
 */
export function setCloseAndQuit(flag: boolean): void {
  Instance.closeAndQuit = flag;
}

/**
 * 获取关闭并退出标志
 */
export function getCloseAndQuit(): boolean {
  return Instance.closeAndQuit;
}

/**
 * 加载服务页面
 *
 * 根据配置和环境选择页面加载策略：
 * 1. 远程模式（remote.enable=true）→ 加载远程 URL
 * 2. 开发环境 → 加载前端 dev server（等待就绪），先显示启动页
 * 3. 生产环境 + cross 接管 → 等待跨进程服务就绪后加载
 * 4. 生产环境（默认）→ 加载本地打包文件
 */
export async function loadServer(): Promise<void> {
  const { remote, mainServer } = getConfig() as {
    remote: { enable: boolean; url: string };
    mainServer: { protocol: string; indexPath: string; takeover: string; loadingPage: string };
  };
  const win = getMainWindow();
  if (!win) return;

  // 远程模式：直接加载远程 URL
  if (remote.enable) {
    loadMainUrl('remote', remote.url);
    return;
  }

  // 开发环境
  if (isDev()) {
    const binFile = path.join(getBaseDir(), './cmd/bin.js');
    const binConfig = loadFile(binFile) as Record<string, { frontend?: Record<string, unknown>; electron?: Record<string, unknown> }>;
    const dev = binConfig?.dev || {};
    const frontendConf = extend(true, {
      protocol: 'http://',
      hostname: 'localhost',
      port: 8080,
      indexPath: 'index.html',
      directory: 'frontend/dist',
    }, dev.frontend || {}) as Record<string, unknown>;
    const electronConf = extend(true, {
      loadingPage: '/public/html/loading.html',
    }, dev.electron || {}) as Record<string, unknown>;

    let url = (frontendConf.protocol as string) + (frontendConf.hostname as string) + ':' + (frontendConf.port as number);
    let load: 'url' | 'file' = 'url';
    // file:// 协议直接加载本地文件
    if (isFileProtocol(frontendConf.protocol as string)) {
      url = path.join(getBaseDir(), frontendConf.directory as string, frontendConf.indexPath as string);
      load = 'file';
    }

    // HTTP 模式：先显示启动页，等待前端 dev server 就绪
    if (load === 'url') {
      // 加载启动页
      let lp = getHtmlFilepath('boot.html');
      if (electronConf.loadingPage) {
        lp = path.join(getBaseDir(), electronConf.loadingPage as string);
      }
      _loadingPage(lp);

      // 轮询检查前端 dev server 是否就绪
      const retryTimes = frontendConf.force === true ? 3 : 60;
      const frontendReady = await waitForUrl(url, { retries: retryTimes, intervalMs: 1000, timeoutMs: 1000 });
      debugLog('frontend ready: %s', frontendReady);

      if (frontendReady === false && frontendConf.force !== true) {
        // 前端服务未就绪，显示失败页面
        const bootFailurePage = getHtmlFilepath('failure.html');
        const win = getMainWindow();
        if (win) {
          win.loadFile(bootFailurePage);
        }
        coreLogger.error(`Please check the ${url} !`);
        return;
      }
    }

    loadMainUrl('spa', url, load);
    return;
  }

  // 生产环境：cross 接管模式
  if (mainServer.takeover && mainServer.takeover.length > 0) {
    await crossTakeover();
    return;
  }

  // 生产环境：加载本地文件
  const indexPath = mainServer.indexPath;
  let prodUrl = path.join(getBaseDir(), indexPath);
  if (!isFileProtocol(mainServer.protocol)) {
    prodUrl = mainServer.protocol + indexPath;
  }
  loadMainUrl('spa', prodUrl, 'file');
}

/**
 * 加载主页面 URL 或文件
 *
 * @param type - 加载类型（remote / spa）
 * @param url - URL 或文件路径
 * @param load - 加载方式：'url' 使用 loadURL，'file' 使用 loadFile
 */
function loadMainUrl(type: string, url: string, load = 'url'): void {
  const { mainServer } = getConfig() as { mainServer: { options: Electron.LoadURLOptions & Electron.LoadFileOptions } };
  const win = getMainWindow();
  if (!win) return;

  coreLogger.info('Env: %s, Type: %s', env(), type);
  coreLogger.info('App running at: %s', url);
  debugLog('[loadMainUrl] type:%s, url:%s', type, url);
  if (load === 'file') {
    win.loadFile(url, mainServer.options)
      .then()
      .catch((err) => {
        coreLogger.error(`Please check the ${url} !`, err);
      });
  } else {
    win.loadURL(url, mainServer.options)
      .then()
      .catch((err) => {
        coreLogger.error(`Please check the ${url} !`, err);
      });
  }
}

/**
 * 加载启动页面
 *
 * 在等待前端服务就绪期间显示，避免白屏。
 *
 * @param filepath - 启动页 HTML 文件路径
 */
function _loadingPage(filepath: string): void {
  const win = getMainWindow();
  if (!win) return;

  if (fileIsExist(filepath)) {
    win.loadFile(filepath);
  }
}

/**
 * 跨进程服务接管页面加载
 *
 * 等待指定的跨进程服务（如 Go/Python 后端）就绪后，加载其提供的 URL。
 * 流程：
 * 1. 显示加载页面（如配置了 loadingPage）
 * 2. 检查跨进程服务配置是否正确
 * 3. 轮询等待服务 URL 可达
 * 4. 就绪后加载服务 URL，超时则显示失败页面
 */
async function crossTakeover(): Promise<void> {
  const crossConf = getConfig().cross as Record<string, { enable?: boolean; name?: string; [key: string]: unknown }>;
  const mainConf = getConfig().mainServer as { takeover: string; loadingPage: string };

  // 显示加载页面
  if (mainConf.loadingPage && mainConf.loadingPage.length > 0) {
    const lp = path.join(getBaseDir(), mainConf.loadingPage);
    _loadingPage(lp);
  }

  // 获取跨进程服务的 URL
  const service = mainConf.takeover;
  if (!Object.prototype.hasOwnProperty.call(crossConf, service)) {
    throw new Error(`[ee-core] Please Check the value of mainServer.takeover in the config file !`);
  }

  const serviceConf = crossConf[service];
  if (!serviceConf || serviceConf.enable !== true) {
    throw new Error(`[ee-core] Please Check the value of cross.${service} enable is true !`);
  }

  const entityName = serviceConf.name || service;
  const url = cross.getUrl(entityName);

  if (!url) {
    throw new Error(`[ee-core] Cannot get URL for cross service [${service}], process may not be running`);
  }

  // 轮询等待服务就绪
  const times = isDev() ? 20 : 100;
  const sleeptime = isDev() ? 1000 : 200;
  const serviceReady = await waitForUrl(url, { retries: times, intervalMs: sleeptime, timeoutMs: 100 });
  debugLog('cross service ready: %s', serviceReady);

  if (!serviceReady) {
    // 服务未就绪，显示失败页面
    const bootFailurePage = getHtmlFilepath('cross-failure.html');
    const mainWindow = getMainWindow();
    if (mainWindow) {
      mainWindow.loadFile(bootFailurePage);
    }
    throw new Error(`[ee-core] Please check cross service [${service}] ${url} !`);
  }

  coreLogger.info(`cross service [${service}] is started successfully`);
  loadMainUrl('spa', url);
}
