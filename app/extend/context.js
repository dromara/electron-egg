/**
 *
 * @type {{foo(*)}}
 */
'use strict';
module.exports = {
  isMobile() {
    const deviceAgent = this.get('user-agent').toLowerCase();
    const agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    if (agentID) {
      // 手机访问
      return true;
    }
    // 电脑访问
    return false;
  },
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
  },
  async infoPage(msg) {
    await this.render('500', { msg });
  },
};
