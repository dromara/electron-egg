'use strict';

const BaseController = require('../base'); 
const os = require('os');
const fs = require('fs');
const path = require('path');

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
        dir = os.userInfo().homedir + '/Downloads';
        break;
      case 'picture' :
        dir = os.userInfo().homedir + '/Pictures';
        break;    
      case 'doc' :
        dir = os.userInfo().homedir + '/Documents';
        break;      
      case 'music' :
        dir = os.userInfo().homedir + '/Music';
        break;    
    }

    await service.example.openLocalDir(dir);

    self.sendSuccess(data);
  }

  async uploadFile() {
    const self = this;
    const { ctx, service } = this;
    let tmpDir = service.storage.getStorageDir();
    // for (const file of ctx.request.files) {
    //   this.app.logger.info('file:', file);

    //   try {
    //     let tmpFile = fs.readFileSync(file.filepath) 
    //     fs.writeFileSync(path.join(tmpDir, file.filename), tmpFile)
    //   } finally {
    //     await fs.unlink(file.filepath, function(){});
    //   }
    //   const fileStream = fs.createReadStream(path.join(tmpDir, file.filename)) 
    //   const uploadRes = await service.example.uploadFileToSMMS(fileStream);
    // }
    const file = ctx.request.files[0];
    this.app.logger.info('file:', file);

    try {
      let tmpFile = fs.readFileSync(file.filepath) 
      fs.writeFileSync(path.join(tmpDir, file.filename), tmpFile)
    } finally {
      await fs.unlink(file.filepath, function(){});
    }
    const fileStream = fs.createReadStream(path.join(tmpDir, file.filename)) 
    const uploadRes = await service.example.uploadFileToSMMS(fileStream);

    self.sendData(uploadRes);
  }
}

module.exports = ExampleController;
