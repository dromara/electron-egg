'use strict';

const { Receiver, Processes } = require('../const/channel');

class ChildMessage {

  // Send a message to the main process for ChildJob instance
  sendToMain(eventName, params = {}) {
    const receiver = Receiver.childJob;
    return this.send(eventName, params, receiver);
  }

  // Send a message to the main process for a task instance
  send(eventName, params = {}, receiver) {
    const eventReceiver = receiver || Receiver.forkProcess;
    const message = {
      channel: Processes.sendToMain,
      eventReceiver,
      event: eventName,
      data: params,
    }

    return process.send(message);
  }

  exit(code = 0) {
    return process.exit(code);
  }

  sendErrorToTerminal(err) {
    let errTips = (err && typeof err == 'object') ? err.toString() : '';
    errTips += ' Error !!! Please See file ee-core.log or ee-error-xxx.log for details !'
    const message = {
      channel: Processes.showException,
      data: errTips
    }
    process.send(message);
  }
}

module.exports = { 
  ChildMessage
};
