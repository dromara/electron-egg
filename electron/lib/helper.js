'use strict';

const { app } = require('electron');

/**
 * application quit
 * @return {undefined}
 */
exports.appQuit = function () {
	MAIN_WINDOW.destroy();
	app.quit();
}