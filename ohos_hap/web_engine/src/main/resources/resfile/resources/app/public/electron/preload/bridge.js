var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: import_electron.ipcRenderer
});
