var IRCCloud = require('../index.js');
var Https = require('../util/https_client');

IRCCloud.prototype.connect = function(username, password) {
	if (!username || !password) {
		throw new Error("Username and password are required");
	}

	// Get our form token
	Https.post("https://www.irccloud.com/chat/auth-formtoken", (err, res) => {
		if (err) {
			this.emit('error', err);
			return;
		}

		try {
			res = JSON.parse(res);
		} catch (ex) {
			this.emit('error', new Error("Cannot get auth formtoken: " + ex.message));
			return;
		}

		if (!res.success || !res.token) {
			this.emit('error', new Error("Bad response from IRCCloud when retrieving token"));
			return;
		}

		console.log(res.token);
		// TODO
	});
};
