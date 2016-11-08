module.exports = IRCCloud;

require('util').inherits(IRCCloud, require('events').EventEmitter);

function IRCCloud() {
	this.connected = false;
	this.uid = null;
	this.connections = {};

	this._callbacks = {};
	this._reqNum = 0;
	this._sessionToken = null;
	this._ws = null;
	this._paused = false;
	this._msgQueue = [];
	this._lastEid = 0;
	this._loadingBacklog = false;
}

require('./components/irccloud-protocol.js');
require('./components/auth.js');
require('./components/websocket.js');
require('./components/oob.js');
require('./components/backlog.js');
require('./components/channels.js');
