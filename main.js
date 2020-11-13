const {app, BrowserWindow, Menu, shell} = require('electron')
const path = require('path')
const eggLauncher = require('./electron/lanucher')
const setup = require('./electron/setup')
const electronConfig = require('./electron/config')
const storage = require('./electron/storage')

// Initialize 
setup()
// return

// main window
global.MAIN_WINDOW = null

if (process.mas) app.setName('electron-egg')

// Open url with the default browser
app.on('web-contents-created', (e, webContents) => {
    webContents.on('new-window', (event, url) => {
        event.preventDefault()
        shell.openExternal(url)
    });
});

async function initialize () {

  // dynamic port
  await storage.setDynamicPort();
  
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
      console.log('window-all-closed quit')
      app.quit()
    }
  })
}

async function createWindow () {
  // argv
  const eggConfig = electronConfig.get('egg')
  for (let i = 0; i < process.argv.length; i++) {
    const tmpArgv = process.argv[i]
    if (tmpArgv.indexOf('--env=') !== -1) {
      eggConfig.env = tmpArgv.substr(6)
    }
  }

  MAIN_WINDOW = new BrowserWindow(electronConfig.get('windowsOption'))
  
  // if (process.platform === 'linux') {
  //   windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
  // }

  if (eggConfig.env === 'prod') {
    // hidden menu
    Menu.setApplicationMenu(null)
  }

  // loding page
  MAIN_WINDOW.loadURL(path.join('file://', __dirname, '/app/public/loading.html'))
  
  // egg server
  setTimeout(function(){
    startServer(eggConfig)
  }, 100)

  return MAIN_WINDOW
}

async function startServer (options) {
  let startRes = null
  ELog.info('[main] [startServer] options', options)
  startRes = await eggLauncher.start(options).then((res) => res, (err) => err)
  ELog.info('startRes:', startRes)
  if (startRes === 'success') {
    let url = 'http://localhost:' + options.port
    MAIN_WINDOW.loadURL(url)

    return true
  }
  app.relaunch()
}

initialize()