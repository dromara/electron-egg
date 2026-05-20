import { coreLogger } from '../log/index.js';
import { isForkedChild, isRenderer, isDev, isMain } from '../ps/index.js';
import { getConfig } from '../config/index.js';
import { childMessage } from '../message/index.js';

// 捕获异常
export function loadException(): void {
  uncaughtExceptionHandler();
  unhandledRejectionHandler();
}

// 当进程上抛出异常而没有被捕获时触发该事件，并且使异常静默。
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

// 当promise中reject的异常在同步任务中没有使用catch捕获就会触发该事件，
// 即便是在异步情况下使用了catch也会触发该事件
function unhandledRejectionHandler(): void {
  process.on('unhandledRejection', function (err: unknown) {
    let error: Error;
    if (!(err instanceof Error)) {
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

function _devError(err: Error): void {
  if (isForkedChild() && isDev()) {
    childMessage.sendErrorToTerminal(err);
  }
}

function _exit(): void {
  const exceptionConfig = getConfig().exception as { mainExit: boolean; childExit: boolean; rendererExit: boolean };
  const { mainExit, childExit, rendererExit } = exceptionConfig;

  if (isMain() && mainExit) {
    _delayExit();
  } else if (isForkedChild() && childExit) {
    _delayExit();
  } else if (isRenderer() && rendererExit) {
    _delayExit();
  }
}

function _delayExit(): void {
  setTimeout(() => {
    process.exit(1);
  }, 3000);
}
