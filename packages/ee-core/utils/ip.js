const { promisify } = require('util');
const dgram = require('dgram');
const { isIPv6, isIPv4 } = require('net');
const dns = require('dns-socket');
const HttpClient = require('../httpclient');

const emptyIP = '';
const defaults = {
	timeout: 3000,
	type: 'http', // 'http' | 'dns' | 'all'
};

const dnsServers = [
	{
		v4: {
			servers: [
				'208.67.222.222',
				'208.67.220.220',
				'208.67.222.220',
				'208.67.220.222',
			],
			name: 'myip.opendns.com',
			type: 'A',
		},
		v6: {
			servers: [
				'2620:0:ccc::2',
				'2620:0:ccd::2',
			],
			name: 'myip.opendns.com',
			type: 'AAAA',
		},
	},
];

const type = {
	v4: {
		dnsServers: dnsServers.map(({v4: {servers, ...question}}) => ({
			servers, question,
		})),
		httpsUrls: [
			'https://icanhazip.com/',
			'https://api.ipify.org/',
		],
	},
	v6: {
		dnsServers: dnsServers.map(({v6: {servers, ...question}}) => ({
			servers, question,
		})),
		httpsUrls: [
			'https://icanhazip.com/',
			'https://api6.ipify.org/',
		],
	},
};

const queryDns = (version, options) => {
	const data = type[version];
	const socket = dns({
		retries: 0,
		maxQueries: 1,
		socket: dgram.createSocket(version === 'v6' ? 'udp6' : 'udp4'),
		timeout: options.timeout,
	});

	const socketQuery = promisify(socket.query.bind(socket));
	const promise = (async () => {
		for (const dnsServerInfo of data.dnsServers) {
			const {servers, question} = dnsServerInfo;
			for (const server of servers) {
				if (socket.destroyed) {
					return emptyIP;
				}

				try {
					const {name, type, transform} = question;
					const dnsResponse = await socketQuery({questions: [{name, type}]}, 53, server);

					const {
						answers: {
							0: {
								data,
							},
						},
					} = dnsResponse;
					const response = (typeof data === 'string' ? data : data.toString()).trim();
          const ip = (transform && version === 'v6') ? transform(response) : response;
					const method = version === 'v6' ? isIPv6 : isIPv4;

					if (ip && method(ip)) {
						socket.destroy();
						return ip;
					}
				} catch (error) {
					// Log.coreLogger.error('[ee-core] [utils/ip] queryDns error:', error);
				}
			}
		}

		socket.destroy();
		return emptyIP;
	})();

	promise.cancel = () => {
		socket.destroy();
	};

	return promise;
};

const queryHttps = (version, options) => {
	let cancel;
  const hc = new HttpClient();

	const promise = (async () => {
		const requestOptions = {
			method: 'GET',
			timeout: options.timeout,
			dataType: 'text',
		};

		const urls = [
			...type[version].httpsUrls,
			...(options.fallbackUrls ?? []),
		];

		for (const url of urls) {
			try {
				const gotPromise = hc.request(url, requestOptions);
				gotPromise.cancel = () => {
					// ..
				}
				cancel = gotPromise.cancel;

				const response = await gotPromise;
				let result = response.status == 200 ? response.data : '';
				const ip = result.trim();

				const method = version === 'v6' ? isIPv6 : isIPv4;

				if (ip && method(ip)) {
					return ip;
				}
			} catch (error) {
				//Log.coreLogger.error('[ee-core] [utils/ip] queryHttps error:', error);
			}
		}

		return emptyIP;
	})();

	promise.cancel = function () {
		return cancel.apply(this);
	};

	return promise;
};

const queryAll = (version, options) => {
	let cancel;
	const promise = (async () => {
		let response;
		const dnsPromise = queryDns(version, options);
		cancel = dnsPromise.cancel;
		try {
			response = await dnsPromise;
		} catch {
			const httpsPromise = queryHttps(version, options);
			cancel = httpsPromise.cancel;
			response = await httpsPromise;
		}

		return response;
	})();

	promise.cancel = cancel;

	return promise;
};

// 查询 public ipv4  
function publicIpv4(options) {
  options = {
    ...defaults,
    ...options,
  };

  if (options.type == 'http') {
    return queryHttps('v4', options);
  }	
	
  if (options.type == 'dns') {
    return queryDns('v4', options);
  }

  return queryAll('v4', options);
}

// 查询public ipv6 
function publicIpv6(options) {
  options = {
    ...defaults,
    ...options,
  };

  if (options.type == 'http') {
    return queryHttps('v6', options);
  }	
	
  if (options.type == 'dns') {
    return queryDns('v6', options);
  }

  return queryAll('v6', options);
}

module.exports = {
  publicIpv4,
  publicIpv6
};

