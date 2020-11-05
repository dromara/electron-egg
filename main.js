const {app, BrowserWindow, Menu, shell} = require('electron')
const path = require('path')
const getPort = require('get-port')
const eggLauncher = require('./electron/lanucher')
const setup = require('./electron/index')
const config = require('./electron/config').get()

setup()

// 主窗口
global.MAIN_WINDOW = null

for (let i = 0; i < process.argv.length; i++) {
  const tmpArgv = process.argv[i];
  if (tmpArgv.indexOf('--env=') !== -1) {
    config.egg.env = tmpArgv.substr(6);
  }
}

if (process.mas) app.setName('electron-egg')

app.on('web-contents-created', (e, webContents) => {
    webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
});

async function createWindow () {
  MAIN_WINDOW = new BrowserWindow(config.windowsOption)

  // if (process.platform === 'linux') {
  //   windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
  // }

  if (config.egg.env === 'prod') {
    //隐藏菜单
    Menu.setApplicationMenu(null)
  }

  // loding页
  MAIN_WINDOW.loadURL(path.join('file://', __dirname, '/app/public/loading.html'))
  
  // egg服务
  setTimeout(function(){
    startServer(config.egg)
  }, 100)

  return MAIN_WINDOW;
}

async function startServer (options) {
  let startRes = null;
  options.port = await getPort({port: options.port})
  ELog.info('config.egg', options);
  startRes = await eggLauncher.start(options).then((res) => res, (err) => err)
  ELog.info('startRes:', startRes);
  if (startRes === 'success') {
    let url = 'http://localhost:' + options.port
    MAIN_WINDOW.loadURL(url)

    return
  }
  app.relaunch()
} 

async function initialize () {
  // loadFiles()
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

initialize()