import debug from "debug";
import is from "is-type-of";
import path from "path";
import axios from "axios";
import { BrowserWindow } from "electron";
import { getConfig } from "../../config";
import { eventBus, WindowReady } from "../../app/events";
import { env, isDev, getBaseDir } from "../../ps";
import { loadFile } from "../../core";
import { isFileProtocol } from "../../utils";
import { getHtmlFilepath } from "../../html";
import { fileIsExist, sleep } from "../../utils/helper";
import { coreLogger } from "../../log";
import { extend } from "../../utils/extend";
import { cross } from "../../cross";
const debugLog = debug("ee-core:electron:window");
const Instance = {
  mainWindow: null,
  closeAndQuit: true
};
function getMainWindow() {
  return Instance.mainWindow;
}
function createMainWindow() {
  const { openDevTools, windowsOption } = getConfig();
  const win = new BrowserWindow(windowsOption);
  Instance.mainWindow = win;
  if (is.object(openDevTools)) {
    win.webContents.openDevTools(openDevTools);
  } else if (openDevTools === true) {
    win.webContents.openDevTools({
      mode: "bottom"
    });
  }
  eventBus.emitLifecycle(WindowReady);
  return win;
}
function restoreMainWindow() {
  const mainWindow = Instance.mainWindow;
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
  }
}
function setCloseAndQuit(flag) {
  Instance.closeAndQuit = flag;
}
function getCloseAndQuit() {
  return Instance.closeAndQuit;
}
async function loadServer() {
  let type = "spa";
  let url = "";
  const { remote, mainServer } = getConfig();
  const win = getMainWindow();
  if (remote.enable == true) {
    type = "remote";
    url = remote.url;
    loadMainUrl(type, url);
    return;
  }
  if (isDev()) {
    let url2;
    let load = "url";
    const binFile = path.join(getBaseDir(), "./cmd/bin.js");
    const binConfig = loadFile(binFile);
    const { dev } = binConfig;
    const frontendConf = extend(true, {
      protocol: "http://",
      hostname: "localhost",
      port: 8080,
      indexPath: "index.html"
    }, dev.frontend);
    const electronConf = extend(true, {
      loadingPage: "/public/html/loading.html"
    }, dev.electron);
    url2 = frontendConf.protocol + frontendConf.hostname + ":" + frontendConf.port;
    if (isFileProtocol(frontendConf.protocol)) {
      url2 = path.join(getBaseDir(), frontendConf.directory, frontendConf.indexPath);
      load = "file";
    }
    if (load == "url") {
      let lp = getHtmlFilepath("boot.html");
      if (electronConf.hasOwnProperty("loadingPage") && electronConf.loadingPage != "") {
        lp = path.join(getBaseDir(), electronConf.loadingPage);
      }
      _loadingPage(lp);
      const retryTimes = frontendConf.force === true ? 3 : 60;
      let count = 0;
      let frontendReady = false;
      while (!frontendReady && count < retryTimes) {
        await sleep(1 * 1e3);
        try {
          await axios({
            method: "get",
            url: url2,
            timeout: 1e3,
            proxy: false,
            headers: {
              "Accept": "text/html, application/json, text/plain, */*"
            }
            //responseType: 'text',
          });
          frontendReady = true;
        } catch (err) {
        }
        count++;
      }
      debugLog("it takes %d seconds to start the frontend", count);
      if (frontendReady == false && frontendConf.force !== true) {
        const bootFailurePage = getHtmlFilepath("failure.html");
        if (win) {
          win.loadFile(bootFailurePage);
        }
        coreLogger.error(`[ee-core] Please check the ${url2} !`);
        return;
      }
    }
    loadMainUrl(type, url2, load);
    return;
  }
  if (mainServer.takeover.length > 0) {
    await crossTakeover();
    return;
  }
  url = path.join(getBaseDir(), mainServer.indexPath);
  loadMainUrl(type, url, "file");
}
function loadMainUrl(type, url, load = "url") {
  const { mainServer } = getConfig();
  const mainWindow = getMainWindow();
  coreLogger.info("[ee-core] Env: %s, Type: %s", env(), type);
  coreLogger.info("[ee-core] App running at: %s", url);
  if (mainWindow) {
    if (load == "file") {
      mainWindow.loadFile(url, mainServer.options).then().catch((err) => {
        coreLogger.error(`[ee-core] Please check the ${url} !`);
      });
    } else {
      mainWindow.loadURL(url, mainServer.options).then().catch((err) => {
        coreLogger.error(`[ee-core] Please check the ${url} !`);
      });
    }
  }
}
function _loadingPage(name) {
  if (!fileIsExist(name)) {
    return;
  }
  const win = getMainWindow();
  if (win) {
    win.loadFile(name);
  }
}
async function crossTakeover() {
  const crossConf = getConfig().cross;
  const mainConf = getConfig().mainServer;
  if (mainConf.loadingPage.length > 0) {
    const lp = path.join(getBaseDir(), mainConf.loadingPage);
    _loadingPage(lp);
  }
  const service = mainConf.takeover;
  if (!crossConf.hasOwnProperty(service)) {
    throw new Error(`[ee-core] Please Check the value of mainServer.takeover in the config file !`);
  }
  if (crossConf[service].enable != true) {
    throw new Error(`[ee-core] Please Check the value of cross.${service} enable is true !`);
  }
  const entityName = crossConf[service].name;
  const url = cross.getUrl(entityName);
  let count = 0;
  let serviceReady = false;
  const times = isDev() ? 20 : 100;
  const sleeptime = isDev() ? 1e3 : 200;
  while (!serviceReady && count < times) {
    await sleep(sleeptime);
    try {
      await axios({
        method: "get",
        url,
        timeout: 100,
        proxy: false,
        headers: {
          "Accept": "text/html, application/json, text/plain, */*"
        }
      });
      serviceReady = true;
    } catch (err) {
    }
    count++;
  }
  debugLog("it takes %d seconds to start the cross serivce", count * sleeptime);
  if (serviceReady == false) {
    const bootFailurePage = getHtmlFilepath("cross-failure.html");
    const mainWindow = getMainWindow();
    if (mainWindow) {
      mainWindow.loadFile(bootFailurePage);
    }
    throw new Error(`[ee-core] Please check cross service [${service}] ${url} !`);
  }
  coreLogger.info(`[ee-core] cross service [${service}] is started successfully`);
  loadMainUrl("spa", url);
}
export {
  createMainWindow,
  getCloseAndQuit,
  getMainWindow,
  loadServer,
  restoreMainWindow,
  setCloseAndQuit
};
