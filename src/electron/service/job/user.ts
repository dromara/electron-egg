import { logger } from 'ee-core/log';

// The service used in the job should not rely on Electron's API, as it may cause errors
class UserService {
  /**
   * Hello method
   * @param args The arguments passed to the method
   */
  async hello(args: any): Promise<{ status: string; params: any }> {
    let obj = {
      status: 'ok',
      params: args,
    };
    logger.info('UserService obj:', obj);

    return obj;
  }
}

// Setting the class toString method, which is not common in TypeScript
UserService.toString = () => '[class UserService]';

export { UserService };