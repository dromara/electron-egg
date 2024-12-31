import { logger } from 'ee-core/log';

/**
 * EffectService class for handling effects
 */
class EffectService {
  /**
   * Hello method
   * @param args The arguments passed to the method
   */
  async hello(args: any): Promise<{ status: string; params: any }> {
    let obj = {
      status: 'ok',
      params: args,
    };
    logger.info('EffectService obj:', obj);

    return obj;
  }
}

// Setting the class toString method, which is not common in TypeScript
EffectService.toString = () => '[class EffectService]';

export { EffectService, new EffectService() as effectService };