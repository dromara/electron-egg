'use strict';
const net = require('net');
const os = require('os');

class Locked extends Error {
	constructor(port) {
		super(`${port} is locked`);
	}
}

const lockedPorts = {
	old: new Set(),
	young: new Set()
};

// On this interval, the old locked ports are discarded,
// the young locked ports are moved to old locked ports,
// and a new young set for locked ports are created.
const releaseOldLockedPortsIntervalMs = 1000 * 15;

// Lazily create interval on first use
let interval;

const getLocalHosts = () => {
	const interfaces = os.networkInterfaces();

	// Add undefined value for createServer function to use default host,
	// and default IPv4 host in case createServer defaults to IPv6.
	const results = new Set([undefined, '0.0.0.0']);

	for (const _interface of Object.values(interfaces)) {
		for (const config of _interface) {
			results.add(config.address);
		}
	}

	return results;
};

const checkAvailablePort = options =>
	new Promise((resolve, reject) => {
		const server = net.createServer();
		server.unref();
		server.on('error', reject);

		server.listen(options, () => {
			const {port} = server.address();
			server.close(() => {
				resolve(port);
			});
		});
	});

const getAvailablePort = async (options, hosts) => {
	if (options.host || options.port === 0) {
		return checkAvailablePort(options);
	}

	for (const host of hosts) {
		try {
			await checkAvailablePort({port: options.port, host}); // eslint-disable-line no-await-in-loop
		} catch (error) {
			if (!['EADDRNOTAVAIL', 'EINVAL'].includes(error.code)) {
				throw error;
			}
		}
	}

	return options.port;
};

const portCheckSequence = function * (ports) {
	if (ports) {
		yield * ports;
	}

	yield 0; // Fall back to 0 if anything else failed
};

async function getPort(options) {
	let ports;

	if (options) {
		ports = typeof options.port === 'number' ? [options.port] : options.port;
	}

	if (interval === undefined) {
		interval = setInterval(() => {
			lockedPorts.old = lockedPorts.young;
			lockedPorts.young = new Set();
		}, releaseOldLockedPortsIntervalMs);

		// Does not exist in some environments (Electron, Jest jsdom env, browser, etc).
		if (interval.unref) {
			interval.unref();
		}
	}

	const hosts = getLocalHosts();

	for (const port of portCheckSequence(ports)) {
		try {
			let availablePort = await getAvailablePort({...options, port}, hosts); // eslint-disable-line no-await-in-loop
			while (lockedPorts.old.has(availablePort) || lockedPorts.young.has(availablePort)) {
				if (port !== 0) {
					throw new Locked(port);
				}

				availablePort = await getAvailablePort({...options, port}, hosts); // eslint-disable-line no-await-in-loop
			}

			lockedPorts.young.add(availablePort);
			return availablePort;
		} catch (error) {
			if (!['EADDRINUSE', 'EACCES'].includes(error.code) && !(error instanceof Locked)) {
				throw error;
			}
		}
	}

	throw new Error('No available ports found');
};

module.exports = {
	getPort
}