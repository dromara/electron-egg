/**
 * example
 * @class
 */
class ExampleController {

  /**
   * test
   */
  async test(): Promise<string> {
    return 'hello electron-egg';
  }
}
ExampleController.toString = () => '[class ExampleController]';

export default ExampleController;