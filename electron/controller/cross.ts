import { crossService } from '../service/cross';

/**
 * Cross
 * @class
 */
class CrossController {

  /**
   * View process service information
   */
  info() {
    crossService.info();
    return 'hello electron-egg';
  }

  /**
   * Get service url
   */  
  async getUrl(args: { name: string }): Promise<string> {
    const { name } = args;
    const serverUrl = crossService.getUrl(name);
    return serverUrl;
  }

  /**
   * kill service
   * By default (modifiable), killing the process will exit the electron application.
   */  
  async killServer(args: { type: string; name: string }): Promise<void> {
    const { type, name } = args;
    crossService.killServer(type, name);
    return;
  }

  /**
   * create service
   */   
  async createServer(args: { program: string }): Promise<void> {
    const { program } = args;
    if (program == 'go') {
      crossService.createGoServer();
    } else if (program == 'java') {
      crossService.createJavaServer();
    } else if (program == 'python') {
      crossService.createPythonServer();
    }

    return;
  }

  /**
   * Access the api for the cross service
   */
  async requestApi(args: { name: string; urlPath: string; params: any }): Promise<any> {
    const { name, urlPath, params} = args;
    const data = await crossService.requestApi(name, urlPath, params);
    return data;
  }
}
CrossController.toString = () => '[class CrossController]';

export default CrossController;