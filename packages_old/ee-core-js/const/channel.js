'use strict';

const Processes = {
  showException: 'ee#showException',
  sendToMain: 'ee#sendToMain'
}

const SocketIO = {
  partySoftware: 'socket-channel',
}

const Events = {
  childProcessExit: 'ee#childProcess#exit',
  childProcessError: 'ee#childProcess#error',
}

const Receiver = {
  childJob: 'job',
  forkProcess: 'task',
  all: 'all'
}

module.exports = {
  Processes,
  SocketIO,
  Events,
  Receiver
};