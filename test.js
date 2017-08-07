
const assert = require('chai').assert;

const ChatEngineCore = require('./src/index.js');

describe('import', function() {

    it('ChatEngine should be imported', function() {
        assert.isObject(ChatEngineCore, 'was successfully created');
    });

});

let me;
let ChatEngine;

describe('config', function() {

    it('should be configured', function() {

        ChatEngine = ChatEngineCore.create({
            publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
            subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe'
        });

        assert.isOk(ChatEngine);

    });

});

describe('connect', function() {

    it('should be identified as new user', function() {

        me = ChatEngine.connect('robot-tester', {works: true});
        assert.isObject(me);

    });

});

let chat;

describe('chat', function() {

    it('should be created', function(done) {

        chat = new ChatEngine.Chat(new Date() + 'chat');

        chat.onAny((event) => {
            console.log(event)
        })

        done();

    });

    it('should get ready callback', function(done) {

        chat.on('$.ready', () => {

            done();

        });

    });

    it('should get message', function(done) {

        chat.on('something', (payload) => {

            assert.isObject(payload);
            done();

        });

        chat.emit('something', {
            text: 'hello world'
        });

    });

});

