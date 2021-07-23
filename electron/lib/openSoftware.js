const { app } = require('electron');

class OpenSoftware {
	constructor () {
		if (typeof this.instance === 'object') {
			return this.instance;
		}
	}
  test () {
    
    return true;
  }
}

module.exports = OpenSoftware;