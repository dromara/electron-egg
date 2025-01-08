import { logger } from 'ee-core/log';

/**
 * UserService class
 */
class UserService {

  async hello(args: any): Promise<{ status: string; params: any }> {
    const obj = {
      status: 'ok',
      params: args,
    };
    logger.info('UserService obj:', obj);
    return obj;
  }
}
UserService.toString = () => '[class UserService]';

export { UserService };