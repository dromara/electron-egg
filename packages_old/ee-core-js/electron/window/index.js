'use strict';

const debug = require('debug')('ee-core:electron:window');
const is = require('is-type-of');
const path = require('path');
const axios = require('axios');
const { BrowserWindow } = require('electron');
const { getConfig } = require('../../config');
const { eventBus, WindowReady } = require('../../app/events');
const { env, isDev, getBaseDir } = require('../../ps');
const { loadFile } = require('../../loader');
const { isFileProtocol } = require('../../utils');
const { getHtmlFilepath } = require('../../html');
const { fileIsExist, sleep } = require('../../utils/helper');
const { coreLogger } = require('../../log');
const { extend } = require('../../utils/extend');
const { cross } = require('../../cross');

const Instance = {
  mainWindow: null,
  closeAndQuit: true,
};

// getMainWindow
function getMainWindow() {
  return Instance.mainWindow;
}

// Create the main application window
function createMainWindow() {
  const { openDevTools, windowsOption } = getConfig();
  const win = new BrowserWindow(windowsOption);
  Instance.mainWindow = win;

  // DevTools
  if (is.object(openDevTools)) {
    win.webContents.openDevTools(openDevTools);
  } else if (openDevTools === true) {
    win.webContents.openDevTools({
      mode: 'bottom'
    });
  }
  
  eventBus.emitLifecycle(WindowReady);
  return win;
}

// restored window
function restoreMainWindow() {
  if (Instance.mainWindow) {
    if (Instance.mainWindow.isMinimized()) {
      Instance.mainWindow.restore();
    }
    Instance.mainWindow.show();
    Instance.mainWindow.focus();
  }
}

// Set the flag for exiting after close all windows
function setCloseAndQuit(flag) {
  Instance.closeAndQuit = flag;
}

function getCloseAndQuit() {
  return Instance.closeAndQuit;
}

// load server 
// type: remote | single
async function loadServer() {
  let type = 'spa';
  let url = '';
  const { remote, mainServer } = getConfig();
  const win = getMainWindow();

  // remote model
  if (remote.enable == true) {
    type = 'remote';
    url = remote.url;
    loadMainUrl(type, url);
    return;
  }

  // 开发环境
  if (isDev()) {
    let url;
    let load = 'url';

    const binFile = path.join(getBaseDir(), "./cmd/bin.js");
    const binConfig = loadFile(binFile);
    const { dev } = binConfig;
    // tips: match with ee-bin
    const frontendConf = extend(true, {
      protocol: 'http://',
      hostname: 'localhost',
      port: 8080,
      indexPath: 'index.html',
    }, dev.frontend);
    const electronConf = extend(true, {
      loadingPage: '/public/html/loading.html',
    }, dev.electron);

    url = frontendConf.protocol + frontendConf.hostname + ':' + frontendConf.port;
    if (isFileProtocol(frontendConf.protocol)) {
      url = path.join(getBaseDir(), frontendConf.directory, frontendConf.indexPath);
      load = 'file';
    }

    // Check if UI serve is started, load a boot page first
    if (load == 'url') {
      // loading page
      let lp = getHtmlFilepath('boot.html');
      if (electronConf.hasOwnProperty('loadingPage') && electronConf.loadingPage != '') {
        lp = path.join(getBaseDir(), electronConf.loadingPage);
      }
      _loadingPage(lp);

      // check frontend is ready
      const retryTimes = frontendConf.force === true ? 3 : 60;
      let count = 0;
      let frontendReady = false;
      while(!frontendReady && count < retryTimes){
        await sleep(1 * 1000);
        try {
          await axios({
            method: 'get',
            url,
            timeout: 1000,
            proxy: false,
            headers: { 
              'Accept': 'text/html, application/json, text/plain, */*',
            },
            //responseType: 'text',
          });
          frontendReady = true;
        } catch(err) {
          // console.warn(err.stack)
        }
        count++;
      }
      debug('it takes %d seconds to start the frontend', count);

      if (frontendReady == false && frontendConf.force !== true) {
        const bootFailurePage = getHtmlFilepath('failure.html');
        win.loadFile(bootFailurePage);
        coreLogger.error(`[ee-core] Please check the ${url} !`);
        return;
      }
    }

    loadMainUrl(type, url, load);
    return;
  }

  // 生产环境
  // cross takeover web
  if (mainServer.takeover.length > 0) {
    await crossTakeover()
    return
  }

  // 主进程
  url = path.join(getBaseDir(), mainServer.indexPath);
  loadMainUrl(type, url, 'file');
}

/**
 * 主服务
 * @params load <string> value: "url" 、 "file"
 */
function loadMainUrl(type, url, load = 'url') {
  const { mainServer } = getConfig();
  const mainWindow = getMainWindow();
  coreLogger.info('[ee-core] Env: %s, Type: %s', env(), type);
  coreLogger.info('[ee-core] App running at: %s', url);
  if (load ==  'file')  {
    mainWindow.loadFile(url, mainServer.options)
    .then()
    .catch((err)=>{
      coreLogger.error(`[ee-core] Please check the ${url} !`);
    });
  } else {
    mainWindow.loadURL(url, mainServer.options)
    .then()
    .catch((err)=>{
      coreLogger.error(`[ee-core] Please check the ${url} !`);
    });
  }
}

// loading page 
function _loadingPage(name) {
  if (!fileIsExist(name)) {
    return
  }
  const win = getMainWindow();
  win.loadFile(name);
}

/**
 * cross takeover web
 */
async function crossTakeover() {
  const crossConf = getConfig().cross;
  const mainConf = getConfig().mainServer;

  // loading page
  if (mainConf.loadingPage.length > 0) {
    const lp = path.join(getBaseDir, mainConf.loadingPage);
    _loadingPage(lp);
  }

  // cross service url
  const service = mainConf.takeover;
  if (!crossConf.hasOwnProperty(service)) {
    throw new Error(`[ee-core] Please Check the value of mainServer.takeover in the config file !`);
  }
  // check service
  if (crossConf[service].enable != true) {
    throw new Error(`[ee-core] Please Check the value of cross.${service} enable is true !`);
  }

  const entityName = crossConf[service].name;
  const url = cross.getUrl(entityName);

  // 循环检查
  let count = 0;
  let serviceReady = false;
  const times = isDev() ? 20 : 100;
  const sleeptime = isDev() ? 1000 : 200;
  while(!serviceReady && count < times){
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
    } catch(err) {
      // console.warn(err.stack)
    }
    count++;
  }
  debug('it takes %d seconds to start the cross serivce', count * sleeptime);

  if (serviceReady == false) {
    const bootFailurePage = getHtmlFilepath('cross-failure.html');
    const mainWindow = getMainWindow();
    mainWindow.loadFile(bootFailurePage);
    throw new Error(`[ee-core] Please check cross service [${service}] ${url} !`)
  }

  coreLogger.info(`[ee-core] cross service [${service}] is started successfully`);
  loadMainUrl('spa', url);
} 

module.exports = {
  getMainWindow,
  createMainWindow,
  restoreMainWindow,
  setCloseAndQuit,
  getCloseAndQuit,
  loadServer
};