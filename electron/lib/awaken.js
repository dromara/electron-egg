'use strict';

const { app } = require('electron');
const config = require('../config');
const eLogger = require('./eLogger').get();

/**
 * 唤起Electron应用
 */
exports.setup = function () {
	const protocolInfo = config.get('awakeProtocol');
	const PROTOCOL = protocolInfo.protocol;

	// 唤醒的协议详情，开发者可根据所带参数，开发额外功能
	let awakeUrlInfo = {}

	app.setAsDefaultProtocolClient(PROTOCOL);

	handleArgv(process.argv);

	app.on('second-instance', (event, argv) => {
			if (process.platform === 'win32') {
					handleArgv(argv)
			}
	})

	// 仅用于macOS
	app.on('open-url', (event, urlStr) => {
			handleUrl(urlStr)
	})

	// 参数处理
	function handleArgv(argv) {
		const offset = app.isPackaged ? 1 : 2;
		const url = argv.find((arg, i) => i >= offset && arg.startsWith(PROTOCOL));
		handleUrl(url)
	}

	// url解析
	function handleUrl(awakeUrlStr) {
		eLogger.info('[awaken] [handleUrl] url:', awakeUrlStr);
		if (!awakeUrlStr || awakeUrlStr.length === 0) {
			return
		}
		const {hostname, pathname, search} = new URL(awakeUrlStr);
		awakeUrlInfo = {
				urlStr: awakeUrlStr,
				urlHost: hostname,
				urlPath: pathname,
				urlParams: search && search.slice(1)
		}
		eLogger.info('[awaken] [handleUrl] awakeUrlInfo:', awakeUrlInfo);
	}
}

exports = module.exports;