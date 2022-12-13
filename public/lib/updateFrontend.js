/** 修改前端配置 */
module.exports = {
  install(eeApp) {
    if (eeApp.config.javaServer.enable) {
      let javaServerPrefix = `http://localhost:${eeApp.config.javaServer.port}`;

      const mainWindow = eeApp.electron.mainWindow;
      const channel = "app.javaPort";
      mainWindow.webContents.send(channel, javaServerPrefix);
      console.log('send');
    }
  },
};
