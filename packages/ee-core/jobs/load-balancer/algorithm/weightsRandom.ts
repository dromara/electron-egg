/**
 * 权重随机
 */
export default function (tasks: any[], weightTotal: number) {
  let task: any;
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
