'use strict';

const { coreLogger } = require('../log');
const { isForkedChild, isRenderer, isDev, isMain } = require('../ps');
const { getConfig } = require('../config');
const { childMessage } = require('../message');

// 捕获异常
function loadException() {
  uncaughtExceptionHandler();
  unhandledRejectionHandler();
}

// 当进程上抛出异常而没有被捕获时触发该事件，并且使异常静默。
function uncaughtExceptionHandler() {
  process.on('uncaughtException', function(err) {
    if (!(err instanceof Error)) {
      err = new Error(String(err));
    }

    if (err.name === 'Error') {
      err.name = 'unhandledExceptionError';
    }

    coreLogger.error(err);

    _devError(err);

    _exit();
  });
}

// 当进程上抛出异常而没有被捕获时触发该事件。
function uncaughtExceptionMonitorHandler() {
  process.on('uncaughtExceptionMonitor', function(err, origin) {
    if (!(err instanceof Error)) {
      err = new Error(String(err));
    }
    coreLogger.error('uncaughtExceptionMonitor:',err);
  });
}

// 当promise中reject的异常在同步任务中没有使用catch捕获就会触发该事件，
// 即便是在异步情况下使用了catch也会触发该事件
function unhandledRejectionHandler() {
  process.on('unhandledRejection', function(err) {
    if (!(err instanceof Error)) {
      const newError = new Error(String(err));
      // err maybe an object, try to copy the name, message and stack to the new error instance
      if (err) {
        if (err.name) newError.name = err.name;
        if (err.message) newError.message = err.message;
        if (err.stack) newError.stack = err.stack;
      }
      err = newError;
    }
    if (err.name === 'Error') {
      err.name = 'unhandledRejectionError';
    }
    coreLogger.error(err);
    _devError(err);
    _exit();
  });
}

// 如果是子进程，发送错误到主进程控制台
function _devError (err) {
  if (isForkedChild() && isDev()) {
    childMessage.sendErrorToTerminal(err);
  }
}

// 捕获异常后是否退出
function _exit () {
  const { mainExit, childExit, rendererExit  } = getConfig().exception;

  if (isMain() && mainExit == true) {
    _delayExit();
  } else if (isForkedChild() && childExit == true) {
    _delayExit();
  } else if (isRenderer() && rendererExit == true) {
    _delayExit();
  } else {
    // other
  }
}

// 捕获异常后是否退出
function _delayExit() {
  // 等待日志等异步写入完成
  setTimeout(() => {
    process.exit();
  }, 1500)
}

module.exports = {
  loadException,
  uncaughtExceptionHandler,
  unhandledRejectionHandler,
  uncaughtExceptionMonitorHandler
};