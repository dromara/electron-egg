/**
 * 权重轮询
 */
export default function (tasks: any[], weightIndex: number, weightTotal: number, context: any) {

  if (!tasks.length) return null;

  let weight = 0;
  let task: any;

  for (let i = 0; i < tasks.length; i++) {
    weight += tasks[i].weight || 0;
    if (weight > weightIndex) {
      task = tasks[i];
      break;
    }
  }

  context.weightIndex += 1;
  context.weightIndex %= (weightTotal + 1);

  return task;
};
