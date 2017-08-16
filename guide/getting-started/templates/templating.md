ChatEngine does not contain any premade templates or GUI code as part of the
main package (they're are plenty in the example repository however).

ChatEngine leaves the design and interaction up to you. It provides events,
methods, and data but does not make any assumptions of template engines.

ChatEngine works on both the front and back ends, with popular frameworks like
jQuery, React, Angular, React Native, NodeJS, and good old Javascript.

For example, to publish a message to a {@link Chat} you may bind a DOM ```onSubmit()``` event to
the {@link Chat#emit} method.

So, let's create a chat:

```js
// create a new chat
let chat = new ChatEngine.Chat('example-chat');
```

Create a place for message  output and give the user a way to fire the event:

```html
<div id="output"></div>
<button type="submit" onclick="sendChat()">Send</button>
```

The ```sendChat()``` method fires {@link Chat#emit}.

```js
// send a message to all users in the chat
function sendChat() {

    chat.emit('message', {
        text: 'hello worl!'
    });

};
```

Then, when the message is recieved by the client:

```js
// get the DOM element in Javascript
let output = document.getElementById('output');

// when the event is received
chat.on('message', (payload) => {

    output.innerHTML = output.innerHTML + payload.data.text;

});
```

## Data Binding (Angular and React)


```
<ul id="online-list">
    <li ng-repeat="(uuid, user) in chat.users">
        <a href="#" ng-click="newChat(user)"> {{user.state().username}}</a>
    <span class="show-typing" ng-show="user.isTyping">is typing...</span>
    </li>

    </ul>
```
