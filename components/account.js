var IRCCloud = require('../index.js');

var handlers = IRCCloud.prototype._handlers;

handlers['stat_user'] = function(body) {
	delete body.bid;
	delete body.eid;
	delete body.type;

	body.join_date = new Date(body.join_date * 1000);
	this.emit('accountDetails', body);
	this.accountDetails = body;
};
