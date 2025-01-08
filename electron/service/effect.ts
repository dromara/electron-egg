import { logger } from 'ee-core/log';

// effect service
class EffectService {

  // hello
  async hello(args: any): Promise<{ status: string; params: any }> {
    let obj = {
      status:'ok',
      params: args
    }
    logger.info('EffectService obj:', obj);

    return obj;
  }
}
EffectService.toString = () => '[class EffectService]';
const effectService = new EffectService();

export {
  EffectService,
  effectService
}