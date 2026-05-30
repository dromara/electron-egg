/**
 * @module const/channel
 * @description IPC communication channel and event constant definitions.
 * Centrally manages channel names and event names used internally by the framework, avoiding hardcoded strings.
 */

/** Inter-process communication channels */
export const Processes = {
  /** Exception display channel: renderer process displays an exception dialog upon receiving this channel message */
  showException: 'ee#showException',
  /** Channel for child process to send messages to the main process */
  sendToMain: 'ee#sendToMain',
} as const;

/** SocketIO communication channels */
export const SocketIO = {
  /** Third-party software communication channel (default SocketIO communication channel name) */
  partySoftware: 'socket-channel',
} as const;

/** Process lifecycle events */
export const Events = {
  /** Child process exit event */
  childProcessExit: 'ee#childProcess#exit',
  /** Child process error event */
  childProcessError: 'ee#childProcess#error',
} as const;

/** Message receiver types */
export const Receiver = {
  /** ChildJob-type child process */
  childJob: 'job',
  /** Fork process (generic task) */
  forkProcess: 'task',
  /** All receivers */
  all: 'all',
} as const;
