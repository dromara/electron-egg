/**
 * @module electron/window
 * @description Main window management module. Responsible for creating BrowserWindow, loading page content,
 * and handling page loading logic in development/production environments.
 *
 * Page loading strategy:
 * - Remote mode (remote.enable=true): Load remote URL
 * - Development mode: Load frontend dev server (http://localhost:8080), wait for service to be ready
 * - Production mode + cross takeover: Wait for cross-process service to be ready then load its URL
 * - Production mode (default): Load locally packaged HTML file
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
import { fileIsExist, sleep } from '../../utils/helper.js';
import { extend } from '../../utils/extend.js';
import { cross } from '../../cross/index.js';
import { getHtmlFilepath } from '../../html/index.js';
import type { DevConfig, DevFrontendConfig, DevElectronConfig } from '../../types/index.js';

const debugLog = debug('ee-core:electron:window');

/**
 * Wait for URL to be reachable
 *
 * Polls via HTTP GET request to check if service is ready.
 * Used to wait for frontend dev server or cross-process service to finish starting.
 *
 * @param url - URL to check
 * @param options - Polling options
 * @param options.retries - Maximum number of retries
 * @param options.intervalMs - Retry interval (milliseconds)
 * @param options.timeoutMs - Single request timeout (milliseconds)
 * @returns Whether the URL is reachable within the retry count
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
      // Service not ready, continue retrying
    }
    count++;
  }
  return ready;
}

/** Main window instance and exit flag */
const Instance: {
  mainWindow: BrowserWindow | null;
  closeAndQuit: boolean;
} = {
  mainWindow: null,
  closeAndQuit: true,
};

/**
 * Get main window instance
 *
 * @returns BrowserWindow instance, or null if not created
 */
export function getMainWindow(): BrowserWindow | null {
  return Instance.mainWindow;
}

/**
 * Create main application window
 *
 * Creates BrowserWindow using config.windowsOption configuration.
 * When openDevTools=true in config, automatically opens developer tools.
 * After window creation, emits WindowReady lifecycle event.
 *
 * @returns BrowserWindow instance
 */
export function createMainWindow(): BrowserWindow {
  const { openDevTools, windowsOption } = getConfig() as {
    openDevTools: boolean | Electron.OpenDevToolsOptions;
    windowsOption: ConstructorParameters<typeof BrowserWindow>[0];
  };
  const win = new BrowserWindow(windowsOption);
  Instance.mainWindow = win;

  // Developer tools
  if (isObject(openDevTools)) {
    win.webContents.openDevTools(openDevTools as unknown as Electron.OpenDevToolsOptions);
  } else if (openDevTools === true) {
    win.webContents.openDevTools({ mode: 'bottom' });
  }

  eventBus.emitLifecycle(WindowReady);
  return win;
}

/**
 * Restore main window
 *
 * If window is minimized, restores it, then shows and focuses it.
 * Used when a second instance starts to activate the existing instance's window.
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
 * Set close and quit flag
 *
 * @param flag - true means the application will quit after window closes
 */
export function setCloseAndQuit(flag: boolean): void {
  Instance.closeAndQuit = flag;
}

/**
 * Get close and quit flag
 */
export function getCloseAndQuit(): boolean {
  return Instance.closeAndQuit;
}

/**
 * Load service page
 *
 * Selects page loading strategy based on configuration and environment:
 * 1. Remote mode (remote.enable=true) → Load remote URL
 * 2. Development environment → Load frontend dev server (wait for ready), show startup page first
 * 3. Production environment + cross takeover → Wait for cross-process service to be ready then load
 * 4. Production environment (default) → Load locally packaged file
 */
export async function loadServer(): Promise<void> {
  const { remote, mainServer } = getConfig() as {
    remote: { enable: boolean; url: string };
    mainServer: { protocol: string; indexPath: string; takeover: string; loadingPage: string };
  };
  const win = getMainWindow();
  if (!win) return;

  // Remote mode: load remote URL directly
  if (remote.enable) {
    loadMainUrl('remote', remote.url);
    return;
  }

  // Development environment
  if (isDev()) {
    const binFile = path.join(getBaseDir(), './cmd/bin.js');
    const binConfig = loadFile(binFile) as { dev: DevConfig };
    const dev = binConfig?.dev || {} as DevConfig;
    const frontendConf = extend(true, {
      protocol: 'http://',
      hostname: 'localhost',
      port: 8080,
      indexPath: 'index.html',
      directory: 'frontend/dist',
    }, dev.frontend || {}) as DevFrontendConfig;
    const electronConf = (dev.electron || {}) as DevElectronConfig;

    let url = frontendConf.protocol + frontendConf.hostname + ':' + frontendConf.port;
    let load: 'url' | 'file' = 'url';
    // file:// protocol loads local file directly
    if (isFileProtocol(frontendConf.protocol)) {
      url = path.join(getBaseDir(), frontendConf.directory, frontendConf.indexPath);
      load = 'file';
    }

    // HTTP mode: show startup page first, wait for frontend dev server to be ready
    if (load === 'url') {
      // Load loading page
      if (electronConf.loadingPage) {
        _loadingPage(path.join(getBaseDir(), electronConf.loadingPage));
      }

      // Poll to check if frontend dev server is ready
      const retryTimes = frontendConf.force === true ? 3 : 60;
      const frontendReady = await waitForUrl(url, { retries: retryTimes, intervalMs: 1000, timeoutMs: 1000 });
      debugLog('frontend ready: %s', frontendReady);

      if (frontendReady === false && frontendConf.force !== true) {
        // Frontend service not ready, show failure page
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

  // Production environment: cross takeover mode
  if (mainServer.takeover && mainServer.takeover.length > 0) {
    await crossTakeover();
    return;
  }

  // Production environment: load local file
  const indexPath = mainServer.indexPath;
  let prodUrl = path.join(getBaseDir(), indexPath);
  if (!isFileProtocol(mainServer.protocol)) {
    prodUrl = mainServer.protocol + indexPath;
  }
  loadMainUrl('spa', prodUrl, 'file');
}

/**
 * Load main page URL or file
 *
 * @param type - Load type (remote / spa)
 * @param url - URL or file path
 * @param load - Load method: 'url' uses loadURL, 'file' uses loadFile
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
      .catch((err) => {
        coreLogger.error(`Please check the ${url} !`, err);
        throw err;
      });
  } else {
    win.loadURL(url, mainServer.options)
      .catch((err) => {
        coreLogger.error(`Please check the ${url} !`, err);
        throw err;
      });
  }
}

/**
 * Load startup page
 *
 * Displayed while waiting for frontend service to be ready, avoiding blank screen.
 *
 * @param filepath - Startup page HTML file path
 */
function _loadingPage(filepath: string): void {
  const win = getMainWindow();
  if (!win) return;

  if (fileIsExist(filepath)) {
    win.loadFile(filepath);
  }
}

/**
 * Cross-process service takeover page loading
 *
 * Waits for the specified cross-process service (e.g., Go/Python backend) to be ready, then loads the URL it provides.
 * Flow:
 * 1. Show loading page (if loadingPage is configured)
 * 2. Check if cross-process service configuration is correct
 * 3. Poll and wait for service URL to be reachable
 * 4. Load service URL when ready, show failure page on timeout
 */
async function crossTakeover(): Promise<void> {
  const crossConf = getConfig().cross as Record<string, { enable?: boolean; name?: string; [key: string]: unknown }>;
  const mainConf = getConfig().mainServer as { takeover: string; loadingPage: string };

  // Show loading page
  if (mainConf.loadingPage && mainConf.loadingPage.length > 0) {
    const lp = path.join(getBaseDir(), mainConf.loadingPage);
    _loadingPage(lp);
  }

  // Get the URL of the cross-process service
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

  // Poll and wait for service to be ready
  const times = isDev() ? 20 : 100;
  const sleeptime = isDev() ? 1000 : 200;
  const serviceReady = await waitForUrl(url, { retries: times, intervalMs: sleeptime, timeoutMs: 100 });
  debugLog('cross service ready: %s', serviceReady);

  if (!serviceReady) {
    // Service not ready, show failure page
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
