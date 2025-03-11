'use strict';

const { logger } = require('ee-core/log');
const { isChildJob, exit } = require('ee-core/ps');
const { childMessage } = require('ee-core/message');
const { welcome } = require('./hello');
const { UserService } = require('../../service/job/user');
const { sqlitedbService } = require('../../service/database/sqlitedb');

/**
 * example - TimerJob
 * @class
 */
class TimerJob {

  constructor() {
    this.timer = undefined;
    this.timeoutTimer = undefined;
    this.number = 0;
    this.countdown = 10; // 倒计时
    sqlitedbService.init();
  }

  /**
   * handle()方法是必要的，且会被自动调用
   * params 传递的参数
   */
  async handle(params) {
    logger.info("[child-process] TimerJob params: ", params);
    const { jobId } = params;

    // 子进程中使用service
    // 1. 确保引入的 service 中不能有electron 的 api或依赖， electron 不支持
    const userService = new UserService();
    userService.hello('job');

    // 执行任务
    // 多次运行时，重置倒计时
    this.number = 0;
    this.countdown = 10;
    this.doTimer(jobId);

    // sqlite
    const userList = await sqlitedbService.getAllTestDataSqlite();
    logger.info('[child-process] Sqlite userList:', userList);
  }
  
  /**
   * 暂停任务运行
   */
  async pause(jobId) {
    logger.info("[child-process] Pause timerJob, jobId: ", jobId);
    clearInterval(this.timer);
    clearInterval(this.timeoutTimer);
  }

  /**
   * 恢复任务运行
   */
  async resume(jobId, pid) {
    logger.info("[child-process] Resume timerJob, jobId: ", jobId, ", pid: ", pid);
    this.doTimer(jobId);
  }  

  /**
   * 运行任务
   */
  async doTimer(jobId) {
    // 计时器模拟任务
    const eventName = 'job-timer-progress-' + jobId;
    this.timer = setInterval(() => {
      welcome();

      childMessage.send(eventName, {jobId, number: this.number, end: false});
      this.number++;
      this.countdown--;
    }, 1000);

    // 用 setTimeout 模拟任务运行时长
    this.timeoutTimer = setTimeout(() => {
      // 关闭计时器模拟任务
      clearInterval(this.timer);

      // 任务结束，重置前端显示
      childMessage.send(eventName, {jobId, number:0, pid:0, end: true});

      // 如果是childJob任务，必须调用 exit() 方法，让进程退出，否则会常驻内存
      // 如果是childPoolJob任务，常驻内存，等待下一个业务
      if (isChildJob()) {
        exit();
      }
    }, this.countdown * 1000)
  }
}

TimerJob.toString = () => '[class TimerJob]';
module.exports = TimerJob;
