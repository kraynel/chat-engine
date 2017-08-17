## Event Payload

Although you may emit any valid JSON using {@link Chat#emit}, when the same
event is received by other {@link User}s, it will be augmented with additional
data.

```js
{
    user: ChatEngine.User(),    // the User responsible for emitting the message
    chat: ChatEngine.Chat(),    // the Chat the event was broadcast over
    data: {}                    // anything sent to Chat.emit() shows up here
}
```

You can find the actual message contents supplied to {@link Chat#emit} within the ```payload.data``` property.

ChatEngine event payloads are augmented with additional information supplied by the framework. Most of the time these are ```payload.user``` and ```payload.chat.

The property ```payload.chat``` is the {@link Chat} that event was broadcast broadcast on, and the ```payload.user``` is the {@link User} that broadcast the message.

The property ```payload.user``` is the {@link User} that is responsible for calling {@link Chat#emit}.

The {@link User} and {@link Chat} properties are both fully interactive instances. Therefor, you can do things like ```payload.chat.emit('message')``` to automatically reply to a message.

## Simple Example

In this demo we'll mock up a user named 'Ian' emitting the 'like' event on a user named 'Emily'.

On Ian's page:

```js
// connect with UUID 'ian'
ChatEngine.connect('ian');

// emit a 'like' event over global chat
Chat.global.emit('like', {
    who: 'emily'
});
```

On Emily's page:

```js
// connect with UUID 'emily'
ChatEngine.connect('emily');

// when we received a 'like' event on global chat
Chat.global.on('like', (payload) => {

    // if that event matches 'emily'
    if(payload.data.who == 'emily') {

        // opens an alert that says "ian likes you!""
        alert(payload.user.uuid + ' likes you!');

    }

});
```

## Detailed Example

Using the same concept as our "Simple Example," we can make further use
of the fully featured ```payload``` object.

We'll add {@link User#state} to the {@link ChatEngine#connect} function.

On Ian's page:

```js
// connect as 'ian' with a state including fullName
ChatEngine.connect('ian', {fullName: 'Ian Jennings'});

// emit that we like emily over global channel
Chat.global.emit('like', {
    who: 'emily'
});
```

On Emily's page:

```js
// connect as 'emily' with a state including fullName
ChatEngine.connect('emily', {fullName: 'Emily Smith'});

// wait for ChatEngine to connect and get Me
ChatEngine.on('$.ready', (data) => {

    let me = data.me;

    // when we get a 'like' event on global chat
    Chat.global.on('like', (payload) => {

        // if the subject uuid is the same a me.uuid
        if(payload.data.who == me.uuid) {

            // opens a prompt that says "Ian Jennings likes you, do you like them?" Ok / Cancel
            // payload.user.state().fullName == "Ian Jennings" because it was set on Ian's page during connection
            let response = prompt(payload.user.state().fullName + ' likes you! Do you like them?');

            // if the user clicks "OK"
            if(response) {

                // send a like back! Use payload.chat to ensure it's the same chat, and payload.user.uuid to identify the subject
                payload.chat.emit('like', {
                    who: payload.user.uuid
                });

            }

        }

    });

});

```
