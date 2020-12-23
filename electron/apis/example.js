'use strict';

const {app} = require('electron');

exports.getPath = function () {
  const dir = app.getAppPath();
  ELog.info('dir:', dir);

  return dir;
}

exports.openDir = function () {
  const dir = app.getAppPath();
  ELog.info('dir:', dir);

  return dir;
}

exports = module.exports;