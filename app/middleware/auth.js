'use strict';

module.exports = () => {
  return async function auth(ctx, next) {

    await next();
  };
};
