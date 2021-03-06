var IRCCloud = require('../index.js');

IRCCloud.prototype.setArchived = function(buffer, archived, callback) {
	if (!buffer.cid || !buffer.bid) {
		throw new Error("buffer must contain both cid and bid properties");
	}

	this._send(archived ? "archive-buffer" : "unarchive-buffer", {"cid": buffer.cid, "id": buffer.bid}, callback);
};

IRCCloud.prototype.deleteBuffer = function(buffer, callback) {
	if (!buffer.cid || !buffer.bid) {
		throw new Error("buffer must contain both cid and bid properties");
	}

	this._send("delete-buffer", {"cid": buffer.cid, "id": buffer.bid}, callback);
};

IRCCloud.prototype.getBuffer = function(networkName, bufferName) {
	var conn = this.getConnection(networkName);
	if (!conn) {
		return null;
	}

	bufferName = bufferName.toLowerCase();

	for (var i in conn.buffers) {
		if (conn.buffers.hasOwnProperty(i) && conn.buffers[i].name.toLowerCase() == bufferName) {
			return conn.buffers[i];
		}
	}

	return null;
};

// Handlers

var handlers = IRCCloud.prototype._handlers;

handlers['buffer_archived'] = handlers['buffer_unarchived'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];
	this.emit(body.type.split('_')[1], buffer);
	buffer.archived = body.type.split('_')[1] == 'archived';
};

handlers['delete_buffer'] = function(body) {
	if (!this.connections[body.cid]) {
		return; // possibly this is being deleted as part of a connection delete
	}

	var buffer = this.connections[body.cid].buffers[body.bid];
	this.emit('deleted', buffer);
	delete this.connections[body.cid].buffers[body.bid];
};

handlers['heartbeat_echo'] = function(body) {
	if (body.seenEids) {
		var cid, bid;
		for (cid in body.seenEids) {
			if (body.seenEids.hasOwnProperty(cid) && this.connections[cid]) {
				for (bid in body.seenEids[cid]) {
					if (body.seenEids[cid].hasOwnProperty(bid) && this.connections[cid].buffers[bid]) {
						this.connections[cid].buffers[bid].last_seen_eid = body.seenEids[cid][bid];
					}
				}
			}
		}
	}
};

handlers['unknown_command'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];
	this.emit('unknownCommand', buffer, body.command);
};
