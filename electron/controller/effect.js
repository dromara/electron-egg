'use strict';

const { Controller } = require('ee-core');
const { dialog } = require('electron');
const _ = require('lodash');

/**
 * 特效 - 功能demo
 * @class
 */
class EffectController extends Controller {

  constructor(ctx) {
    super(ctx);
  }

  /**
   * 选择文件
   */
  selectFile () {
    const filePaths = dialog.showOpenDialogSync({
      properties: ['openFile']
    });

    if (_.isEmpty(filePaths)) {
      return null
    }

    return filePaths[0];
  }  
}

EffectController.toString = () => '[class EffectController]';
module.exports = EffectController;  