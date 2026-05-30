import { ControllerLoader } from './controller_loader.js';

let controllers: Record<string, unknown> | null = null;
let loading = false;

export function loadController(): Record<string, unknown> {
  if (loading) {
    throw new Error('[ee-core] Controllers are being loaded asynchronously. Use getControllers() after the async load completes.');
  }
  const loader = new ControllerLoader();
  controllers = loader.load();
  return controllers;
}

export async function loadControllerAsync(): Promise<Record<string, unknown>> {
  loading = true;
  try {
    const loader = new ControllerLoader();
    controllers = await loader.loadAsync();
    return controllers;
  } finally {
    loading = false;
  }
}

export function getControllers(): Record<string, unknown> {
  if (loading) {
    throw new Error('[ee-core] Controllers are being loaded asynchronously. Await the async load before accessing controllers.');
  }
  if (!controllers) {
    loadController();
  }
  return controllers!;
}

export function getController(): Record<string, unknown> {
  return getControllers();
}
