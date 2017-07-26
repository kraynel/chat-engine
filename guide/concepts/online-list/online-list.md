### See who else is online

A list of all the clients who have joined the chatroom is available from ```chat.users```.

```js
console.log(chat.users);
```

It returns a list of ```Users``` who have also joined this chat.

```js
{
  ian: {},
  nick: {}
}
```

When a new ```User``` comes online, the ```Chat``` emits the ```$.online``` event.

```js
chat.on('$.online', (newUser) -> {
  console.log('new user', newUser);
});
```
