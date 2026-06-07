import type { Config } from 'ee-core';

/**
 * Development environment configuration, coverage config.default.js
 */
export default (): Partial<Config> => {
  return {
    openDevTools: {
      mode: 'detach'
    },
    jobs: {
      messageLog: false
    }
  };
};
