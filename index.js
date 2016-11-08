module.exports = IRCCloud;

require('util').inherits(IRCCloud, require('events').EventEmitter);

function IRCCloud() {

}

require('./components/auth.js');
