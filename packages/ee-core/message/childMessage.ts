import { Receiver, Processes } from '../const/channel';

class ChildMessage {

  // Send a message to the main process for ChildJob instance
  sendToMain(eventName: string, params: any = {}) {
    const receiver = Receiver.childJob;
    return this.send(eventName, params, receiver);
  }

  // Send a message to the main process for a task instance
  send(eventName: string, params: any = {}, receiver: any) {
    const eventReceiver = receiver || Receiver.forkProcess;
    const message = {
      channel: Processes.sendToMain,
      eventReceiver,
      event: eventName,
      data: params,
    };

    if (process.send) {
      return process.send(message);
    }
    return false;
  }

  exit(code: number = 0) {
    return process.exit(code);
  }

  sendErrorToTerminal(err: any) {
    let errTips = (err && typeof err == 'object') ? err.toString() : '';
    errTips += ' Error !!! Please See file ee-core.log or ee-error-xxx.log for details !';
    const message = {
      channel: Processes.showException,
      data: errTips
    };
    if (process.send) {
      process.send(message);
    }
  }
}

export {
  ChildMessage
};
