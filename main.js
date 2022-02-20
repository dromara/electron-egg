const Appliaction = require('ee-core').Appliaction;
const { app } = require('electron');

class Main extends Appliaction {

  constructor() {
    super();
  }

  /**
   * core app have been loaded
   */
  async ready () {
    // do some things
  }

  /**
   * main window have been loaded
   */
  async windowReady () {
    // do some things

    // const app = this;
    // // preload预加载模块
    // const preload = require('./electron/preload');
    // preload(app);

  }

  /**
   * before app close
   */  
  async beforeClose () {
    // do some things

  }
}

new Main();


 

 