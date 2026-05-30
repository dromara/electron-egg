/**
 * @module exception
 * @description 全局异常处理模块。注册 uncaughtException 和 unhandledRejection 处理器，
 * 捕获未处理的异常和 Promise rejection，记录日志并根据配置决定是否退出进程。
 *
 * 在框架启动时由 boot.ts 的 init() 最先调用，确保后续流程的异常能被捕获。
 */
import { coreLogger } from '../log/index.js';
import { isForkedChild, isRenderer, isDev, isMain } from '../ps/index.js';
import { getConfig } from '../config/index.js';
import { childMessage } from '../message/index.js';

/**
 * 加载异常处理器
 *
 * 注册全局 uncaughtException 和 unhandledRejection 监听器。
 * 应在应用启动最早阶段调用。
 */
export function loadException(): void {
  uncaughtExceptionHandler();
  unhandledRejectionHandler();
}

/**
 * 未捕获异常处理器
 *
 * 当进程抛出异常且未被 try/catch 捕获时触发。
 * 记录错误日志，开发模式下的子进程还会向终端发送错误信息。
 * 根据异常配置决定是否退出进程。
 */
function uncaughtExceptionHandler(): void {
  process.on('uncaughtException', function (err: unknown) {
    let error = err instanceof Error ? err : new Error(String(err));

    if (error.name === 'Error') {
      error.name = 'unhandledExceptionError';
    }

    coreLogger.error(error);
    _devError(error);
    _exit();
  });
}

/**
 * 未捕获异常监控器
 *
 * 与 uncaughtException 不同，此处理器在异常被捕获前触发，
 * 可用于异常监控和上报，不影响后续异常处理流程。
 */
export function uncaughtExceptionMonitorHandler(): void {
  process.on('uncaughtExceptionMonitor', function (err: unknown) {
    let error = err instanceof Error ? err : new Error(String(err));
    coreLogger.error('uncaughtExceptionMonitor:', error);
  });
}

/**
 * 未处理的 Promise rejection 处理器
 *
 * 当 Promise 被 reject 且没有 .catch() 处理时触发。
 * 尝试从非 Error 类型的 rejection 中提取 name/message/stack 信息。
 */
function unhandledRejectionHandler(): void {
  process.on('unhandledRejection', function (err: unknown) {
    let error: Error;
    if (!(err instanceof Error)) {
      // 非 Error 类型：尝试提取错误信息
      const newError = new Error(String(err));
      if (err && typeof err === 'object') {
        const objErr = err as Record<string, unknown>;
        if (objErr.name) newError.name = objErr.name as string;
        if (objErr.message) newError.message = objErr.message as string;
        if (objErr.stack) newError.stack = objErr.stack as string;
      }
      error = newError;
    } else {
      error = err;
    }

    if (error.name === 'Error') {
      error.name = 'unhandledRejectionError';
    }
    coreLogger.error(error);
    _devError(error);
    _exit();
  });
}

/**
 * 开发环境下子进程向终端发送错误信息
 *
 * 仅在 forked 子进程 + 开发环境下生效，
 * 方便在终端中直接看到子进程的异常信息。
 */
function _devError(err: Error): void {
  if (isForkedChild() && isDev()) {
    childMessage.sendErrorToTerminal(err);
  }
}

/**
 * 根据异常配置决定是否退出进程
 *
 * 配置项：
 * - mainExit: 主进程异常退出
 * - childExit: 子进程异常退出
 * - rendererExit: 渲染进程异常退出
 */
function _exit(): void {
  const exceptionConfig = getConfig().exception as { mainExit: boolean; childExit: boolean; rendererExit: boolean };
  const { mainExit, childExit, rendererExit } = exceptionConfig;

  if (isMain() && mainExit == true) {
    _delayExit();
  } else if (isForkedChild() && childExit == true) {
    _delayExit();
  } else if (isRenderer() && rendererExit == true) {
    _delayExit();
  }
}

/**
 * 延迟退出进程
 *
 * 等待 1500ms 让日志等异步写入完成后再退出，
 * 避免最后的日志丢失。
 */
function _delayExit(): void {
  setTimeout(() => {
    process.exit();
  }, 1500);
}
