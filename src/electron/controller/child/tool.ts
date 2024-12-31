/**
 * ToolController class
 */
class ToolController {
  /**
   * Test method
   */
  async test(): Promise<string> {
    return 'hello electron-egg';
  }
}

ToolController.toString = () => '[class ToolController]';
export default ToolController;