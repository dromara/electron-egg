import { logger } from 'ee-core/log';

/**
 * 示例服务
 * @class
 */
class ExampleService {
  /**
   * test
   */
  async test(args: unknown): Promise<{ status: string; params: unknown }> {
    let obj = {
      status:'ok',
      params: args
    }

    logger.info('ExampleService obj:', obj);

    return obj;
  }
}
export const exampleService = new ExampleService();
