const { ElectronEgg } = require('ee-core');
const Lifecycle = require('./preload/lifecycle');
const preload = require('./preload/index');

// new app
const app = new ElectronEgg();

// register lifecycle
const life = new Lifecycle();
app.register("ready", life.ready);
app.register("electron-app-ready", life.electronAppReady);
app.register("window-ready", life.windowReady);
app.register("preload", preload);
app.register("before-close", life.beforeClose);

// run
app.run();