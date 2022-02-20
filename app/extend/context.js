/**
 *
 * @type {{foo(*)}}
 */
'use strict';
module.exports = {
  success(msg, data, total) {
    this.body = {
      success: true,
      msg,
      result: data,
      total,
    };
  },
  failure(msg, data) {
    this.body = {
      success: false,
      msg,
      result: data,
    };
  }
};
