/**
 * ExampleController class
 */
class ExampleController {
  /**
   * Test method
   */
  async test(): Promise<string> {
    return 'hello electron-egg';
  }
}

// 设置类的toString方法，虽然在TypeScript中不常见
ExampleController.toString = () => '[class ExampleController]';

// 默认导出类
export default ExampleController;