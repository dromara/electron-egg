

import debug from 'debug';
import { loadController } from '../controller';
import { eventBus, Ready } from './events';
import { loadSocket } from '../socket';
import { loadElectron } from '../electron';

const debugLog = debug('ee-core:app:appliaction');

class Appliaction {
  constructor() {

  }

  register(eventName: string, handler: (...args: any[]) => any): void {
    return eventBus.register(eventName, handler);
  }

  run(): void {
    loadController();
    loadSocket();
    eventBus.emitLifecycle(Ready);
    loadElectron();
  }
}

const app = new Appliaction();

export {
  Appliaction,
  app,
};