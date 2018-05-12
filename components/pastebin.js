var IRCCloud = require('../index.js');

IRCCloud.prototype.paste = function(options, callback) {
	if (!options.contents) {
		throw new Error("You must supply \"contents\" for your paste");
	}

	this._send("paste", options, callback);
};
