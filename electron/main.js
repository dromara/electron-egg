const { ElectronEgg } = require('ee-core');
const Lifecycle = require('./preload/lifecycle');

const app = new ElectronEgg();
const lifecycle = new Lifecycle();
app.register("ready", lifecycle.ready());

app.run();