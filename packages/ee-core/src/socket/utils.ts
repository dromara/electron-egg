/**
 * @module socket/utils
 * @description Socket 模块共享工具函数。
 * 提供控制器函数解析能力，被 HttpServer、IpcServer、SocketServer 共同使用。
 */
import { isFunction } from '../utils/type_check.js';
import { coreLogger } from '../log/index.js';

/**
 * 从通道/命令路径字符串解析控制器函数
 *
 * 将 cmd 按 separator 分割后，逐级在 controller 对象树中查找对应的函数。
 * 例如：cmd='controller/user/add', separator='/' → 查找 controller.user.add
 *
 * @param controller - 控制器方法映射对象
 * @param cmd - 通道/命令路径字符串（非字符串类型直接返回 null）
 * @param separator - 路径分隔符
 * @returns 控制器方法函数，解析失败返回 null
 */
export function resolveControllerFn(
  controller: Record<string, unknown>,
  cmd: string,
  separator: string,
): ((...args: unknown[]) => unknown) | null {
  // 防御：非字符串类型（如 WebSocket 传入的数字等）直接返回
  if (typeof cmd !== 'string') return null;

  const actions = cmd.split(separator);
  let obj: Record<string, unknown> = { controller };
  for (const key of actions) {
    obj = obj[key] as Record<string, unknown>;
    if (!obj) {
      coreLogger.error(`[resolveControllerFn] class or function '${key}' not exists in path '${cmd}'`);
      return null;
    }
  }

  if (!isFunction(obj)) {
    coreLogger.error(`[resolveControllerFn] resolved path '${cmd}' is not a function`);
    return null;
  }

  return obj as unknown as (...args: unknown[]) => unknown;
}
