import { isFunction } from '../utils/type_check.js';
import { coreLogger } from '../log/index.js';

/**
 * Resolve a controller function from a channel/cmd path string.
 * Shared by HttpServer, IpcServer, and SocketServer.
 */
export function resolveControllerFn(
  controller: Record<string, unknown>,
  cmd: string,
  separator: string,
): ((...args: unknown[]) => unknown) | null {
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
