/**
 * 轮询
 */
export default function (tasks: any[], currentIndex: number, context: any) {
  if (!tasks.length) return null;

  const task = tasks[currentIndex];
  context.currentIndex ++;
  context.currentIndex %= tasks.length;

  return task || null;
};
