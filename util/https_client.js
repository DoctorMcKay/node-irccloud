var Https = require('https');
var QueryString = require('querystring');
var Url = require('url');
var Zlib = require('zlib');

exports.get = function(url, qs, callback) {
	if (typeof qs === 'function') {
		callback = qs;
		qs = {};
	}

	url = Url.parse(url);

	qs = QueryString.stringify(qs);
	if (qs) {
		url.path += (url.path.indexOf('?') == -1) ? '?' : '&';
		url.path += qs;
	}

	Https.get({
		"hostname": url.hostname,
		"port": url.port || 443,
		"protocol": "https:",
		"path": url.path,
		"headers": {
			"Accept-Encoding": "gzip"
		}
	}, (res) => {
		if (res.statusCode < 200 || res.statusCode >= 300) {
			// Anything not in 2xx is failure
			callback(new Error("HTTP error " + res.statusCode));
			return;
		}

		var stream = res;

		if (res.headers['content-encoding'] && res.headers['content-encoding'].toLowerCase() == 'gzip') {
			stream = Zlib.createGunzip();
			res.pipe(stream);
		}

		var response = "";

		stream.on('data', (chunk) => {
			response += chunk;
		});

		stream.on('end', () => {
			callback(null, response);
		});
	}).on('error', (err) => {
		callback(err);
	});
};
