var IRCCloud = require('../index.js');

var WS13 = require('websocket13');

IRCCloud.prototype._connect = function() {
	if (!this._sessionToken) {
		throw new Error("Tried to connect without first having a session token");
	}

	if (this._ws && [WS13.State.Connecting, WS13.State.Connected].indexOf(this._ws.state) != -1) {
		throw new Error("Tried to connect while we're already connecting or connected");
	}

	this.emit('debug', 'connecting');
	this._ws = new WS13.WebSocket(this._wsUri, {
		"cookies": {"session": this._sessionToken},
		"headers": {"User-Agent": getUserAgent()},
		"pingInterval": 30000
	});

	this._ws.on('connected', (details) => {
		this.emit('debug', 'connected');
		this.emit('connect');
		this.connected = true;
	});

	this._ws.on('disconnected', (code, reason, initiatedByUs) => {
		this.emit('debug', `disconnected: ${code} (${reason})`);
		this.emit('disconnect', code, reason, initiatedByUs);
		this.connected = false;
		this._ws = null;
	});

	this._ws.on('error', (err) => {
		this.emit('error', err);
		this.emit('disconnect', WS13.StatusCode.NoStatusCode, err.message, false);
		this.connected = false;
		this._ws = null;
	});

	this._ws.on('message', (type, data) => {
		if (type != WS13.FrameType.Data.Text) {
			this.emit('debug', `Got unexpected data type ${type}`);
			return;
		}

		if (this._paused) {
			this._msgQueue.push(data);
		} else {
			this._processMsg(data);
		}
	});

	this._ws.on('latency', (pingTime) => {
		this.emit('latency', pingTime);
	});
};

IRCCloud.prototype._setPause = function(paused) {
	if (paused) {
		this.emit('debug', "Paused processing");
		this._paused = true;
	} else {
		this.emit('debug', "Unpaused processing; dealing with " + this._msgQueue.length + " queued messages");
		this._paused = false;
		this._msgQueue.forEach(this._processMsg.bind(this));
		this._msgQueue = [];
	}
};

IRCCloud.prototype.disconnect = function() {
	if (!this._ws) {
		this.emit('debug', "Attempted to disconnect without a websocket");
		return;
	}

	this._ws.disconnect(WS13.StatusCode.NormalClosure);
};

function getUserAgent() {
	var ua = "node.js/" + process.versions.node + " (" + process.platform + " " + require('os').release() + " " + require('os').arch() + ")";
	ua += " node-websocket13/" + require('websocket13/package.json').version;
	ua += " node-irccloud/" + require('../package.json').version;

	return ua;
}
