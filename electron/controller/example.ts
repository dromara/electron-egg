/**
 * example
 * @class
 */
class ExampleController {
  static toString() { return '[class ExampleController]'; }

  /**
   * test
   */
  async test (): Promise<string> {
    return 'hello electron-egg';
  }
}
export default ExampleController;
