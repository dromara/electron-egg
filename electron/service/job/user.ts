import { logger } from 'ee-core/log';

// The service used in the job should not rely on Electron's API, as it may cause errors
class UserService {
  static toString() { return '[class UserService]'; }

  /**
   * hello
   */
  async hello(args: unknown): Promise<{ status: string; params: unknown }> {
    let obj = {
      status:'ok',
      params: args
    }
    logger.info('UserService obj:', obj);

    return obj;
  }

}
export { UserService };  
