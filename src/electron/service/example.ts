import { logger } from 'ee-core/log';

/**
 * ExampleService class for demonstration purposes
 */
class ExampleService {
  /**
   * Test method
   * @param args The arguments passed to the method
   */
  async test(args: any): Promise<{ status: string; params: any }> {
    let obj = {
      status: 'ok',
      params: args,
    };

    logger.info('ExampleService obj:', obj);

    // Services.get('framework').test('egg'); // This line is commented out and would need proper typing if used

    return obj;
  }
}

// Setting the class toString method, which is not common in TypeScript
ExampleService.toString = () => '[class ExampleService]';

export { ExampleService, exampleService: new ExampleService() };