import { Receiver, Processes } from '../const/channel.js';

export class ChildMessage {
  sendToMain(eventName: string, params: Record<string, unknown> = {}): boolean {
    const receiver = Receiver.childJob;
    return this.send(eventName, params, receiver);
  }

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

  exit(code = 0): never {
    return process.exit(code);
  }

  sendErrorToTerminal(err: Error): boolean {
    let errTips = err && typeof err === 'object' ? err.toString() : '';
    errTips += ' Error !!! Please See file ee-core.log or ee-error-xxx.log for details !';
    const message = {
      channel: Processes.showException,
      data: errTips,
    };
    return process.send ? process.send(message) : false;
  }
}

export const childMessage = new ChildMessage();
