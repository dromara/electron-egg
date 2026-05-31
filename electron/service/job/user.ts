import { logger } from 'ee-core/log';

// The service used in the job should not rely on Electron's API, as it may cause errors
class UserService {

  /**
   * hello
   */
  async hello(args: any): Promise<any> {
    let obj = {
      status:'ok',
      params: args
    }
    logger.info('UserService obj:', obj);

    return obj;
  }

}
(UserService as any).toString = () => '[class UserService]';

export {
  UserService
};  
