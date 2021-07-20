'use strict';

const { crashReporter } = require('electron');
const config = require('../config');

exports.setup = function () {
	const options = config.get('crashReport');
    crashReporter.start(options);
}