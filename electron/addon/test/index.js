/**
 * test插件
 * @class
 */
class TestAddon {

  constructor(app) {
    this.app = app;
  }

  /**
   * 销毁窗口Contents id
   *
   * @function 
   * @since 1.0.0
   */
  hello () {
    return 'hello';
  }  
}

TestAddon.toString = () => '[class TestAddon]';
module.exports = TestAddon;