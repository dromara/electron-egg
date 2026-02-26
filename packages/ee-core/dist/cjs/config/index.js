"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.getConfig = getConfig;
const config_loader_1 = require("./config_loader");
const Instance = {
    config: null,
};
function loadConfig() {
    const configLoader = new config_loader_1.ConfigLoader();
    Instance["config"] = configLoader.load();
    return Instance["config"];
}
function getConfig() {
    if (!Instance["config"]) {
        loadConfig();
    }
    return Instance["config"];
}
//# sourceMappingURL=index.js.map