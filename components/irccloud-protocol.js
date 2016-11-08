var IRCCloud = require('../index.js');
var WS13 = require('websocket13');

IRCCloud.prototype._handlers = {};

IRCCloud.prototype._processMsg = function(data) {
	if (typeof data === 'string') {
		try {
			data = JSON.parse(data);
		} catch (ex) {
			this.emit('debug', "Got malformed JSON for message: " + data);
			return;
		}
	}

	if (data._reqid) {
		// Response to an RPC command
		if (this._callbacks[data._reqid]) {
			this._callbacks[data._reqid].call(this, data);
			delete this._callbacks[data._reqid];
		}

		return;
	}

	if (!data.type) {
		this.emit('debug', "Got message without a type: " + data);
		return;
	}

	if (data.eid && data.eid > this._lastEid) {
		this._lastEid = data.eid;
	}

	if (!this._handlers[data.type]) {
		this.emit('debug', "Unhandled message " + data.type);
		return;
	}

	this._handlers[data.type].call(this, data);
};

IRCCloud.prototype._send = function(method, data, callback) {
	if (!this.connected || !this._ws || this._ws.state != WS13.State.Connected) {
		this.emit('debug', `Attempted to send ${method} while not connected`);
		return;
	}

	if (typeof data === 'function') {
		callback = data;
		data = {};
	} else if (!data) {
		data = {};
	}

	var reqId = ++this._reqNum;
	data._method = method;
	data._reqid = reqId;

	if (callback) {
		this._callbacks[reqId] = callback;
	}

	this.emit('debug', `Sending method ${method} (reqid ${reqId})`);
	this._ws.send(JSON.stringify(data));
};
