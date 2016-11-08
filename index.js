module.exports = IRCCloud;

require('util').inherits(IRCCloud, require('events').EventEmitter);

function IRCCloud() {
	this.connected = false;
	this.uid = null;

	this._callbacks = {};
	this._reqNum = 0;
	this._sessionToken = null;
	this._ws = null;
	this._paused = false;
	this._msgQueue = [];
}

require('./components/irccloud-protocol.js');
require('./components/auth.js');
require('./components/websocket.js');
