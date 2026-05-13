/**
 * 最小连接数
 */
module.exports = function (tasks, conMap={}) {
  if (tasks.length < 2) return tasks[0] || null;

  let min = conMap[tasks[0].id];
  let minIndex = 0;

  for (let i = 1; i < tasks.length; i++) {
    const con = conMap[tasks[i].id] || 0;
    if (con <= min) {
      min = con;
      minIndex = i;
    }
  }

  return tasks[minIndex] || null;
};