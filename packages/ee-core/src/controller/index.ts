import { ControllerLoader } from './controller_loader.js';

let controllers: Record<string, unknown> | null = null;

export function loadController(): Record<string, unknown> {
  const loader = new ControllerLoader();
  controllers = loader.load();
  return controllers;
}

export async function loadControllerAsync(): Promise<Record<string, unknown>> {
  const loader = new ControllerLoader();
  controllers = await loader.loadAsync();
  return controllers;
}

export function getControllers(): Record<string, unknown> {
  if (!controllers) {
    loadController();
  }
  return controllers!;
}

export function getController(): Record<string, unknown> {
  return getControllers();
}
