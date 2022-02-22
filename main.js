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

  /**
   * before app close
   */  
  async beforeClose () {
    // do some things

  }
}

new Main();
 
