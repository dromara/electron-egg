import debug from 'debug';
import is from 'is-type-of';
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

const log = debug('ee-core:electron:window');

const Instance: {
  mainWindow: BrowserWindow | null;
  closeAndQuit: boolean;
} = {
  mainWindow: null,
  closeAndQuit: true,
};

// getMainWindow
export function getMainWindow(): BrowserWindow | null {
  return Instance.mainWindow;
}

// Create the main application window
export function createMainWindow(): BrowserWindow {
  const { openDevTools, windowsOption } = getConfig() as {
    openDevTools: boolean | Electron.OpenDevToolsOptions;
    windowsOption: ConstructorParameters<typeof BrowserWindow>[0];
  };
  const win = new BrowserWindow(windowsOption);
  Instance.mainWindow = win;

  // DevTools
  if (is.object(openDevTools)) {
    win.webContents.openDevTools(openDevTools as unknown as Electron.OpenDevToolsOptions);
  } else if (openDevTools === true) {
    win.webContents.openDevTools({ mode: 'bottom' });
  }

  eventBus.emitLifecycle(WindowReady);
  return win;
}

// restored window
export function restoreMainWindow(): void {
  if (Instance.mainWindow) {
    if (Instance.mainWindow.isMinimized()) {
      Instance.mainWindow.restore();
    }
    Instance.mainWindow.show();
    Instance.mainWindow.focus();
  }
}

// Set the flag for exiting after close all windows
export function setCloseAndQuit(flag: boolean): void {
  Instance.closeAndQuit = flag;
}

export function getCloseAndQuit(): boolean {
  return Instance.closeAndQuit;
}

// load server
// type: remote | single
export async function loadServer(): Promise<void> {
  const { remote, mainServer } = getConfig() as {
    remote: { enable: boolean; url: string };
    mainServer: { protocol: string; indexPath: string; takeover: string; loadingPage: string };
  };
  const win = getMainWindow();
  if (!win) return;

  // remote model
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
    if (isFileProtocol(frontendConf.protocol as string)) {
      url = path.join(getBaseDir(), frontendConf.directory as string, frontendConf.indexPath as string);
      load = 'file';
    }

    if (load === 'url') {
      let lp = getHtmlFilepath('boot.html');
      if (electronConf.loadingPage) {
        lp = path.join(getBaseDir(), electronConf.loadingPage as string);
      }
      _loadingPage(lp);

      const retryTimes = frontendConf.force === true ? 3 : 60;
      let count = 0;
      while (count < retryTimes) {
        try {
          await sleep(1000);
          const res = await fetch(url);
          if (res.status === 200) {
            loadMainUrl('url', url);
            break;
          }
        } catch {
          // ignore
        }
        count++;
      }

      if (count >= retryTimes) {
        const failurePage = getHtmlFilepath('failure.html');
        _loadingPage(failurePage);
      }
    } else {
      loadMainUrl('file', url);
    }
  } else {
    // 生产环境
    // cross takeover web
    if (mainServer.takeover && mainServer.takeover.length > 0) {
      await crossTakeover();
      return;
    }

    // 主进程
    const indexPath = mainServer.indexPath;
    let url = path.join(getBaseDir(), indexPath);
    if (!isFileProtocol(mainServer.protocol)) {
      url = mainServer.protocol + indexPath;
    }
    loadMainUrl('file', url);
  }
}

/**
 * 主服务
 * @params load <string> value: "url" 、 "file"
 */
function loadMainUrl(type: string, url: string): void {
  const win = getMainWindow();
  if (!win) return;

  coreLogger.info('[ee-core] Env: %s, Type: %s', env(), type);
  coreLogger.info('[ee-core] App running at: %s', url);
  log('[loadMainUrl] type:%s, url:%s', type, url);
  if (type === 'file') {
    win.loadFile(url);
  } else {
    win.loadURL(url);
  }
}

// loading page
function _loadingPage(filepath: string): void {
  const win = getMainWindow();
  if (!win) return;

  if (fileIsExist(filepath)) {
    win.loadFile(filepath);
  }
}

/**
 * cross takeover web
 */
async function crossTakeover(): Promise<void> {
  const crossConf = getConfig().cross as Record<string, { enable?: boolean; name?: string; [key: string]: unknown }>;
  const mainConf = getConfig().mainServer as { takeover: string; loadingPage: string };

  // loading page
  if (mainConf.loadingPage && mainConf.loadingPage.length > 0) {
    const lp = path.join(getBaseDir(), mainConf.loadingPage);
    _loadingPage(lp);
  }

  // cross service url
  const service = mainConf.takeover;
  if (!Object.prototype.hasOwnProperty.call(crossConf, service)) {
    throw new Error(`[ee-core] Please Check the value of mainServer.takeover in the config file !`);
  }

  const serviceConf = crossConf[service];
  // check service
  if (!serviceConf || serviceConf.enable !== true) {
    throw new Error(`[ee-core] Please Check the value of cross.${service} enable is true !`);
  }

  const entityName = serviceConf.name || service;
  const url = cross.getUrl(entityName);

  // 循环检查
  let count = 0;
  let serviceReady = false;
  const times = isDev() ? 20 : 100;
  const sleeptime = isDev() ? 1000 : 200;
  while (!serviceReady && count < times) {
    await sleep(sleeptime);
    try {
      await axios({
        method: 'get',
        url,
        timeout: 100,
        proxy: false,
        headers: {
          'Accept': 'text/html, application/json, text/plain, */*',
        },
      });
      serviceReady = true;
    } catch {
      // ignore
    }
    count++;
  }
  log('it takes %d seconds to start the cross service', count * sleeptime);

  if (!serviceReady) {
    const bootFailurePage = getHtmlFilepath('cross-failure.html');
    const mainWindow = getMainWindow();
    if (mainWindow) {
      mainWindow.loadFile(bootFailurePage);
    }
    throw new Error(`[ee-core] Please check cross service [${service}] ${url} !`);
  }

  coreLogger.info(`[ee-core] cross service [${service}] is started successfully`);
  loadMainUrl('spa', url);
}
