const ChatEngineCore = require('./src/index.js');

var ChatEngine = ChatEngineCore.create({
    publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
    subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe'
}, 'demo');

me = ChatEngine.connect('robot-tester', {works: true});

let chat = new ChatEngine.Chat(new Date() + 'chat');

chat.onAny((event) => {
    console.log(event);
});

setInterval(() => {
    chat.emit('message', {test: true});
    console.log('emitting')
}, 1000);
