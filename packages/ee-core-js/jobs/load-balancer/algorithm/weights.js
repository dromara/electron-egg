/**
 * 权重
 */
module.exports = function (tasks, weightTotal, context) {

  if (!tasks.length) return null;

  let max = tasks[0].weight, maxIndex = 0, sum;

  for (let i = 0; i < tasks.length; i++) {
    sum = (tasks[i].weight || 0) + Math.random() * weightTotal;
    if (sum >= max) {
      max = sum;
      maxIndex = i;
    }
  }

  context.weightIndex += 1;
  context.weightIndex %= (weightTotal + 1);

  return tasks[maxIndex];
};