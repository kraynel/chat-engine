To authorize this client as a Chat Engine User, use the ```connect``` function.

```js
let me = ChatEngine.connect('ian');
```

This connects to the PubNub Data Stream network on behalf of the browser running the code.

### ChatEngine.connect()

The function returns a ```User``` and connect to a global ```Chat```. The paramter ```ian``` is a unique identifier for the new ```User```.

PubNub Chat Engine is an object oriented framework, so when you see ```User``` and ```Chat```, it represents an actual object within the SDK.

- ***User*** - A client. The browser window.
- ***Chat*** - A chatroom that a ```User``` can join.

### Me

The ```User``` returned by the ```connect()``` method represents this browser window. We call that ```User``` ```me```.
