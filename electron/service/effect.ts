import { logger } from 'ee-core/log';

/**
 * effect
 * @class
 */
class EffectService {
  /**
   * hello
   */
  async hello(args: unknown): Promise<{ status: string; params: unknown }> {
    let obj = {
      status:'ok',
      params: args
    }
    logger.info('EffectService obj:', obj);

    return obj;
  }

}
export const effectService = new EffectService();  
