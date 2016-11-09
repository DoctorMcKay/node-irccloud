var IRCCloud = require('../index.js');

IRCCloud.prototype.join = function(connection, channel, key, callback) {
	if (typeof key === 'function') {
		callback = key;
		key = undefined;
	}

	if (typeof connection === 'object') {
		connection = connection.cid;
	}

	if (isNaN(connection)) {
		throw new Error("connection must be either an object with a cid property or a numeric connection ID");
	}

	this._send("join", {"cid": connection, "channel": channel, "key": key}, callback);
};

IRCCloud.prototype.part = function(connection, channel, msg, callback) {
	if (typeof msg === 'function') {
		callback = msg;
		msg = undefined;
	}

	if (typeof connection === 'object') {
		connection = connection.cid;
	}

	if (isNaN(connection)) {
		throw new Error("connection must be either an object with a cid property or a numeric connection ID");
	}

	this._send("part", {"cid": connection, "channel": channel, "msg": msg}, callback);
};

IRCCloud.prototype.message = function(connection, recipient, message, callback) {
	if (typeof connection === 'object') {
		connection = connection.cid;
	}

	if (isNaN(connection)) {
		throw new Error("connection must be either an object with a cid property or a numeric connection ID");
	}

	if (typeof recipient === 'object') {
		recipient = recipient.nick || recipient.name;
	}

	if (typeof recipient !== 'string') {
		throw new Error("recipient must be either an object with a name property or a recipient string (channel name or PM nick)");
	}

	this._send("say", {"cid": connection, "to": recipient, "msg": message}, callback);
};

IRCCloud.prototype.action = function(connection, recipient, message, callback) {
	this.message(connection, recipient, "/me " + message, callback);
};

IRCCloud.prototype.topic = function(buffer, topic, callback) {
	if (!buffer.cid || !buffer.bid) {
		throw new Error("Buffer must have cid and bid properties");
	}

	// valid buffer?
	var buf = this.connections[buffer.cid].buffers[buffer.bid];
	if (!buf) {
		throw new Error(`Buffer ${cid} ${bid} is not valid`);
	}

	this._send("topic", {"cid": buffer.cid, "channel": buffer.name, "topic": topic}, callback);
};

// Handlers

var handlers = IRCCloud.prototype._handlers;

handlers['channel_mode'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];

	if (!this._loadingBacklog) {
		this.emit('mode', buffer, body.ops, body.newmode, {
			"user": body.from_name,
			"nick": body.from,
			"host": body.from_host,
			"hostmask": body.hostmask
		});
	}

	buffer.mode = body.newmode;
};

handlers['user_channel_mode'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];

	if (!this._loadingBacklog) {
		this.emit('userMode', buffer, {
			"user": body.target_name,
			"nick": body.nick,
			"host": body.target_host,
			"hostmask": body.target_hostmask
		}, body.ops, body.newmode, {
			"user": body.from_name,
			"nick": body.from,
			"host": body.from_host,
			"hostmask": body.hostmask
		});
	}

	for (var i = 0; i < buffer.users.length; i++) {
		if (buffer.users[i].nick == body.nick) {
			buffer.users[i].mode = body.newmode;
		}
	}
};

handlers['channel_mode_is'] = function(body) {
	// Update the channel mode locally, but hasn't necessarily been updated remotely
	var buffer = this.connections[body.cid].buffers[body.bid];
	buffer.mode = body.newmode;
};

handlers['channel_timestamp'] = function(body) {
	this.connections[body.cid].buffers[body.bid].channelCreated = new Date(body.timestamp * 1000);
};

handlers['channel_topic'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];

	if (!this._loadingBacklog) {
		this.emit('topic', buffer, buildHostObject(body), body.topic, new Date(body.topic_time * 1000));
	}

	if (!body.topic) {
		buffer.topic = null;
	} else {
		buffer.topic = {
			"text": body.topic,
			"time": new Date(body.topic_time * 1000),
			"nick": body.author,
			"user": body.from_name,
			"host": body.from_host,
			"hostmask": body.hostmask
		};
	}
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

handlers['parted_channel'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];

	if (!this._loadingBacklog) {
		this.emit('part', buffer, buildHostObject(body), body.msg);
	}

	removeFromBuffer(buffer, body.nick);
};

handlers['you_parted_channel'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];

	if (!this._loadingBacklog) {
		this.emit('youPart', buffer, body.msg);
	}

	buffer.users = [];
	buffer.initialized = false;
	buffer.topic = null;
};

handlers['kicked_channel'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];

	if (!this._loadingBacklog) {
		this.emit('kick', buffer, buildHostObject(body), body.msg, {
			"nick": body.kicker,
			"user": body.kicker_name,
			"host": body.kicker_host,
			"hostmask": body.kicker_hostmask
		});
	}

	removeFromBuffer(buffer, body.nick);
};

handlers['you_kicked_channel'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];

	if (!this._loadingBacklog) {
		this.emit('youKick', buffer, body.msg, {
			"nick": body.kicker,
			"user": body.kicker_name,
			"host": body.kicker_host,
			"hostmask": body.kicker_hostmask
		});
	}

	buffer.users = [];
	buffer.initialized = false;
	buffer.topic = null;
};

handlers['quit'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];

	if (!this._loadingBacklog) {
		this.emit('quit', buffer, buildHostObject(body), body.msg);
	}

	removeFromBuffer(buffer, body.nick);
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

handlers['buffer_msg'] = handlers['buffer_me_msg'] = function(body) {
	if (this._loadingBacklog) {
		// we don't care as we don't actually store any backlog
		return;
	}

	var buffer = this.connections[body.cid].buffers[body.bid];
	var suffix = body.from == this.connections[body.cid].nick ? 'Echo' : '';
	this.emit((body.type == 'buffer_msg' ? 'message' : 'action') + suffix, buffer, buildHostObject(body), body.msg, !!body.highlight);

	if (body.highlight) {
		this.emit('highlight', buffer, buildHostObject(body), body.msg);
	}
};

handlers['notice'] = function(body) {
	if (this._loadingBacklog) {
		// we don't care as we don't actually store any backlog
		return;
	}

	var buffer = this.connections[body.cid].buffers[body.bid];
	var suffix = body.from == this.connections[body.cid].nick ? 'Echo' : '';
	this.emit('notice' + suffix, buffer, buildHostObject(body), body.msg, body.target);
};

handlers['nickchange'] = function(body) {
	if (this._loadingBacklog) {
		return;
	}

	var buffer = this.connections[body.cid].buffers[body.bid];
	this.emit('nick', buffer, body.oldnick, body.newnick);

	for (var i = 0; i < buffer.users.length; i++) {
		if (buffer.users[i].nick == body.oldnick) {
			buffer.users[i].nick = body.newnick;
			break;
		}
	}
};

handlers['you_nickchange'] = function(body) {
	if (this._loadingBacklog) {
		return;
	}

	this.emit('youNick', body.oldnick, body.newnick);

	var buffers = this.connections[body.cid].buffers;
	var bid, i;
	for (bid in buffers) {
		if (buffers.hasOwnProperty(bid)) {
			for (i = 0; i < buffers[bid].users.length; i++) {
				if (buffers[bid].users[i].nick == body.oldnick) {
					buffers[bid].users[i].nick = body.newnick;
					break;
				}
			}
		}
	}

	this.connections[body.cid].nick = body.newnick;
};

handlers['rename_conversation'] = function(body) {
	if (this._loadingBacklog) {
		return;
	}

	var buffer = this.connections[body.cid].buffers[body.bid];
	this.emit('conversationRenamed', buffer, body.new_name);

	buffer.name = body.new_name;
};

handlers['chan_privs_needed'] = function(body) {
	if (this._loadingBacklog) {
		return;
	}

	var buffer = this.connections[body.cid].buffers[body.bid];
	this.emit('accessDenied', buffer, body.chan, body.msg);
};

function buildHostObject(body) {
	return {
		"user": body.from_name,
		"nick": body.nick || body.from || body.author,
		"host": body.from_host,
		"hostmask": body.hostmask
	};
}

function removeFromBuffer(buffer, nick) {
	if (buffer.buffer_type != 'channel') {
		return;
	}

	for (var i = 0; i < buffer.users.length; i++) {
		if (buffer.users[i].nick == nick) {
			buffer.users.splice(i, 1);
		}
	}
}
