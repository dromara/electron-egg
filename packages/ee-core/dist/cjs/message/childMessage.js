"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildMessage = void 0;
const channel_1 = require("../const/channel");
class ChildMessage {
    // Send a message to the main process for ChildJob instance
    sendToMain(eventName, params = {}) {
        const receiver = channel_1.Receiver.childJob;
        return this.send(eventName, params, receiver);
    }
    // Send a message to the main process for a task instance
    send(eventName, params = {}, receiver) {
        const eventReceiver = receiver || channel_1.Receiver.forkProcess;
        const message = {
            channel: channel_1.Processes.sendToMain,
            eventReceiver,
            event: eventName,
            data: params,
        };
        if (process.send) {
            return process.send(message);
        }
        return false;
    }
    exit(code = 0) {
        return process.exit(code);
    }
    sendErrorToTerminal(err) {
        let errTips = (err && typeof err == 'object') ? err.toString() : '';
        errTips += ' Error !!! Please See file ee-core.log or ee-error-xxx.log for details !';
        const message = {
            channel: channel_1.Processes.showException,
            data: errTips
        };
        if (process.send) {
            process.send(message);
        }
    }
}
exports.ChildMessage = ChildMessage;
//# sourceMappingURL=childMessage.js.map