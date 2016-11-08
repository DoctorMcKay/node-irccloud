var IRCCloud = require('../index.js');
var Https = require('../util/https_client');

IRCCloud.prototype.connect = function(email, password) {
	if (!email || !password) {
		throw new Error("Email and password are required");
	}

	// Get our form token
	Https.post("https://www.irccloud.com/chat/auth-formtoken", (err, res) => {
		if (err) {
			this.emit('error', err);
			return;
		}

		if (!res.success || !res.token) {
			this.emit('error', new Error("Bad response from IRCCloud when retrieving token"));
			return;
		}

		this.emit('debug', `Got login auth-formtoken: ${res.token}`);
		Https.post("https://www.irccloud.com/chat/login", {"email": email, "password": password, "token": res.token}, (err, res) => {
			if (err) {
				if (res && res.message == "auth") {
					this.emit('error', new Error("Incorrect email address or password"));
					return;
				}

				this.emit('error', err);
				return;
			}

			// Logged in?

			if (!res.success || !res.session || !res.uid) {
				this.emit('error', "Unsuccessful response from IRCCloud when logging in");
				return;
			}

			console.log(res);
			this.uid = res.uid;
			this._sessionToken = res.session;
			this._connect();
		});
	});
};
