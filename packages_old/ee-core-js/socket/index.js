'use strict';

const IoServer = require('socket.io');
const IoClient = require('socket.io-client');
const Koa = require('koa');
const { SocketServer } = require('./socketServer');
const { HttpServer } = require('./httpServer');
const { IpcServer } = require('./ipcServer');

const Instance = {
  socketServer: null,
  httpServer: null,
  coreLogger: null,
};

// create SocketServer
function createSocketServer() {
  Instance.socketServer = new SocketServer();
  return Instance.socketServer;
}

// socketServer
function getSocketServer() {
  return Instance.socketServer;
}

// create Http Server
function createHttpServer() {
  Instance.httpServer = new HttpServer();
  return Instance.httpServer;
}

// httpServer
function getHttpServer() {
  return Instance.httpServer;
} 

// create IPC Server
function createIpcServer() {
  Instance.ipcServer = new IpcServer();
  return Instance.ipcServer;
}

// ipcServer
function getIpcServer() {
  return Instance.ipcServer;
}


// load socket server
function loadSocket() {
  createSocketServer();
  createHttpServer();
  createIpcServer();
} 

module.exports = {
  Koa,
  IoServer,
  IoClient,
  loadSocket,
  getSocketServer,
  getHttpServer,
  getIpcServer
};