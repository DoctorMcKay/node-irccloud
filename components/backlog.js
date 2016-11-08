var IRCCloud = require('../index.js');

var handlers = IRCCloud.prototype._handlers;

handlers['backlog_starts'] = function(body) {
	this._loadingBacklog = true;
};

handlers['backlog_complete'] = function(body) {
	this._loadingBacklog = false;
	this.emit('loaded');
};

handlers['makeserver'] = function(body) {
	body.buffers = {};

	delete body.bid;
	delete body.eid;
	delete body.type;
	delete body.num_buffers;
	delete body.deferred_archives;
	delete body.disconnected;

	this.connections[body.cid] = body;
};

handlers['makebuffer'] = function(body) {
	body.users = [];

	delete body.eid;
	delete body.type;
	delete body.backlog_size;
	delete body.max_backlog_size;

	body.created = new Date(Math.floor(body.created / 1000));

	this.connections[body.cid].buffers[body.bid] = body;
};

handlers['channel_init'] = function(body) {
	var buffer = this.connections[body.cid].buffers[body.bid];
	if (body.members) {
		buffer.users = body.members.map(member => ({"user": member.user, "nick": member.nick, "host": member.userhost, "hostmask": member.usermask, "mode": member.mode}));
	}

	if (body.mode) {
		buffer.mode = body.mode;
	}

	if (body.topic) {
		if (body.topic.text) {
			buffer.topic = body.topic;
			buffer.topic.time = new Date(buffer.topic.time * 1000);
		} else {
			buffer.topic = null;
		}
	}

	if (body.timestamp) {
		buffer.channelCreated = new Date(body.timestamp * 1000);
	}
};
