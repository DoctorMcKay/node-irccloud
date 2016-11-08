# IRCCloud Client for Node.js

TODO

# Methods

### topic(buffer, text[, callback])
- `buffer` - An object representing the buffer whose topic you want to change. Must have `cid` (connection ID) and `bid` (buffer ID) properties
- `text` - The new topic
- `callback` - Optional. Called in response to this request.
    - `data` - An object containing these properties:
        - `success` - A boolean

Sets a channel's topic, provided you have permission to do so.