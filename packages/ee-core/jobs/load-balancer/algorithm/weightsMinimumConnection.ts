/**
 * 权重最小连接数
 */
export default function (tasks: any[], weightTotal: number, connectionsMap: any, context: any) {

  if (!tasks.length) return null;

  let min = tasks[0].weight, minIndex = 0, sum: number;

  const connectionsTotal = tasks.reduce((total: number, cur: any) => {
    total += (connectionsMap[cur.id] || 0);
    return total;
  }, 0);

  // algorithm: (weight + connections'weight) + random factor
  for (let i = 0; i < tasks.length; i++) {
    sum =
      (tasks[i].weight || 0) + (Math.random() * weightTotal) +
      (( (connectionsMap[tasks[i].id] || 0) * weightTotal ) / connectionsTotal);
    if (sum <= min) {
      min = sum;
      minIndex = i;
    }
  }

  context.weightIndex += 1;
  context.weightIndex %= (weightTotal + 1);

  return tasks[minIndex];
};
