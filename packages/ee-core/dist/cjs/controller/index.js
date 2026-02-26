"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerLoader = void 0;
exports.loadController = loadController;
exports.getController = getController;
const controller_loader_1 = require("./controller_loader");
Object.defineProperty(exports, "ControllerLoader", { enumerable: true, get: function () { return controller_loader_1.ControllerLoader; } });
const Instance = {
    controller: null,
};
function loadController() {
    const controllerLoader = new controller_loader_1.ControllerLoader();
    Instance.controller = controllerLoader.load();
}
function getController() {
    if (!Instance.controller) {
        loadController();
    }
    return Instance.controller;
}
//# sourceMappingURL=index.js.map