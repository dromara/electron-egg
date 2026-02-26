import { coreLogger } from "../log";
import { isForkedChild, isRenderer, isDev, isMain } from "../ps";
import { getConfig } from "../config";
import { childMessage } from "../message";
function loadException() {
  uncaughtExceptionHandler();
  unhandledRejectionHandler();
}
function uncaughtExceptionHandler() {
  process.on("uncaughtException", function(err) {
    if (!(err instanceof Error)) {
      err = new Error(String(err));
    }
    if (err.name === "Error") {
      err.name = "unhandledExceptionError";
    }
    coreLogger.error(err);
    _devError(err);
    _exit();
  });
}
function uncaughtExceptionMonitorHandler() {
  process.on("uncaughtExceptionMonitor", function(err, origin) {
    if (!(err instanceof Error)) {
      err = new Error(String(err));
    }
    coreLogger.error("uncaughtExceptionMonitor:", err);
  });
}
function unhandledRejectionHandler() {
  process.on("unhandledRejection", function(err) {
    if (!(err instanceof Error)) {
      const newError = new Error(String(err));
      if (err) {
        if (err.name) newError.name = err.name;
        if (err.message) newError.message = err.message;
        if (err.stack) newError.stack = err.stack;
      }
      err = newError;
    }
    if (err.name === "Error") {
      err.name = "unhandledRejectionError";
    }
    coreLogger.error(err);
    _devError(err);
    _exit();
  });
}
function _devError(err) {
  if (isForkedChild() && isDev()) {
    childMessage.sendErrorToTerminal(err);
  }
}
function _exit() {
  const { mainExit, childExit, rendererExit } = getConfig().exception;
  if (isMain() && mainExit == true) {
    _delayExit();
  } else if (isForkedChild() && childExit == true) {
    _delayExit();
  } else if (isRenderer() && rendererExit == true) {
    _delayExit();
  } else {
  }
}
function _delayExit() {
  setTimeout(() => {
    process.exit();
  }, 1500);
}
export {
  loadException,
  uncaughtExceptionHandler,
  uncaughtExceptionMonitorHandler,
  unhandledRejectionHandler
};
