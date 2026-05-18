import { ControllerLoader } from './controller_loader.js';

let controllers: Record<string, unknown> | null = null;

export function loadController(): Record<string, unknown> {
  const loader = new ControllerLoader();
  controllers = loader.load();
  return controllers;
}

export function getControllers(): Record<string, unknown> {
  if (!controllers) {
    throw new Error('Controllers not loaded. Call loadController() first.');
  }
  return controllers;
}

export function getController(): Record<string, unknown> {
  return getControllers();
}
