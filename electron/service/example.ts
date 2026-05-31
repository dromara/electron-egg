import { logger } from 'ee-core/log';

/**
 * 示例服务
 * @class
 */
class ExampleService {

  /**
   * test
   */
  async test(args: any): Promise<any> {
    let obj = {
      status:'ok',
      params: args
    }

    logger.info('ExampleService obj:', obj);

    return obj;
  }
}
(ExampleService as any).toString = () => '[class ExampleService]';

export {
  ExampleService,
  exampleService: new ExampleService()
};
