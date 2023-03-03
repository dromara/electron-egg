const { ipcRenderer: ipc } = (window.require && window.require('electron')) || window.electron || {}

export default ipc
