'use strict';

const is = require('electron-is');
const { app } = require('electron');

/**
 * application quit
 * 
 * @return {undefined}
 */
exports.appQuit = function () {
	MAIN_WINDOW.destroy();
	app.quit();
}

/**
 * get Platform
 * 
 * @return {Object}
 */
exports.getPlatform = function () {
	let platform = null;
	let arch = null;
	if (is.windows()) {
		platform = 'windows';
	} else if (is.macOS()) {
		platform = 'macOS';
	} else if (is.linux()) {
		platform = 'linux';
	} else {
		platform = 'other';
	}

	if (is.x86()) {
		arch = '32';
	} else if (is.x64()) {
		arch = '64';
	} else if (process.arch == 'arm') {
		arch = 'arm32';
	} else if (process.arch == 'arm64') {
		arch = 'arm64';
	} else {
		arch = 'other';
	}

	const platfromObj = {
		platform: platform,
		arch: arch
	};

	return platfromObj;
}