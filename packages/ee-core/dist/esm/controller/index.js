import { ControllerLoader } from "./controller_loader";
const Instance = {
  controller: null
};
function loadController() {
  const controllerLoader = new ControllerLoader();
  Instance.controller = controllerLoader.load();
}
function getController() {
  if (!Instance.controller) {
    loadController();
  }
  return Instance.controller;
}
export {
  ControllerLoader,
  getController,
  loadController
};
