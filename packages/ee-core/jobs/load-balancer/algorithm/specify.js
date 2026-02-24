/**
 * 声明绑定
 */
module.exports = function (tasks, id) {
  let task;

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      task = tasks[i];
      break;
    }
  }

  return task || null;
};