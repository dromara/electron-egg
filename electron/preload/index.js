/*************************************************
 ** preload为预加载模块，该文件将会在程序启动时加载 **
 *************************************************/

/**
 * 预加载模块入口
 */
module.exports = async (app) => {

  const { ChildPoolJob } = require('ee-core/jobs');
  const pool = new ChildPoolJob();
  //let pids = pool.create(4);

  
  setTimeout(()=>{
    pool.create(3).then(pids => {
      console.log('pids:', pids);
    });
  }, 1000)

  setTimeout(()=>{
    let myjob = pool.exec('./jobs/example/timer', {jobId});
  
    // 监听任务进度
    const channel = 'controller.example.timerJobProgress';
    myjob.on('job-timer-progress', (data) => {
      Log.info('[main-process] from TimerJob data:', data);

    })
  }, 5000)



  //已实现的功能模块，可选择性使用和修改
  const trayAddon = app.addon.tray;
  const securityAddon = app.addon.security;
  const awakenAddon = app.addon.awaken;
  const autoUpdaterAddon = app.addon.autoUpdater;
  
  trayAddon.create();
  securityAddon.create();
  awakenAddon.create();
  autoUpdaterAddon.create();
}