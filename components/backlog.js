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
		buffer.topic = body.topic;
	}

	if (body.timestamp) {
		buffer.channelCreated = new Date(body.timestamp * 1000);
	}
};
