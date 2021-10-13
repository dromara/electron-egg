'use strict';

const helper = require('./helper');
const eLogger = require('./eLogger').get();

/**
 * 安装模块
 */
exports.setup = function () {
	console.log('[electron-lib-security] [setup]');
	const runWithDebug = process.argv.find(function(e){
		let isHasDebug = e.includes("--inspect") || e.includes("--inspect-brk") || e.includes("--remote-debugging-port");
		return isHasDebug;
	})

	if (runWithDebug) {
		eLogger.info('[security] [setup] runWithDebug:', runWithDebug);
    helper.appQuit();
	}
}

exports = module.exports;