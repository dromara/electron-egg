import { logger } from 'ee-core/log';

// example service
class ExampleService {

  async test(args: any): Promise<{ status: string; params: any }> {
    let obj = {
      status:'ok',
      params: args
    }
    logger.info('ExampleService obj:', obj);
    return obj;
  }
}
ExampleService.toString = () => '[class ExampleService]';
const exampleService = new ExampleService();

export {
  ExampleService,
  exampleService
};