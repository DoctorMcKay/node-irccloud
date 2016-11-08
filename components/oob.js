var IRCCloud = require('../index.js');
var Https = require('../util/https_client.js');

IRCCloud.prototype._handlers['oob_include'] = function(body) {
	this.emit('debug', `Handling oob_include (expires in ${body.timeout} ms)`);
	this._setPause(true);

	Https.getAuthed("https://www.irccloud.com" + body.url, this._sessionToken, (err, res) => {
		if (err) {
			this.emit('error', err);
			this.disconnect();
			return;
		}

		if (!(res instanceof Array)) {
			this.emit('error', new Error("Got malformed out-of-band include"));
			this.disconnect();
			return;
		}

		res.forEach(this._processMsg.bind(this));
		this._setPause(false);
	});
};
