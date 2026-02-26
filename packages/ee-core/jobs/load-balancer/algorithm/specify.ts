/**
 * 声明绑定
 */
export default function (tasks: any[], id: any) {
  let task: any;

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      task = tasks[i];
      break;
    }
  }

  return task || null;
};
