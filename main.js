const {app, BrowserWindow, BrowserView, Menu} = require('electron')
const path = require('path')
const eggLauncher = require('./electron/lib/lanucher')
const setup = require('./electron/setup')
const electronConfig = require('./electron/config')
const storage = require('./electron/lib/storage')
const preferences = require('./electron/preferences')
const helper = require('./electron/lib/helper')

// main window
global.MAIN_WINDOW = null;
global.APP_TRAY = null;
global.CAN_QUIT = false;

// Initialize 
setup()

// argv
let ENV = 'prod'
for (let i = 0; i < process.argv.length; i++) {
  const tmpArgv = process.argv[i]
  if (tmpArgv.indexOf('--env=') !== -1) {
    ENV = tmpArgv.substr(6)
  }
}
const eggConfig = electronConfig.get('egg', ENV)
eggConfig.env = ENV

// eLogger
const eLogger = require('./electron/lib/eLogger').get()

async function initialize () {
  app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
  
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
      eLogger.info('[main] [initialize] window-all-closed quit')
      helper.appQuit()
    }
  })
}

async function createWindow () {
  const winOptions = electronConfig.get('windowsOption')
  MAIN_WINDOW = new BrowserWindow(winOptions)

  // loading html
  loadingView(winOptions)

  if (eggConfig.env === 'prod') {
    // hidden menu
    Menu.setApplicationMenu(null)

    // dynamic port
    await storage.setDynamicPort()
    eggConfig.port = electronConfig.get('egg', eggConfig.env).port
  }

  // options register
  await preferences()

  // egg server
  await startServer(eggConfig)

  return MAIN_WINDOW
}

async function startServer (options) {
  eLogger.info('[main] [startServer] options', options)
  const protocol = 'http://'
  let startRes = null
  let url = null
  const remoteConfig = electronConfig.get('remoteUrl');

  if (remoteConfig.enable) {
    url = remoteConfig.url
    loadMainUrl(url)
    return true
  }
  
  if (ENV === 'prod') {
    url = protocol + options.hostname + ':' + options.port
  } else {
    const developmentModeConfig = electronConfig.get('developmentMode', ENV)
    const selectMode = developmentModeConfig.default
    const modeInfo = developmentModeConfig.mode[selectMode]
    url = protocol + modeInfo.hostname + ':' + modeInfo.port
  }
  eLogger.info('[main] [url]:', url)
  startRes = await eggLauncher.start(options).then((res) => res, (err) => err)
  eLogger.info('[main] [startServer] startRes:', startRes)
  if (startRes === 'success') {
    loadMainUrl(url)
    return true
  }
  
  app.relaunch()
}

/**
 * White screen optimization
 */
function loadingView (winOptions) {
  const loadingBrowserView = new BrowserView()
  MAIN_WINDOW.setBrowserView(loadingBrowserView)
  loadingBrowserView.setBounds({
    x: 0,
    y: 0,
    width: winOptions.width,
    height: winOptions.height
  });

  // loading html
  const loadingHtml = path.join('file://', __dirname, '/asset/loading.html')
  loadingBrowserView.webContents.loadURL(loadingHtml)
  
  MAIN_WINDOW.webContents.on('dom-ready', async (event) => {
    MAIN_WINDOW.removeBrowserView(loadingBrowserView)
  });
}

function loadMainUrl (url) {
  MAIN_WINDOW.loadURL(url)
}

initialize()