"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainWindow = getMainWindow;
exports.createMainWindow = createMainWindow;
exports.restoreMainWindow = restoreMainWindow;
exports.setCloseAndQuit = setCloseAndQuit;
exports.getCloseAndQuit = getCloseAndQuit;
exports.loadServer = loadServer;
const debug_1 = __importDefault(require("debug"));
const is_type_of_1 = __importDefault(require("is-type-of"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const electron_1 = require("electron");
const config_1 = require("../../config");
const events_1 = require("../../app/events");
const ps_1 = require("../../ps");
const core_1 = require("../../core");
const utils_1 = require("../../utils");
const html_1 = require("../../html");
const helper_1 = require("../../utils/helper");
const log_1 = require("../../log");
const extend_1 = require("../../utils/extend");
const cross_1 = require("../../cross");
const debugLog = (0, debug_1.default)('ee-core:electron:window');
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
    const { openDevTools, windowsOption } = (0, config_1.getConfig)();
    const win = new electron_1.BrowserWindow(windowsOption);
    Instance.mainWindow = win;
    // DevTools
    if (is_type_of_1.default.object(openDevTools)) {
        win.webContents.openDevTools(openDevTools);
    }
    else if (openDevTools === true) {
        win.webContents.openDevTools({
            mode: 'bottom'
        });
    }
    events_1.eventBus.emitLifecycle(events_1.WindowReady);
    return win;
}
// restored window
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
    const { remote, mainServer } = (0, config_1.getConfig)();
    const win = getMainWindow();
    // remote model
    if (remote.enable == true) {
        type = 'remote';
        url = remote.url;
        loadMainUrl(type, url);
        return;
    }
    // 开发环境
    if ((0, ps_1.isDev)()) {
        let url;
        let load = 'url';
        const binFile = path_1.default.join((0, ps_1.getBaseDir)(), "./cmd/bin.js");
        const binConfig = (0, core_1.loadFile)(binFile);
        const { dev } = binConfig;
        // tips: match with ee-bin
        const frontendConf = (0, extend_1.extend)(true, {
            protocol: 'http://',
            hostname: 'localhost',
            port: 8080,
            indexPath: 'index.html',
        }, dev.frontend);
        const electronConf = (0, extend_1.extend)(true, {
            loadingPage: '/public/html/loading.html',
        }, dev.electron);
        url = frontendConf.protocol + frontendConf.hostname + ':' + frontendConf.port;
        if ((0, utils_1.isFileProtocol)(frontendConf.protocol)) {
            url = path_1.default.join((0, ps_1.getBaseDir)(), frontendConf.directory, frontendConf.indexPath);
            load = 'file';
        }
        // Check if UI serve is started, load a boot page first
        if (load == 'url') {
            // loading page
            let lp = (0, html_1.getHtmlFilepath)('boot.html');
            if (electronConf.hasOwnProperty('loadingPage') && electronConf.loadingPage != '') {
                lp = path_1.default.join((0, ps_1.getBaseDir)(), electronConf.loadingPage);
            }
            _loadingPage(lp);
            // check frontend is ready
            const retryTimes = frontendConf.force === true ? 3 : 60;
            let count = 0;
            let frontendReady = false;
            while (!frontendReady && count < retryTimes) {
                await (0, helper_1.sleep)(1 * 1000);
                try {
                    await (0, axios_1.default)({
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
                }
                catch (err) {
                    // console.warn(err.stack)
                }
                count++;
            }
            debugLog('it takes %d seconds to start the frontend', count);
            if (frontendReady == false && frontendConf.force !== true) {
                const bootFailurePage = (0, html_1.getHtmlFilepath)('failure.html');
                if (win) {
                    win.loadFile(bootFailurePage);
                }
                log_1.coreLogger.error(`[ee-core] Please check the ${url} !`);
                return;
            }
        }
        loadMainUrl(type, url, load);
        return;
    }
    // 生产环境
    // cross takeover web
    if (mainServer.takeover.length > 0) {
        await crossTakeover();
        return;
    }
    // 主进程
    url = path_1.default.join((0, ps_1.getBaseDir)(), mainServer.indexPath);
    loadMainUrl(type, url, 'file');
}
/**
 * 主服务
 * @params load <string> value: "url" 、 "file"
 */
function loadMainUrl(type, url, load = 'url') {
    const { mainServer } = (0, config_1.getConfig)();
    const mainWindow = getMainWindow();
    log_1.coreLogger.info('[ee-core] Env: %s, Type: %s', (0, ps_1.env)(), type);
    log_1.coreLogger.info('[ee-core] App running at: %s', url);
    if (mainWindow) {
        if (load == 'file') {
            mainWindow.loadFile(url, mainServer.options)
                .then()
                .catch((err) => {
                log_1.coreLogger.error(`[ee-core] Please check the ${url} !`);
            });
        }
        else {
            mainWindow.loadURL(url, mainServer.options)
                .then()
                .catch((err) => {
                log_1.coreLogger.error(`[ee-core] Please check the ${url} !`);
            });
        }
    }
}
// loading page 
function _loadingPage(name) {
    if (!(0, helper_1.fileIsExist)(name)) {
        return;
    }
    const win = getMainWindow();
    if (win) {
        win.loadFile(name);
    }
}
/**
 * cross takeover web
 */
async function crossTakeover() {
    const crossConf = (0, config_1.getConfig)().cross;
    const mainConf = (0, config_1.getConfig)().mainServer;
    // loading page
    if (mainConf.loadingPage.length > 0) {
        const lp = path_1.default.join((0, ps_1.getBaseDir)(), mainConf.loadingPage);
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
    const url = cross_1.cross.getUrl(entityName);
    // 循环检查
    let count = 0;
    let serviceReady = false;
    const times = (0, ps_1.isDev)() ? 20 : 100;
    const sleeptime = (0, ps_1.isDev)() ? 1000 : 200;
    while (!serviceReady && count < times) {
        await (0, helper_1.sleep)(sleeptime);
        try {
            await (0, axios_1.default)({
                method: 'get',
                url,
                timeout: 100,
                proxy: false,
                headers: {
                    'Accept': 'text/html, application/json, text/plain, */*',
                },
            });
            serviceReady = true;
        }
        catch (err) {
            // console.warn(err.stack)
        }
        count++;
    }
    debugLog('it takes %d seconds to start the cross serivce', count * sleeptime);
    if (serviceReady == false) {
        const bootFailurePage = (0, html_1.getHtmlFilepath)('cross-failure.html');
        const mainWindow = getMainWindow();
        if (mainWindow) {
            mainWindow.loadFile(bootFailurePage);
        }
        throw new Error(`[ee-core] Please check cross service [${service}] ${url} !`);
    }
    log_1.coreLogger.info(`[ee-core] cross service [${service}] is started successfully`);
    loadMainUrl('spa', url);
}
//# sourceMappingURL=index.js.map