'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');
const _ = require('lodash');
const storage = require('./storage');

const apis = {};

exports.setup = async function () {
  ELog.info('[api] [setup]');
  setApi();

  // use api server
  let port = await storage.setIpcDynamicPort();
  console.log('api port:', port);
  const listen = 'localhost';
  port = port ? port : 7069;

  const server = http.createServer(function(req, res) {
    ELog.info('[ api ] command received', { method: req.method, url: req.url });
    if ((req.method === 'POST' && req.url === '/send')) {
      let body = '';
      req.setEncoding('utf8');
      req
      .on('data', function(data) {
        body += data;
      })
      .on('end', function() {
        let message;
        try {
          message = JSON.parse(body);
        } catch (e) {
          res.statusCode = 400;
          return res.end('request body parse failure.');
        }
        if (!apis[message.cmd]) {
          ELog.info('[ api ] invalid command called:', message.cmd);
          res.statusCode = 404;
          return res.end('NG');
        }

        const start = Date.now();
        const data = apis[message.cmd]();
        const elapsed = Date.now() - start;
        ELog.info(`api [${message.cmd}] success. elapsed: ${elapsed}ms`, data);
        res.statusCode = 200;
        const result = {
          code: 0,
          data,
        };
        res.end(JSON.stringify(result));
      });
    } else {
      res.statusCode = 404;
      res.end('NOT FOUND');
    }
  });

  server.listen(port, listen, function() {
    ELog.info('[ api ] server is listening on', `${listen}:${port}`);
  });  
};

function setApi() {
  const apiDir = path.normalize(__dirname + '/apis');
  // console.log('apiDir:', apiDir);
  fs.readdirSync(apiDir).forEach(function(filename) {
    if (path.extname(filename) === '.js' && filename !== 'index.js') {
      const name = path.basename(filename, '.js');
      const fileObj = require(`./apis/${filename}`);
      _.map(fileObj, function(fn, method) {
        let methodName = getApiName(name, method);
        apis[methodName] = fn;
        // ELog.info('[ Monitor ]', methodName);
      });
    }
  });
};

/**
 * get api method name
 * ex.) jsname='user' method='get' => 'user.get'
 * @param {String} jsname
 * @param {String} method
 */
function getApiName (jsname, method) {
  return jsname + '.' + method;
  //return jsname + method.charAt(0).toUpperCase() + method.slice(1);
};
