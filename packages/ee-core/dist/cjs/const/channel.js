"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receiver = exports.Events = exports.SocketIO = exports.Processes = void 0;
const Processes = {
    showException: 'ee#showException',
    sendToMain: 'ee#sendToMain'
};
exports.Processes = Processes;
const SocketIO = {
    partySoftware: 'socket-channel',
};
exports.SocketIO = SocketIO;
const Events = {
    childProcessExit: 'ee#childProcess#exit',
    childProcessError: 'ee#childProcess#error',
};
exports.Events = Events;
const Receiver = {
    childJob: 'job',
    forkProcess: 'task',
    all: 'all'
};
exports.Receiver = Receiver;
//# sourceMappingURL=channel.js.map