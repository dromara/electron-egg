'use strict';

const Ready = "ready";
const ElectronAppReady = "electron-app-ready";
const WindowReady = "window-ready";
const BeforeClose = "before-close";
const Preload = "preload";

class EventBus {
  constructor() {
    this.lifecycleEvents = {};
    this.eventsMap = {};
  }

  // add lifecycle event
  register(eventName, handler) {
    if (!this.lifecycleEvents[eventName]) {
      this.lifecycleEvents[eventName] = handler;
    }
  }

  // call lifecycle event
  // [todo] 如果是一个 async 函数，且函数的运行时间比较长，如何正确执行
  emitLifecycle(eventName, ...args) {
    const eventFn = this.lifecycleEvents[eventName];
    if (eventFn) {
      eventFn(...args);
    }
  } 

  // add listener
  on(eventName, handler) {
    if (!this.eventsMap[eventName]) {
      this.eventsMap[eventName] = handler;
    }
  }

  // emit listener
  emit(eventName, ...args) {
    const eventFn = this.eventsMap[eventName];
    if (eventFn) {
      eventFn(...args);
    }
  }
}

const eventBus = new EventBus();

module.exports = {
  EventBus,
  eventBus,
  Ready,
  ElectronAppReady,
  WindowReady,
  Preload,
  BeforeClose
};