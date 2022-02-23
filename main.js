const Appliaction = require('ee-core').Appliaction;

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

  }

  startEggCluster (options) {
    return new Promise((resolve, reject) => {
      this.coreLogger.info('[ee-core:EeApp] [startEggCluster] op', options);
      const startCluster = require('egg-cluster').startCluster;
      startCluster(options, function(){
        resolve('success');
      });
    });
  }

  /**
   * before app close
   */  
  async beforeClose () {
    // do some things

  }
}



new Main();
 
