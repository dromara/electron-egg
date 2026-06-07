const { app, BrowserWindow, Tray, nativeImage, Menu } = require('electron');
const path = require('path');

let mainWindow, tray;

function createWindow() {
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'electron_white.png')));
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    });
    mainWindow.setWindowButtonVisibility(true);
    mainWindow.loadURL('https://cn.bing.com');
}
app.whenReady().then(createWindow);
