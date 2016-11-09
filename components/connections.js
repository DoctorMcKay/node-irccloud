var IRCCloud = require('../index.js');

IRCCloud.prototype.getConnection = function(networkName) {
	networkName = networkName.toLowerCase();

	for (var i in this.connections) {
		if (this.connections.hasOwnProperty(i) && (this.connections[i].name.toLowerCase() == networkName || this.connections[i].hostname.toLowerCase() == networkName)) {
			return this.connections[i];
		}
	}

	return null;
};

IRCCloud.prototype.createConnection = function(options, callback) {
	if (['hostname', 'nick'].some(entry => !options[entry])) {
		throw new Error("To add a new connection, at least hostname and nick are required");
	}

	this._send("add-server", {
		"hostname": options.hostname,
		"port": options.port || 6667,
		"ssl": options.ssl ? "1" : "0",
		"nickname": options.nick,
		"realname": options.realName || "",
		"channels": options.channels ? options.channels.join(',') : "",
		"joincommands": options.joinCommands ? options.joinCommands.join("\n") : "",
		"nspass": options.nickservPassword || "",
		"server_pass": options.serverPassword || "",
	}, callback);
};

IRCCloud.prototype.reconnectConnection = function(connection, callback) {
	if (typeof connection === 'object') {
		connection = connection.cid;
	}

	if (isNaN(connection)) {
		throw new Error("connection must be an object with a cid property or a numeric connection ID");
	}

	this._send("reconnect", {"cid": connection}, callback);
};

IRCCloud.prototype.disconnectConnection = function(connection, msg, callback) {
	if (typeof msg === 'function') {
		callback = msg;
		msg = undefined;
	}

	if (typeof connection === 'object') {
		connection = connection.cid;
	}

	if (isNaN(connection)) {
		throw new Error("connection must be an object with a cid property or a numeric connection ID");
	}

	this._send("disconnect", {"cid": connection, "msg": msg}, callback);
};

IRCCloud.prototype.deleteConnection = function(connection, callback) {
	if (typeof connection === 'object') {
		connection = connection.cid;
	}

	if (isNaN(connection)) {
		throw new Error("connection must be an object with a cid property or a numeric connection ID");
	}

	this._send("delete-connection", {"cid": connection}, callback);
};

// Handlers

var handlers = IRCCloud.prototype._handlers;

handlers['status_changed'] = function(body) {
	var conn = this.connections[body.cid];

	if (body.fail_info && body.fail_info.timestamp) {
		body.fail_info.timestamp = new Date(body.fail_info.timestamp * 1000);
	}

	this.emit('connectionStatus', conn, body.new_status, body.fail_info);

	conn.status = body.new_status;
	conn.fail_info = body.fail_info;
};

handlers['server_details_changed'] = function(body) {
	var conn = this.connections[body.cid];

	var i;
	for (i in body) {
		if (body.hasOwnProperty(i) && !conn[i]) {
			delete body[i];
		}
	}

	for (i in conn) {
		if (conn.hasOwnProperty(i) && !body[i]) {
			body[i] = conn[i];
		}
	}

	this.emit('connectionChanged', conn, body);

	this.connections[body.cid] = body;
};

handlers['connection_deleted'] = function(body) {
	var conn = this.connections[body.cid];
	if (!conn) {
		return;
	}

	this.emit('connectionDeleted', conn);

	delete this.connections[body.cid];
};
