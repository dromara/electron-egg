'use strict';

const BaseService = require('./base');
const io = require('socket.io-client');

this.instance = null;

class SocketService extends BaseService {

  instance() {
    if (!SocketService.instance) {
      const port = this.service.storage.getElectronIPCPort();
      const url  = 'http://localhost:' + port;
      const instance = io(url);
      SocketService.instance = instance;
    }
    return SocketService.instance;
  }

  call (method = '', params) {
    return new Promise((resolve, reject) => {
      this.instance().emit('ipc', { cmd: method, params: params }, (response) => {
        resolve(response);
      });
    });
  }

  async getWsUrl () {
    const port = this.service.storage.getElectronIPCPort();
    const url  = 'http://localhost:' + port;

    return url;
  }
}

module.exports = SocketService;
