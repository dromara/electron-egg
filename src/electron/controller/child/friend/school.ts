/**
 * SchoolController class
 */
class SchoolController {
  /**
   * Test method
   */
  async test(): Promise<string> {
    return 'hello electron-egg';
  }
}

SchoolController.toString = () => '[class SchoolController]';
export default SchoolController;