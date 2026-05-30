/**
 * @module message/childMessage
 * @description Child process message communication module. Provides the ability for child processes
 * (created via child_process.fork) to send messages to the main process, serving as the core
 * implementation of the framework's IPC communication mechanism on the child process side.
 *
 * Child processes cannot directly access Electron's ipcRenderer/ipcMain,
 * so they communicate with the main process via Node.js built-in process.send() method.
 * The main process receives and dispatches these messages by listening to the child process's message event.
 *
 * Message format follows the framework's unified IPC protocol:
 * ```
 * {
 *   channel: string,      // Communication channel, e.g. 'ee#sendToMain'
 *   eventReceiver: string, // Receiver type, e.g. 'job' / 'task'
 *   event: string,        // Event name
 *   data: object          // Event data
 * }
 * ```
 *
 * Usage examples:
 * ```ts
 * // Send a message to the ChildJob instance in the main process from a child process
 * childMessage.sendToMain('taskComplete', { result: 42 });
 *
 * // Send a message to the Fork process instance in the main process from a child process
 * childMessage.send('dataReady', { items: [...] });
 *
 * // Send error information to the terminal
 * childMessage.sendErrorToTerminal(new Error('Something went wrong'));
 * ```
 */
import { Receiver, Processes } from '../const/channel.js';

/**
 * ChildMessage - Child process message communication class
 *
 * Encapsulates methods for child processes to send messages to the main process,
 * distinguishing different receiver types (ChildJob / ForkProcess),
 * and provides error information forwarding capability.
 *
 * This class runs in the child process environment, relies on process.send() for communication,
 * and returns false if the current process does not support process.send (non-forked process).
 */
export class ChildMessage {
  /**
   * Send a message to the ChildJob instance in the main process
   *
   * Uses Receiver.childJob as the receiver type. After the main process receives the message,
   * it routes the event to the corresponding ChildJob handler.
   *
   * @param eventName - Event name, the main process dispatches to the corresponding handler based on this
   * @param params - Event parameters, defaults to an empty object
   * @returns Returns true if sent successfully, false if the current process does not support process.send
   */
  sendToMain(eventName: string, params: Record<string, unknown> = {}): boolean {
    const receiver = Receiver.childJob;
    return this.send(eventName, params, receiver);
  }

  /**
   * Send a message to the main process (generic method)
   *
   * Constructs a message object conforming to the framework's IPC protocol and sends it to the main process via process.send().
   * If no receiver is specified, defaults to Receiver.forkProcess (generic task process).
   *
   * @param eventName - Event name
   * @param params - Event parameters, defaults to an empty object
   * @param receiver - Receiver type, defaults to Receiver.forkProcess
   *   - 'job': ChildJob-type child process
   *   - 'task': Fork process (generic task)
   * @returns Returns true if sent successfully, false if the current process does not support process.send
   */
  send(eventName: string, params: Record<string, unknown> = {}, receiver?: string): boolean {
    const eventReceiver = receiver || Receiver.forkProcess;
    const message = {
      channel: Processes.sendToMain,
      eventReceiver,
      event: eventName,
      data: params,
    };

    return process.send ? process.send(message) : false;
  }

  /**
   * Exit the current child process
   *
   * @param code - Exit code, defaults to 0 (normal exit)
   * @throws Never returns (process.exit terminates the process)
   */
  exit(code = 0): never {
    return process.exit(code);
  }

  /**
   * Send error information to the main process and display an exception dialog in the renderer process
   *
   * Sends via the Processes.showException channel. After the main process receives it,
   * it forwards it to the renderer process via IPC, which displays a dialog with the error information.
   * The error message includes a tip guiding the user to check the log file for details.
   *
   * @param err - Error object
   * @returns Returns true if sent successfully, false if the current process does not support process.send
   */
  sendErrorToTerminal(err: Error): boolean {
    let errTips = err && typeof err === 'object' ? err.toString() : '';
    // Append a tip guiding the user to check the log file for the full error stack
    errTips += ' Error !!! Please See file ee-core.log or ee-error-xxx.log for details !';
    const message = {
      channel: Processes.showException,
      data: errTips,
    };
    return process.send ? process.send(message) : false;
  }
}

/** Child process message communication singleton, for direct use by child process code */
export const childMessage = new ChildMessage();
