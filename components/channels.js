var IRCCloud = require('../index.js');

var handlers = IRCCloud.prototype._handlers;

handlers['channel_mode'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];

	if (!this._loadingBacklog) {
		this.emit('mode', buffer, body.ops, body.newmode);
	}

	buffer.mode = body.newmode;
};

handlers['channel_mode_is'] = function(body) {
	// Update the channel mode locally, but hasn't necessarily been updated remotely
	var buffer = this.connections[body.cid].buffers[body.bid];
	buffer.mode = body.newmode;
};

handlers['channel_timestamp'] = function(body) {
	this.connections[body.cid].buffers[body.bid].channelCreated = new Date(body.timestamp * 1000);
};

handlers['you_joined_channel'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];

	if (!this._loadingBacklog) {
		this.emit('youJoin', buffer, buildHostObject(body));
	}

	// Already in the channel?
	if (!buffer.users.some(user => user.nick == body.nick)) {
		buffer.users.push(buildHostObject(body));
	}
};

handlers['joined_channel'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];

	if (!this._loadingBacklog) {
		this.emit('join', buffer, buildHostObject(body));
	}

	// Already in the channel?
	if (!buffer.users.some(user => user.nick == body.nick)) {
		buffer.users.push(buildHostObject(body));
	}
};

handlers['self_details'] = function(body) {
	var conn = this.connections[body.cid];
	var self = (conn.self = conn.self || {});

	self.user = body.user || self.user;
	self.nick = conn.nick;
	self.host = body.userhost || self.host;
	self.hostmask = body.usermask || self.hostmask;
	self.mode = self.mode || "";

	conn.self = self;
};

handlers['user_mode'] = function(body) {
	var conn = this.connections[body.cid];
	if (body.nick != body.nick) {
		return;
	}

	if (!this._loadingBacklog) {
		this.emit('youMode', conn, body.ops, body.newmode);
	}

	conn.self.mode = body.newmode;
};

function buildHostObject(body) {
	return {
		"user": body.from_name,
		"nick": body.nick,
		"host": body.from_host,
		"hostmask": body.hostmask
	};
}
