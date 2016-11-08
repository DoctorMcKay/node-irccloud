var IRCCloud = require('../index.js');
var WS13 = require('websocket13');

IRCCloud.prototype._handlers = {};

IRCCloud.prototype._processMsg = function(strData) {
	var data;
	try {
		data = JSON.parse(strData);
	} catch (ex) {
		this.emit('debug', "Got malformed JSON for message: " + strData);
		return;
	}

	if (!data.type) {
		this.emit('debug', "Got message without a type: " + strData);
		return;
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
