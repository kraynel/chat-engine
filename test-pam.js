const ChatEngineCore = require('./src/index.js');


console.log(ChatEngineCore);

const ChatEngine = ChatEngineCore.create({
  publishKey: 'pub-c-281ab39e-9a34-4e6d-84ac-9bf70e949455',
  subscribeKey: 'sub-c-1eb17cd8-8148-11e7-bdc2-6e5eeb112503'
});

let me = ChatEngine.connect('ian');

let chat = new ChatEngine.Chat('tutorial-room');

ChatEngine.onAny((event, p) => {
    console.log(event)
})

setInterval(() => {
  console.log(chat.users.length, chat.users);
}, 1000);
