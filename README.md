# IRCCloud Client for Node.js

This is a client module for [IRCCloud](https://www.irccloud.com). It allows you to operate an IRC bot via IRCCloud.
You will need at least a free IRCCloud account to use this module. All normal IRCCloud limits apply if you haven't upgraded
your account.

This isn't quite complete just yet, so some things might be missing or the documentation might be a bit unclear at times.

# Methods

All post-connection methods take an optional callback. If provided, this will be called with a single object argument
when the method has been successfully executed by IRCCloud. This object will always have a boolean `success` property.

### connect(email, password)
- `email` - Your account's email address
- `password` - Your account's password

Start the process of logging in and connecting to IRCCloud. You will get a [`connect`](#connect) event once connected,
and [`loaded`](#loaded) once data is fully loaded.

### disconnect()

Disconnect an established connection.

### listConnections([getHostnames])
- `getHostnames` - true if you want to return hostnames (e.g. "chat.freenode.net") instead of network names (e.g. "freenode")

Returns an array containing the names or hostnames of all connections on your account. Should only be used after `loaded`
is emitted.

This method does not consult the network; it merely pulls data from memory therefore it returns the data immediately.

### getConnection(networkName)
- `networkName` - Either the name of the network (e.g. "freenode") or the hostname you connected to (e.g. "chat.freenode.net"), case-insensitive

Gets a connection object and returns it, if it exists. Returns `null` if no matching connection is found on your account.

This method does not consult the network; it merely pulls data from memory therefore it returns the data immediately.

### createConnection(options[, callback])
- `options` - An object containing all or some of these properties:
    - `hostname` - Required. The hostname of the server (either a domain name or an IP address)
    - `nick` - Required. Your desired nickname on this network.
    - `port` - Optional. The port number to connect to. Defaults to 6667.
    - `ssl` - Optional. `true` to use SSL, `false` or omitted to not.
    - `realName` - Optional. Your "real name" on the network, or empty if omitted.
    - `channels` - Optional. An array of channel names to auto-join on connection. Omit to not auto-join anything.
    - `joinCommands` - Optional. An array of commands to automatically execute on connection.
    - `nickservPassword` - Optional. Your NickServ password, if applicable.
    - `serverPassword` - Optional. The password to use to connect to the server, if applicable. You need a paid account for this.
- `callback` - Optional. In addition to the default `success` property, the response object also has `cid` which is the new connection's ID.

Creates a new IRC connection and connects to that server. You need a paid account to have more than 2 (in addition to irc.irccloud.com).

### reconnectConnection(connection[, callback])
- `connection` - Either a connection ID or an object with a `cid` property (e.g. a connection object)
- `callback` - Optional. Just the normal method callback.

Re-connects to an existing connection which has previously been disconnected.

### disconnectConnection(connection[, msg][, callback])
- `connection` - Either a connection ID or an object with a `cid` property (e.g. a connection object)
- `msg` - Optional. A quit message.
- `callback` - Optional. Just the normal method callback.

Disconnects and quits an IRC connection. The connection object will remain in your account which you can reconnect later
or delete.

### deleteConnection(connection[, callback])
- `connection` - Either a connection ID or an object with a `cid` property (e.g. a connection object)
- `callback` - Optional. Just the normal method callback.

Deletes a connection. This connection must be disconnected first.

### getBuffer(networkName, bufferName) {
- `networkName` - Either the name of the network (e.g. "freenode") or the hostname you connected to (e.g. "chat.freenode.net"), case-insensitive
- `bufferName` - The name of the buffer you're looking for (e.g. "#channel" or "somenick"), case-insensitive

Finds a buffer, if it exists, and returns its object. If not, returns `null`.

This method does not consult the network; it merely pulls data from memory therefore it returns the data immediately.

### setArchived(buffer, archived[, callback])
- `buffer` - A buffer object (or an object containing `cid` and `bid` properties)
- `archived` - `true` if you want to archive it, or `false` if you want to unarchive it
- `callback` - Optional. Just the normal method callback.

Archives or unarchives a buffer. If you're archiving a buffer for a channel you're in, this will part that channel.

### deleteBuffer(buffer[, callback])
- `buffer` - A buffer object (or an object containing `cid` and `bid` properties)
- `callback` - Optional. Just the normal method callback.

Deletes a buffer. If it's a buffer for a channel you're currently in, this will part it before deleting it.

### join(connection, channel[, key][, callback])
- `connection` - A connection object (or an object containing a `cid` property)
- `channel` - A **string** containing the name of the channel to join
- `key` - Optional. If you need a key to join this channel, provide it here as a string.
- `callback` - Optional. Just the normal method callback.

Join a channel. Listen for [`channelInit`](#channelinit) to know when you've successfully joined.

### part(connection, channel[, msg][, callback])
- `connection` - A connection object (or an object containing a `cid` property)
- `channel` - A **string** containing the name of the channel you want to leave
- `msg` - Optional. A part message to display to the rest of the channel
- `callback` - Optional. Just the normal method callback.

Leave a channel. Listen for `youPart` to know when you've successfully parted.

### message(connection, recipient, message[, callback])
- `connection` - A connection object (or an object containing a `cid` property)
- `recipient` - A **string** containing the name of the channel (or nick of the recipient if it's a PM) you're sending this message to
- `message` - The message text
- `callback` - Optional. Just the normal method callback.

Send a message to a recipient (either a channel or a nick to send a PM).

### action(connection, recipient, message[, callback])
- `connection` - A connection object (or an object containing a `cid` property)
- `recipient` - A **string** containing the name of the channel (or nick of the recipient if it's a PM) you're sending this message to
- `message` - The message text
- `callback` - Optional. Just the normal method callback.

Identical to the `message` method except prefixes the `message` with `/me `.

### topic(buffer, text[, callback])
- `buffer` - An object representing the buffer whose topic you want to change. Must have `cid` (connection ID) and `bid` (buffer ID) properties
- `text` - The new topic
- `callback` - Optional. Just the normal method callback.

Sets a channel's topic, provided you have permission to do so.

# Events

### error
- `err` - An Error object

Emitted when an error occurs either during connection (e.g. bad email or password) or if there's some kind of error
that drops our connection. This is always fatal to the connection.

### connect

Emitted after a WebSocket connection is successfully established to IRCCloud, but before any data is loaded.

### disconnect
- `code` - A WebSocket [status code](https://github.com/DoctorMcKay/node-websocket13/blob/073f5642722fe3daefa3d663556dd6c9a52563ac/lib/index.js#L24-L41)
- `reason` - A reason string for the disconnection (may be empty)
- `initiatedByUs` - `true` if this disconnect was intentionally initiated by us, or `false` if it was the result of an error or the server closing the connection

Emitted when the WebSocket connection is lost. At the present moment, this module will not automatically reconnect.

### loaded

Emitted after all connections and buffers have been fully loaded from IRCCloud after connection.

### accountDetails
- `details` - An object containing your IRCCloud account's details

Emitted shortly after connection to IRCCloud with your account's details. This is (partially) documented
[here](https://github.com/irccloud/irccloud-tools/wiki/API-Stream-Message-Reference#stat_user).

### newConnection
- `connection` - An object containing the connection's details.

Emitted when a new connection is created either by your session or by another session logged into your account.

A "connection" is a connection to a specific IRC server. Each connection has its own nick and set of channels, even if
it's connected to the same server as another connection. Free accounts can only have two connections at a time.

The `connection` object is (partially) documented [here](https://github.com/irccloud/irccloud-tools/wiki/API-Stream-Message-Reference#makeserver).
Note that this module also adds a `buffers` property which is an object containing the buffers which are owned by this
connection (see below).

### newBuffer
- `buffer` - An object containing the buffer's details.

Emitted when a new buffer is created. This might be a result of your joining a new channel, as a result of your creating
a new connection (e.g. the console/status buffer), as a result of someone new PMing you, or something else.

A "buffer" is a "chat window". Buffers show up as tabs in the sidebar of the IRCCloud client. There are three types of
buffers:
- `console` - Each connection has exactly one console buffer, which is where notices and server messages are routed.
- `channel` - Each channel you're in has its own buffer.
- `conversation` - Each user who has privately messaged you (or who you've privately messaged) has their own buffer. These [can be renamed](#conversationRenamed) if the other party changes their nick.

Channel buffers have a `users` property which is an array of users who we know to be in the channel. Channel buffers
also have an `initialized` property which is `false` if you're not currently in the channel, or `true` if you are.

### connectionStatus
- `connection` - A connection object
- `newStatus` - The connection's new status
- `failInfo` - An object containing the connection's new fail info (may be empty object)

Emitted when a connection changes state. Possible states are:
- queued
- connecting
- connected
- connected_joining
- connected_ready
- quitting
- disconnected
- waiting_to_retry
- ip_retry - Indicates that one IP failed but the host resolved to more, so IRCCloud will try another one soon

`failInfo` will be defined when the state unexpectedly changes to `disconnected`. Possible keys and values for `failInfo` are:
- `type` - Indicates what type of disconnect this was
    - `connecting_restricted` - Your subscription level restricted this connection
    - `socket_closed` - The network connection went away
    - `connecting_failed` - IRCCloud couldn't establish a connection in the first place
    - `killed` - You were booted off IRC (killed) by an IRCOp
- `reason` - A more specific failure reason
    - `pool_lost` - Connection pool failed
    - `no_pool` - No available connection pools
    - `enetdown` - Network down
    - `etimedout` - Connection timed out
    - `timeout` - Connection timed out
    - `ehostunreach` - Host unreachable
    - `econnrefused` - IRC server refused the connection
    - `nxdomain` - Invalid hostname (domain doesn't exist)
    - `ssl_certificate_error` - SSL certificate error
    - `ssl_error` - Generic SSL error
    - `crash` - Connection crashed
- `timestamp` - A `Date` object for when the disconnect happened
- `retry_timeout` - Number if seconds after which IRCCloud will try again
- `attempts` - How many times IRCCloud has already tried to connect
- `give_up` - Only defined, and `true`, if IRCCloud has attempted many times and has now given up

### connectionChanged
- `oldConnection` - Connection object containing old connection data
- `newConnection` - Connection object containing new connection data

Emitted when a connection's options are changed by you.

### connectionDeleted
- `connection` - A connection object

Emitted when a connection is permanently deleted. It must have already been disconnected.

### channelInit
- `buffer` - A buffer object

Emitted when you successfully join a new channel and load its details. At this point you can safely chat to the channel,
and you can retrieve all data about the channel.

### archived
- `buffer` - A buffer object

Emitted when a buffer is successfully archived (hidden from view). Archived buffers are not deleted, and can be
unarchived at any time. Note that if a channel is archived while you're in it, you are automatically parted from it.

### unarchived
- `buffer` - A buffer object

Emitted when a buffer is unarchived. This doesn't automatically rejoin the channel if it's a channel buffer.

### deleted
- `buffer` - A buffer object

Emitted when a buffer is deleted. This is not reversible and all history from the buffer is permanently deleted.

### mode
- `buffer` - A buffer object
- `changes` - An object with two properties:
    - `add` - An array of objects for modes which were added, each with two properties:
        - `mode` - The mode letter which was added
        - `param` - The parameter for the mode, if applicable, or empty string if not
    - `remove` - An array of objects identical to `add` for modes which were removed
- `newMode` - A string of mode characters representing the channel's up-to-date mode
- `actor` - A [user object](#user-object) for the person who changed the mode

Emitted when a channel's mode is changed.

### userMode
- `buffer` - A buffer object
- `user` - A [user object](#user-object) for the person whose mode was changed
- `changes` - Same as `changes` in [`mode`](#mode)
- `newMode` - Same as `newMode` in [`mode`](#mode)
- `actor` - A [user object](#user-object) for the person who changed the mode

Emitted when another user's channel mode is changed. For example, when a user is voiced or opped.

### youMode
- `connection` - A connection object
- `changes` - Same as `changes` in [`mode`](#mode)
- `newMode` - Same as `newMode` in [`mode`](#mode)

Emitted when your connection-wide user mode changes.

### topic
- `buffer` - A buffer object
- `actor` - A [user object](#user-object) for the person who changed the mode
- `text` - The new topic, as a string
- `time` - A `Date` object representing the time and date when this mode was set (should be just now)

Emitted when a channel's topic changes.

### join
- `buffer` - A buffer object
- `user` - A [user object](#user-object) for the person who joined

Emitted when someone joins one of your channels.

### part
- `buffer` - A buffer object
- `user` - A [user object](#user-object) for the person who left
- `msg` - The user's part message (may be empty)

Emitted when someone leaves one of your channels voluntarily.

### youPart
- `buffer` - A buffer object
- `msg` - Your part message (may be empty)

Emitted when you leave one of your channels voluntarily (or perhaps not, as some networks allow channel ops to
force-part a user instead of kicking them, e.g. to defeat auto-rejoin mechanisms).

### kick
- `buffer` - A buffer object
- `user` - A [user object](#user-object) for the person who was kicked
- `msg` - The kick reason (may be empty)
- `actor` - A [user object](#user-object) for the person who did the kicking

Emitted when someone is kicked out of one of your channels.

### youKick

- `buffer` - A buffer object
- `msg` - The kick reason (may be empty)
- `actor` - A [user object](#user-object) for the person who kicked you

Emitted when you are kicked out of a channel.

### quit
- `buffer` - A buffer object
- `user` - A [user object](#user-object) for the person who quit
- `msg` - The quit message (may be empty)

Emitted *once per buffer* when a user quits the IRC server for each buffer you see that user in, potentially including a
`conversation` type buffer (a PM).

### message
- `buffer` - A buffer object
- `sender` - A [user object](#user-object) for the person who sent the message
- `msg` - The message text
- `highlight` - `true` if this message highlighted you based on your highlight rules, or `false` if not

Emitted when someone sends a message to either a channel you're in or to you directly.

### action
- `buffer` - A buffer object
- `sender` - A [user object](#user-object) for the person who sent the message
- `msg` - The message text (not including their nick)
- `highlight` - `true` if this message highlighted you based on your highlight rules, or `false` if not

Emitted when someone sends an action-message (/me) to either a channel you're in or to you directly.

### highlight
- `buffer` - A buffer object
- `sender` - A [user object](#user-object) for the person who sent the message
- `msg` - The message text

Emitted for either `message` or `action` when you're highlighted only.

### notice
- `buffer` - A buffer object
- `sender` - A [user object](#user-object) for the person who sent the notice
- `msg` - The notice text
- `target` - If this notice was sent to a channel, this is the channel name

Emitted when someone sends a notice to either a channel you're in or to you directly.

### messageEcho
- `buffer` - A buffer object
- `sender` - A [user object](#user-object) for the sender of the message (you!)
- `msg` - The message text

Same as `message`, except for messages we sent ourselves (potentially on another client session).

### actionEcho
- `buffer` - A buffer object
- `sender` - A [user object](#user-object) for the sender of the message (you!)
- `msg` - The message text (not including your nick)

Same as `action`, except for messages we sent ourselves (potentially on another client session).

### noticeEcho
- `buffer` - A buffer object
- `sender` - A [user object](#user-object) for the sender of the message (you!)
- `msg` - The notice text

Same as `notice`, except for messages we sent ourselves (potentially on another client session).

### accessDenied
- `buffer` - A buffer object (the connection's console buffer)
- `channel` - The name of the channel to which you were denied
- `msg` - The error message

Emitted when you try to do something that requires channel operator (or similar) access, which you don't have.

### nick
- `buffer` - A buffer object
- `oldNick` - The old nick of the user who changed their nick
- `newNick` - The new nick to which the user changed

Emitted *once per buffer you share with this user* when someone changes their nick.

### youNick
- `buffer` - A buffer object
- `oldNick` - Your old nick
- `newNick` - Your new nick

Emitted when you change your own nick (or it's changed forcefully by the server).

### conversationRenamed
- `buffer` - A buffer object
- `newName` - The new name of the buffer

Emitted when a `conversation` buffer is renamed because the other party changed their nick.

### unknownCommand
- `buffer` - A buffer object
- `command` - The command that was unknown

Emitted when you try to run an unknown /command on a server. The provided buffer is the buffer in which the command
was run.
