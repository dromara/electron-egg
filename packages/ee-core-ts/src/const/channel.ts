export const Processes = {
  showException: 'ee#showException',
  sendToMain: 'ee#sendToMain',
} as const;

export const SocketIO = {
  partySoftware: 'socket-channel',
} as const;

export const Events = {
  childProcessExit: 'ee#childProcess#exit',
  childProcessError: 'ee#childProcess#error',
} as const;

export const Receiver = {
  childJob: 'job',
  forkProcess: 'task',
  all: 'all',
} as const;
