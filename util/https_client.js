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

	request({"method": "GET", "hostname": url.hostname, "port": url.port || 443, "path": url.path}, callback);
};

exports.getAuthed = function(url, session, qs, callback) {
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

	request({"method": "GET", "hostname": url.hostname, "port": url.port || 443, "path": url.path, "session": session}, callback);
};

exports.post = function(url, body, callback) {
	if (typeof body === 'function') {
		callback = body;
		body = null;
	}

	url = Url.parse(url);
	request({"method": "POST", "hostname": url.hostname, "port": url.port || 443, "path": url.path, "body": body || null}, callback);
};

function request(opts, callback) {
	opts.protocol = "https:";
	opts.headers = opts.headers || {};
	opts.headers['Accept-Encoding'] = 'gzip';

	if (opts.session) {
		opts.headers['Cookie'] = 'session=' + encodeURIComponent(opts.session);
		delete opts.session;
	}

	if (opts.method.toUpperCase() == 'POST') {
		if (typeof opts.body === 'object' && opts.body !== null) {
			if (opts.body.token) {
				opts.headers['X-Auth-FormToken'] = opts.body.token;
			}

			opts.body = QueryString.stringify(opts.body);
		}

		opts.headers['Content-Length'] = opts.body ? Buffer.byteLength(opts.body) : 0;

		if (opts.headers['Content-Length'] > 0) {
			opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
		}
	}

	var req = Https.request(opts, (res) => {
		var err = null;

		if (res.statusCode < 200 || res.statusCode >= 300) {
			// Anything not in 2xx is failure
			err = new Error("HTTP error " + res.statusCode);
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
			if (res.headers['content-type'] && res.headers['content-type'].toLowerCase() == 'application/json') {
				try {
					response = JSON.parse(response);
				} catch (ex) {
					callback(new Error("Malformed JSON response"));
					return;
				}
			}

			callback(err, response);
		});
	});

	req.on('error', (err) => {
		callback(err);
	});

	req.end(opts.body);
}
