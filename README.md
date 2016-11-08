# IRCCloud Client for Node.js

TODO

# Methods

### join(connection, channel[, key][, callback])
- `connection`
- `channel`
- `key`
- `callback`

Join a channel. Listen for `channelInit` to know when you've successfully joined.

### part(connection, channel[, msg][, callback])
- `connection`
- `channel`
- `msg`
- `callback`

Leave a channel. Listen for `youPart` to know when you've successfully parted.

### message(connection, recipient, message[, callback])
- `connection`
- `recipient`
- `message`
- `callback`

Send a message to a recipient (either a channel or a nick to send a PM).

### action(connection, recipient, message[, callback])
- `connection`
- `recipient`
- `message`
- `callback`

Identical to the `message` method except prefixes the `message` with `/me `.

### topic(buffer, text[, callback])
- `buffer` - An object representing the buffer whose topic you want to change. Must have `cid` (connection ID) and `bid` (buffer ID) properties
- `text` - The new topic
- `callback` - Optional. Called in response to this request.
    - `data` - An object containing these properties:
        - `success` - A boolean

Sets a channel's topic, provided you have permission to do so.

# Events

### mode
- `buffer`
- `changes`
- `newMode`
- `actor`

Emitted when a channel's mode is changed.

### userMode
- `buffer`
- `user`
- `changes`
- `newMode`
- `actor`

Emitted when another user's channel mode is changed.

### youMode
- `connection`
- `changes`
- `newMode`

Emitted when your connection-wide user mode changes.

### topic
- `buffer`
- `actor`
- `text`
- `time`

Emitted when a channel's topic changes.

### join
- `buffer`
- `user`

Emitted when someone joins one of your channels.

### part
- `buffer`
- `user`
- `msg`

Emitted when someone leaves one of your channels voluntarily.

### youPart
- `buffer`
- `msg`

Emitted when you leave one of your channels voluntarily (or perhaps not, as some networks allow channel ops to
force-part a user instead of kicking them, e.g. to defeat auto-rejoin mechanisms).

### kick
- `buffer`
- `user`
- `msg`
- `actor`

Emitted when someone is kicked out of one of your channels.

### youKick

- `buffer`
- `msg`
- `actor`

Emitted when you are kicked out of a channel.

### quit
- `buffer`
- `user`
- `msg`

Emitted *once per buffer* when a user quits the IRC server for each buffer you see that user in, potentially including a
`conversation` type buffer (a PM).

### message
- `buffer`
- `sender`
- `msg`
- `highlight`

Emitted when someone sends a message to either a channel you're in or to you directly.

### action
- `buffer`
- `sender`
- `msg`
- `highlight`

Emitted when someone sends an action-message (/me) to either a channel you're in or to you directly.

### highlight
- `buffer`
- `sender`
- `msg`

Emitted for either `message` or `action` when you're highlighted only.

### notice
- `buffer`
- `sender`
- `msg`
- `target`

Emitted when someone sends a notice to either a channel you're in or to you directly.

### messageEcho
- `buffer`
- `sender`
- `msg`
- `highlight`

Same as `message`, except for messages we sent ourselves (potentially on another client session).

### actionEcho
- `buffer`
- `sender`
- `msg`
- `highlight`

Same as `action`, except for messages we sent ourselves (potentially on another client session).

### noticeEcho
- `buffer`
- `sender`
- `msg`
- `highlight`

Same as `notice`, except for messages we sent ourselves (potentially on another client session).
