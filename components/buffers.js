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
	for (var i in this.connections) {
		if (this.connections.hasOwnProperty(i) && this.connections[i].name == networkName) {
			for (var j in this.connections[i].buffers) {
				if (this.connections[i].buffers.hasOwnProperty(j) && this.connections[i].buffers[j].name == bufferName) {
					return this.connections[i].buffers[j];
				}
			}
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
	var buffer = this.connections[body.cid].buffers[body.bid];
	this.emit('deleted', buffer);
	delete this.connections[body.cid].buffers[body.bid];
};
