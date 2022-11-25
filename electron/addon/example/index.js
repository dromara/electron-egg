/**
 * example插件
 * @class
 */
class ExampleAddon {

  constructor(app) {
    this.app = app;
  }

  /**
   * hello
   *
   * @function 
   * @since 1.0.0
   */
  hello () {
    return 'hello';
  }  
}

ExampleAddon.toString = () => '[class ExampleAddon]';
module.exports = ExampleAddon;