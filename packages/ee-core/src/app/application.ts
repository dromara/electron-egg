import { loadController } from '../controller/index.js';
import { eventBus, Ready } from './events.js';
import { loadSocket } from '../socket/index.js';
import { loadElectron } from '../electron/index.js';

export class Application {
  register(eventName: string, handler: (...args: unknown[]) => void): void {
    eventBus.register(eventName, handler);
  }

  run(): void {
    loadController();
    loadSocket();
    eventBus.emitLifecycle(Ready);
    loadElectron();
  }
}

export const app = new Application();
