import debug from "debug";
import { loadController } from "../controller";
import { eventBus, Ready } from "./events";
import { loadSocket } from "../socket";
import { loadElectron } from "../electron";
const debugLog = debug("ee-core:app:appliaction");
class Appliaction {
  constructor() {
  }
  register(eventName, handler) {
    return eventBus.register(eventName, handler);
  }
  run() {
    loadController();
    loadSocket();
    eventBus.emitLifecycle(Ready);
    loadElectron();
  }
}
const app = new Appliaction();
export {
  Appliaction,
  app
};
