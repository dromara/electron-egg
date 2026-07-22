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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vZWxlY3Ryb24vam9icy9leGFtcGxlL3RpbWVyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdlZS1jb3JlL2xvZyc7XG5pbXBvcnQgeyBpc0NoaWxkSm9iLCBleGl0IH0gZnJvbSAnZWUtY29yZS9wcyc7XG5pbXBvcnQgeyBjaGlsZE1lc3NhZ2UgfSBmcm9tICdlZS1jb3JlL21lc3NhZ2UnO1xuaW1wb3J0IHsgd2VsY29tZSB9IGZyb20gJy4vaGVsbG8nO1xuXG4vKipcbiAqIGV4YW1wbGUgLSBUaW1lckpvYlxuICogQGNsYXNzXG4gKi9cbmNsYXNzIFRpbWVySm9iIHtcbiAgcHJpdmF0ZSB0aW1lcjogTm9kZUpTLlRpbWVvdXQgfCB1bmRlZmluZWQ7XG4gIHByaXZhdGUgdGltZW91dFRpbWVyOiBOb2RlSlMuVGltZW91dCB8IHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBudW1iZXI6IG51bWJlcjtcbiAgcHJpdmF0ZSBjb3VudGRvd246IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnRpbWVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMudGltZW91dFRpbWVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMubnVtYmVyID0gMDtcbiAgICB0aGlzLmNvdW50ZG93biA9IDEwOyAvLyBcdTUwMTJcdThCQTFcdTY1RjZcbiAgfVxuXG4gIC8qKlxuICAgKiBoYW5kbGUoKVx1NjVCOVx1NkNENVx1NjYyRlx1NUZDNVx1ODk4MVx1NzY4NFx1RkYwQ1x1NEUxNFx1NEYxQVx1ODhBQlx1ODFFQVx1NTJBOFx1OEMwM1x1NzUyOFxuICAgKiBwYXJhbXMgXHU0RjIwXHU5MDEyXHU3Njg0XHU1M0MyXHU2NTcwXG4gICAqL1xuICBhc3luYyBoYW5kbGUocGFyYW1zOiB7IGpvYklkOiBzdHJpbmcgfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZ2dlci5pbmZvKFwiW2NoaWxkLXByb2Nlc3NdIFRpbWVySm9iIHBhcmFtczogXCIsIHBhcmFtcyk7XG4gICAgY29uc3QgeyBqb2JJZCB9ID0gcGFyYW1zO1xuXG4gICAgLy8gXHU2MjY3XHU4ODRDXHU0RUZCXHU1MkExXG4gICAgLy8gXHU1OTFBXHU2QjIxXHU4RkQwXHU4ODRDXHU2NUY2XHVGRjBDXHU5MUNEXHU3RjZFXHU1MDEyXHU4QkExXHU2NUY2XG4gICAgdGhpcy5udW1iZXIgPSAwO1xuICAgIHRoaXMuY291bnRkb3duID0gMTA7XG4gICAgdGhpcy5kb1RpbWVyKGpvYklkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTY2ODJcdTUwNUNcdTRFRkJcdTUyQTFcdThGRDBcdTg4NENcbiAgICovXG4gIGFzeW5jIHBhdXNlKGpvYklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2dnZXIuaW5mbyhcIltjaGlsZC1wcm9jZXNzXSBQYXVzZSB0aW1lckpvYiwgam9iSWQ6IFwiLCBqb2JJZCk7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcbiAgICBjbGVhckludGVydmFsKHRoaXMudGltZW91dFRpbWVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdTYwNjJcdTU5MERcdTRFRkJcdTUyQTFcdThGRDBcdTg4NENcbiAgICovXG4gIGFzeW5jIHJlc3VtZShqb2JJZDogc3RyaW5nLCBwaWQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZ2dlci5pbmZvKFwiW2NoaWxkLXByb2Nlc3NdIFJlc3VtZSB0aW1lckpvYiwgam9iSWQ6IFwiLCBqb2JJZCwgXCIsIHBpZDogXCIsIHBpZCk7XG4gICAgdGhpcy5kb1RpbWVyKGpvYklkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcdThGRDBcdTg4NENcdTRFRkJcdTUyQTFcbiAgICovXG4gIGFzeW5jIGRvVGltZXIoam9iSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1OEJBMVx1NjVGNlx1NTY2OFx1NkEyMVx1NjJERlx1NEVGQlx1NTJBMVxuICAgIGNvbnN0IGV2ZW50TmFtZSA9ICdqb2ItdGltZXItcHJvZ3Jlc3MtJyArIGpvYklkO1xuICAgIHRoaXMudGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICB3ZWxjb21lKCk7XG5cbiAgICAgIGNoaWxkTWVzc2FnZS5zZW5kKGV2ZW50TmFtZSwge2pvYklkLCBudW1iZXI6IHRoaXMubnVtYmVyLCBlbmQ6IGZhbHNlfSk7XG4gICAgICB0aGlzLm51bWJlcisrO1xuICAgICAgdGhpcy5jb3VudGRvd24tLTtcbiAgICB9LCAxMDAwKTtcblxuICAgIC8vIFx1NzUyOCBzZXRUaW1lb3V0IFx1NkEyMVx1NjJERlx1NEVGQlx1NTJBMVx1OEZEMFx1ODg0Q1x1NjVGNlx1OTU3RlxuICAgIHRoaXMudGltZW91dFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAvLyBcdTUxNzNcdTk1RURcdThCQTFcdTY1RjZcdTU2NjhcdTZBMjFcdTYyREZcdTRFRkJcdTUyQTFcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7XG5cbiAgICAgIC8vIFx1NEVGQlx1NTJBMVx1N0VEM1x1Njc1Rlx1RkYwQ1x1OTFDRFx1N0Y2RVx1NTI0RFx1N0FFRlx1NjYzRVx1NzkzQVxuICAgICAgY2hpbGRNZXNzYWdlLnNlbmQoZXZlbnROYW1lLCB7am9iSWQsIG51bWJlcjowLCBwaWQ6MCwgZW5kOiB0cnVlfSk7XG5cbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjYyRmNoaWxkSm9iXHU0RUZCXHU1MkExXHVGRjBDXHU1RkM1XHU5ODdCXHU4QzAzXHU3NTI4IGV4aXQoKSBcdTY1QjlcdTZDRDVcdUZGMENcdThCQTlcdThGREJcdTdBMEJcdTkwMDBcdTUxRkFcdUZGMENcdTU0MjZcdTUyMTlcdTRGMUFcdTVFMzhcdTlBN0JcdTUxODVcdTVCNThcbiAgICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjYyRmNoaWxkUG9vbEpvYlx1NEVGQlx1NTJBMVx1RkYwQ1x1NUUzOFx1OUE3Qlx1NTE4NVx1NUI1OFx1RkYwQ1x1N0I0OVx1NUY4NVx1NEUwQlx1NEUwMFx1NEUyQVx1NEUxQVx1NTJBMVxuICAgICAgaWYgKGlzQ2hpbGRKb2IoKSkge1xuICAgICAgICBleGl0KCk7XG4gICAgICB9XG4gICAgfSwgdGhpcy5jb3VudGRvd24gKiAxMDAwKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRpbWVySm9iO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQXVCO0FBQ3ZCLGdCQUFpQztBQUNqQyxxQkFBNkI7QUFDN0IsbUJBQXdCO0FBTXhCLE1BQU0sU0FBUztBQUFBLEVBQ0w7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUVSLGNBQWM7QUFDWixTQUFLLFFBQVE7QUFDYixTQUFLLGVBQWU7QUFDcEIsU0FBSyxTQUFTO0FBQ2QsU0FBSyxZQUFZO0FBQUEsRUFDbkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTUEsTUFBTSxPQUFPLFFBQTBDO0FBQ3JELHNCQUFPLEtBQUsscUNBQXFDLE1BQU07QUFDdkQsVUFBTSxFQUFFLE1BQU0sSUFBSTtBQUlsQixTQUFLLFNBQVM7QUFDZCxTQUFLLFlBQVk7QUFDakIsU0FBSyxRQUFRLEtBQUs7QUFBQSxFQUNwQjtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS0EsTUFBTSxNQUFNLE9BQThCO0FBQ3hDLHNCQUFPLEtBQUssMkNBQTJDLEtBQUs7QUFDNUQsa0JBQWMsS0FBSyxLQUFLO0FBQ3hCLGtCQUFjLEtBQUssWUFBWTtBQUFBLEVBQ2pDO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLQSxNQUFNLE9BQU8sT0FBZSxLQUE0QjtBQUN0RCxzQkFBTyxLQUFLLDRDQUE0QyxPQUFPLFdBQVcsR0FBRztBQUM3RSxTQUFLLFFBQVEsS0FBSztBQUFBLEVBQ3BCO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLQSxNQUFNLFFBQVEsT0FBOEI7QUFFMUMsVUFBTSxZQUFZLHdCQUF3QjtBQUMxQyxTQUFLLFFBQVEsWUFBWSxNQUFNO0FBQzdCLGdDQUFRO0FBRVIsa0NBQWEsS0FBSyxXQUFXLEVBQUMsT0FBTyxRQUFRLEtBQUssUUFBUSxLQUFLLE1BQUssQ0FBQztBQUNyRSxXQUFLO0FBQ0wsV0FBSztBQUFBLElBQ1AsR0FBRyxHQUFJO0FBR1AsU0FBSyxlQUFlLFdBQVcsTUFBTTtBQUVuQyxvQkFBYyxLQUFLLEtBQUs7QUFHeEIsa0NBQWEsS0FBSyxXQUFXLEVBQUMsT0FBTyxRQUFPLEdBQUcsS0FBSSxHQUFHLEtBQUssS0FBSSxDQUFDO0FBSWhFLGNBQUksc0JBQVcsR0FBRztBQUNoQiw0QkFBSztBQUFBLE1BQ1A7QUFBQSxJQUNGLEdBQUcsS0FBSyxZQUFZLEdBQUk7QUFBQSxFQUMxQjtBQUNGO0FBRUEsSUFBTyxnQkFBUTsiLAogICJuYW1lcyI6IFtdCn0K
