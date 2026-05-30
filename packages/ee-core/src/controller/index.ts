/**
 * @module controller
 * @description Controller module entry point. Provides controller loading and retrieval functionality.
 *
 * Controllers are the core of business logic; each frontend IPC request is ultimately routed to a corresponding controller method.
 *
 * Usage:
 * - loadController(): Synchronous loading (CJS projects)
 * - loadControllerAsync(): Asynchronous loading (ESM projects)
 * - getController() / getControllers(): Retrieve loaded controller mapping
 *
 * Thread safety: The loading flag prevents concurrent synchronous and asynchronous loading;
 * calling a synchronous method during async loading throws an error.
 */
import { ControllerLoader } from './controller_loader.js';

/** Loaded controller method mapping */
let controllers: Record<string, unknown> | null = null;

/** Flag indicating async loading is in progress, preventing sync/async load race conditions */
let loading = false;

/**
 * Load controllers synchronously
 *
 * Uses require() to load all controller files, suitable for CJS projects.
 * If async loading is in progress, calling this method throws an error.
 *
 * @returns Controller method mapping object
 * @throws Throws an error when async loading is in progress
 */
export function loadController(): Record<string, unknown> {
  if (loading) {
    throw new Error('[ee-core] Controllers are being loaded asynchronously. Use getControllers() after the async load completes.');
  }
  const loader = new ControllerLoader();
  controllers = loader.load();
  return controllers;
}

/**
 * Load controllers asynchronously
 *
 * Uses import() to asynchronously load all controller files, suitable for ESM projects.
 * Sets the loading flag during loading to prevent synchronous loading operations.
 *
 * @returns Controller method mapping object
 */
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

/**
 * Get all loaded controllers
 *
 * If controllers have not been loaded yet, synchronous loading is automatically triggered.
 * Calling during async loading throws an error.
 *
 * @returns Controller method mapping object
 * @throws Throws an error when async loading is in progress
 */
export function getControllers(): Record<string, unknown> {
  if (loading) {
    throw new Error('[ee-core] Controllers are being loaded asynchronously. Await the async load before accessing controllers.');
  }
  if (!controllers) {
    loadController();
  }
  return controllers!;
}

/**
 * Get controllers (alias for getControllers)
 *
 * @returns Controller method mapping object
 */
export function getController(): Record<string, unknown> {
  return getControllers();
}
