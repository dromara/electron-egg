'use strict';

const { logger } = require('ee-core/log');

function welcome() {
  logger.info('[child-process] [jobs/example/hello] welcome ! ');
}

module.exports = {
  welcome
};