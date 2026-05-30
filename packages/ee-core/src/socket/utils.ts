/**
 * @module socket/utils
 * @description Shared utility functions for the socket module.
 * Provides controller function resolution, used by HttpServer, IpcServer, and SocketServer.
 */
import { isFunction } from '../utils/type_check.js';
import { coreLogger } from '../log/index.js';

/**
 * Resolve controller function from channel/command path string
 *
 * Splits cmd by separator, then traverses the controller object tree level by level to find the corresponding function.
 * Example: cmd='controller/user/add', separator='/' → looks up controller.user.add
 *
 * @param controller - Controller method mapping object
 * @param cmd - Channel/command path string (non-string types return null directly)
 * @param separator - Path separator
 * @returns Controller method function, or null if resolution fails
 */
export function resolveControllerFn(
  controller: Record<string, unknown>,
  cmd: string,
  separator: string,
): ((...args: unknown[]) => unknown) | null {
  // Guard: non-string types (e.g., numbers passed via WebSocket) return directly
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
