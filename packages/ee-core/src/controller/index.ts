/**
 * @module controller
 * @description 控制器模块入口。提供控制器的加载和获取功能。
 *
 * 控制器是业务逻辑的核心，每个前端 IPC 请求最终路由到对应的控制器方法。
 *
 * 使用方式：
 * - loadController()：同步加载（CJS 项目）
 * - loadControllerAsync()：异步加载（ESM 项目）
 * - getController() / getControllers()：获取已加载的控制器映射
 *
 * 线程安全：loading 标志防止同步和异步加载同时进行，
 * 异步加载期间调用同步方法会抛出错误。
 */
import { ControllerLoader } from './controller_loader.js';

/** 已加载的控制器方法映射 */
let controllers: Record<string, unknown> | null = null;

/** 异步加载进行中的标志，防止同步/异步加载竞争 */
let loading = false;

/**
 * 同步加载控制器
 *
 * 使用 require() 加载所有控制器文件，适用于 CJS 项目。
 * 如果异步加载正在进行中，调用此方法会抛出错误。
 *
 * @returns 控制器方法映射对象
 * @throws 异步加载进行中时抛出错误
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
 * 异步加载控制器
 *
 * 使用 import() 异步加载所有控制器文件，适用于 ESM 项目。
 * 加载期间设置 loading 标志，阻止同步加载操作。
 *
 * @returns 控制器方法映射对象
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
 * 获取所有已加载的控制器
 *
 * 若控制器尚未加载，会自动触发同步加载。
 * 异步加载进行中时调用会抛出错误。
 *
 * @returns 控制器方法映射对象
 * @throws 异步加载进行中时抛出错误
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
 * 获取控制器（getControllers 的别名）
 *
 * @returns 控制器方法映射对象
 */
export function getController(): Record<string, unknown> {
  return getControllers();
}
