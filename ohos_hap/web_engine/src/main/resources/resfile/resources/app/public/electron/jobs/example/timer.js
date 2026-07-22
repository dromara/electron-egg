var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var timer_exports = {};
__export(timer_exports, {
  default: () => timer_default
});
module.exports = __toCommonJS(timer_exports);
var import_log = require("ee-core/log");
var import_ps = require("ee-core/ps");
var import_message = require("ee-core/message");
var import_hello = require("./hello");
class TimerJob {
  timer;
  timeoutTimer;
  number;
  countdown;
  constructor() {
    this.timer = void 0;
    this.timeoutTimer = void 0;
    this.number = 0;
    this.countdown = 10;
  }
  /**
   * handle()方法是必要的，且会被自动调用
   * params 传递的参数
   */
  async handle(params) {
    import_log.logger.info("[child-process] TimerJob params: ", params);
    const { jobId } = params;
    this.number = 0;
    this.countdown = 10;
    this.doTimer(jobId);
  }
  /**
   * 暂停任务运行
   */
  async pause(jobId) {
    import_log.logger.info("[child-process] Pause timerJob, jobId: ", jobId);
    clearInterval(this.timer);
    clearInterval(this.timeoutTimer);
  }
  /**
   * 恢复任务运行
   */
  async resume(jobId, pid) {
    import_log.logger.info("[child-process] Resume timerJob, jobId: ", jobId, ", pid: ", pid);
    this.doTimer(jobId);
  }
  /**
   * 运行任务
   */
  async doTimer(jobId) {
    const eventName = "job-timer-progress-" + jobId;
    this.timer = setInterval(() => {
      (0, import_hello.welcome)();
      import_message.childMessage.send(eventName, { jobId, number: this.number, end: false });
      this.number++;
      this.countdown--;
    }, 1e3);
    this.timeoutTimer = setTimeout(() => {
      clearInterval(this.timer);
      import_message.childMessage.send(eventName, { jobId, number: 0, pid: 0, end: true });
      if ((0, import_ps.isChildJob)()) {
        (0, import_ps.exit)();
      }
    }, this.countdown * 1e3);
  }
}
var timer_default = TimerJob;
