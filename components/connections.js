var IRCCloud = require('../index.js');

IRCCloud.prototype.getConnection = function(networkName) {
	for (var i in this.connections) {
		if (this.connections.hasOwnProperty(i) && this.connections[i].name == networkName) {
			return this.connections[i];
		}
	}

	return null;
};

// Handlers

var handlers = IRCCloud.prototype._handlers;

handlers['status_changed'] = function(body) {
	var conn = this.connections[body.cid];

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

	this.emit('serverChanged', conn, body);

	this.connections[body.cid] = body;
};
