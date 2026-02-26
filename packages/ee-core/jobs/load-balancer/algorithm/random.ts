/**
 * 随机
 */
export default function (tasks: any[]) {

  const length = tasks.length;
  const target = tasks[Math.floor(Math.random() * length)];

  return target || null;
};
