import type { Config } from 'ee-core';

/**
 *  coverage config.default.js
 */
export default (): Partial<Config> => {
  return {
    openDevTools: false,
  };
};
