/**
 * @module exception
 * @description Global exception handling module. Registers uncaughtException and unhandledRejection handlers,
 * catches unhandled exceptions and Promise rejections, logs them, and decides whether to exit the process based on configuration.
 *
 * Called first during framework startup by boot.ts's init(), ensuring that exceptions in subsequent flows can be caught.
 */
import { coreLogger } from '../log/index.js';
import { isForkedChild, isRenderer, isDev, isMain } from '../ps/index.js';
import { getConfig } from '../config/index.js';
import { childMessage } from '../message/index.js';

/**
 * Load exception handlers
 *
 * Registers global uncaughtException and unhandledRejection listeners.
 * Should be called at the earliest stage of application startup.
 */
export function loadException(): void {
  uncaughtExceptionHandler();
  unhandledRejectionHandler();
}

/**
 * Uncaught exception handler
 *
 * Triggered when the process throws an exception that is not caught by try/catch.
 * Logs the error, and in development mode, child processes also send error information to the terminal.
 * Decides whether to exit the process based on exception configuration.
 */
function uncaughtExceptionHandler(): void {
  process.on('uncaughtException', function (err: unknown) {
    let error = err instanceof Error ? err : new Error(String(err));

    if (error.name === 'Error') {
      error.name = 'unhandledExceptionError';
    }

    try {
      coreLogger.error(error);
    } catch {
      // Logger may fail in child processes (e.g. pino transport unavailable);
      // fall back to console so the error is never silently swallowed.
      console.error('[ee-core] uncaughtException:', error);
    }
    _devError(error);
    _exit();
  });
}

/**
 * Uncaught exception monitor
 *
 * Unlike uncaughtException, this handler is triggered before the exception is caught,
 * and can be used for exception monitoring and reporting without affecting the subsequent exception handling flow.
 */
export function uncaughtExceptionMonitorHandler(): void {
  process.on('uncaughtExceptionMonitor', function (err: unknown) {
    let error = err instanceof Error ? err : new Error(String(err));
    coreLogger.error('uncaughtExceptionMonitor:', error);
  });
}

/**
 * Unhandled Promise rejection handler
 *
 * Triggered when a Promise is rejected and there is no .catch() handler.
 * Attempts to extract name/message/stack information from non-Error type rejections.
 */
function unhandledRejectionHandler(): void {
  process.on('unhandledRejection', function (err: unknown) {
    let error: Error;
    if (!(err instanceof Error)) {
      // Non-Error type: attempt to extract error information
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
    try {
      coreLogger.error(error);
    } catch {
      console.error('[ee-core] unhandledRejection:', error);
    }
    _devError(error);
    _exit();
  });
}

/**
 * Send error information to the terminal from child process in development environment
 *
 * Only effective in forked child processes + development environment,
 * making it convenient to see child process exception information directly in the terminal.
 */
function _devError(err: Error): void {
  if (isForkedChild() && isDev()) {
    childMessage.sendErrorToTerminal(err);
  }
}

/**
 * Decide whether to exit the process based on exception configuration
 *
 * Configuration options:
 * - mainExit: Main process exits on exception
 * - childExit: Child process exits on exception
 * - rendererExit: Renderer process exits on exception
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
 * Delay process exit
 *
 * Waits 1500ms for async operations like log writes to complete before exiting,
 * avoiding loss of the last log entries.
 */
function _delayExit(): void {
  setTimeout(() => {
    process.exit();
  }, 1500);
}
