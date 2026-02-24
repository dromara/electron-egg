/**
 * 权重随机
 */
module.exports = function (tasks, weightTotal) {
  let task;
  let weight = Math.ceil(Math.random() * weightTotal);

  for (let i = 0; i < tasks.length; i++) {
    weight -= tasks[i].weight || 0;
    if (weight <= 0) {
      task = tasks[i];
      break;
    }
  }

  return task || null;
};