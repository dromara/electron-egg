import debug from 'debug';
import is from 'is-type-of';
import path from 'path';
import { BrowserWindow } from 'electron';
import { getConfig } from '../../config/index.js';
import { eventBus, WindowReady } from '../../app/events.js';
import { env, isDev, getBaseDir } from '../../ps/index.js';
import { loadFile } from '../../loader/index.js';
import { isFileProtocol } from '../../utils/index.js';
import { getHtmlFilepath } from '../../html/index.js';
import { fileIsExist, sleep } from '../../utils/helper.js';
import { coreLogger } from '../../log/index.js';
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

export function getMainWindow(): BrowserWindow | null {
  return Instance.mainWindow;
}

export function createMainWindow(): BrowserWindow {
  const { openDevTools, windowsOption } = getConfig() as {
    openDevTools: boolean | Electron.OpenDevToolsOptions;
    windowsOption: ConstructorParameters<typeof BrowserWindow>[0];
  };
  const win = new BrowserWindow(windowsOption);
  Instance.mainWindow = win;

  if (is.object(openDevTools)) {
    win.webContents.openDevTools(openDevTools as unknown as Electron.OpenDevToolsOptions);
  } else if (openDevTools === true) {
    win.webContents.openDevTools({ mode: 'bottom' });
  }

  eventBus.emitLifecycle(WindowReady);
  return win;
}

export function restoreMainWindow(): void {
  if (Instance.mainWindow) {
    if (Instance.mainWindow.isMinimized()) {
      Instance.mainWindow.restore();
    }
    Instance.mainWindow.show();
    Instance.mainWindow.focus();
  }
}

export function setCloseAndQuit(flag: boolean): void {
  Instance.closeAndQuit = flag;
}

export function getCloseAndQuit(): boolean {
  return Instance.closeAndQuit;
}

export async function loadServer(): Promise<void> {
  const { remote, mainServer } = getConfig() as {
    remote: { enable: boolean; url: string };
    mainServer: { protocol: string; indexPath: string };
  };
  const win = getMainWindow();
  if (!win) return;

  if (remote.enable) {
    loadMainUrl('remote', remote.url);
    return;
  }

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
    const indexPath = mainServer.indexPath;
    let url = path.join(getBaseDir(), indexPath);
    if (!isFileProtocol(mainServer.protocol)) {
      url = mainServer.protocol + indexPath;
    }
    loadMainUrl('file', url);
  }
}

function loadMainUrl(type: string, url: string): void {
  const win = getMainWindow();
  if (!win) return;

  log('[loadMainUrl] type:%s, url:%s', type, url);
  if (type === 'file') {
    win.loadFile(url);
  } else {
    win.loadURL(url);
  }
}

function _loadingPage(filepath: string): void {
  const win = getMainWindow();
  if (!win) return;

  if (fileIsExist(filepath)) {
    win.loadFile(filepath);
  }
}
