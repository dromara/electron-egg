/**
 * UserController class
 */
class UserController {
  /**
   * Test method
   */
  async test(): Promise<string> {
    return 'hello electron-egg';
  }
}

UserController.toString = () => '[class UserController]';
export default UserController;