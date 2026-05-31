import { logger } from 'ee-core/log';

/**
 * effect
 * @class
 */
class EffectService {

  /**
   * hello
   */
  async hello(args: any): Promise<any> {
    let obj = {
      status:'ok',
      params: args
    }
    logger.info('EffectService obj:', obj);

    return obj;
  }

}
(EffectService as any).toString = () => '[class EffectService]';

export {
  EffectService,
  effectService: new EffectService()
};  
