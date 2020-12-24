'use strict';

const BaseController = require('../base'); 

class ExampleController extends BaseController {

  async openLocalDir() {
    const self = this;
    const { ctx, service } = this;
    const body = ctx.request.body;
    const id = body.id;
    const data = {};
    let dir = '';
    switch (id) {
      case 'download' :
        dir = 'C:/Users/Public/Downloads';
        break;
      case 'picture' :
        dir = 'C:/Users/Public/Pictures';
        break;    
      case 'video' :
        dir = 'C:/Users/Public/Videos';
        break;
      case 'doc' :
        dir = 'C:/Users/Public/Documents';
        break;      
      case 'music' :
        dir = 'C:/Users/Public/Music';
        break;    
    }

    await service.example.openLocalDir(dir);

    self.sendSuccess(data);
  }
}

module.exports = ExampleController;
