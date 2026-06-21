'use strict';

/**
 * Development environment configuration, coverage config.default.js
 */
module.exports = () => {
  return {
    openDevTools: {
      mode: 'detach'
    },
    jobs: {
      messageLog: false
    }
  };
};
