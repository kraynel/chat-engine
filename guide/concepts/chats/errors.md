What happens in ChatEngine when you try to connect to a Chat you don’t have PAM access to:

```js
let PrivateChat = new ChatEngine.Chat(‘locked-down-i-dont-have-permissions’);

// Private Chat Emits These Events
// $.error.presence
// $.error.publish

// ChatEngine emits this event
// ChatEngine - $.network.denied
```

// errors
