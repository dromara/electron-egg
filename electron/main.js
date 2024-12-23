const { ElectronEgg } = require('ee-core');
const Lifecycle = require('./preload/lifecycle');

const app = new ElectronEgg();
const lifecycle = new Lifecycle();
app.register("ready", lifecycle.ready);
app.register("electron-app-ready", lifecycle.electronAppReady);
app.register("window-ready", lifecycle.windowReady);
app.register("before-close", lifecycle.beforeClose);
app.run();