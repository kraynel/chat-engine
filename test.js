
const assert = require('chai').assert;

const ChatEngineCore = require('./src/index.js');

describe('import', function() {

    it('ChatEngine should be imported', function() {
        assert.isObject(ChatEngineCore, 'was successfully created');
    });

});

let me;
let ChatEngine;
let ChatEngineYou;
let globalChannel  = 'chat-engine-demo-test' + new Date().getTime();

describe('config', function() {

    it('should be configured', function() {

        ChatEngine = ChatEngineCore.create({
            publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
            subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe'
        }, {
            authUrl: 'http://localhost:3000/insecure',
            globalChannel: globalChannel
        });

        ChatEngine.on('$.network.*', function(event) {
            console.log(this.event)
        });

        assert.isOk(ChatEngine);

    });

});

describe('connect', function() {

    it('should be identified as new user', function(done) {

        ChatEngine.connect('ian', {works: true}, 'ian-authtoken');

        ChatEngine.on('$.ready', (data) => {
            assert.isObject(data.me);
            me = data.me;
            done();
        });

    });

});

let chat;

describe('chat', function() {

    it('should be created', function(done) {

        chat = new ChatEngine.Chat(new Date() + 'chat', true, false);

        chat.onAny((event) => {
            // console.log(event)
        })

        done();

    });

    it('should get ready callback', function(done) {

        chat.on('$.connected', () => {

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

let myChat;

let you;
let yourChat;

describe('invite', function() {

    it('should be created', function(done) {

        ChatEngineYou = ChatEngineCore.create({
            publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
            subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe'
        }, {
            authUrl: 'http://localhost:3000/insecure',
            globalChannel: globalChannel
        });

        ChatEngineYou.connect('stephen', {works: true}, 'stephen-authtoken');

        ChatEngineYou.on('$.ready', (data) => {
            you = data.me;
            done();
        });

    });

    it('should create chat', function(done) {

        yourChat = new ChatEngineYou.Chat('secret-channel-' + new Date().getTime());

        yourChat.on('$.connected', () => {
            done();
        });

    });

    it('should invite other users', function(done) {

        me.direct.on('$.invite', (payload) => {

            assert.isObject(payload.chat);

            myChat = new ChatEngine.Chat(payload.data.channel);

            done();
        });

        // me is the current context
        yourChat.invite(me);

    });

    it('two users are able to talk to each other in private channel', function(done) {

        myChat.emit('message', {
            text: 'sup?'
        });

        yourChat.on('message', (payload) => {
            assert.equal(payload.data.text, 'sup?');
            done();
        });

    });

    it('should not be able to join another chat', function(done) {

        let targetChan = 'super-secret-channel-' + new Date().getTime();

        let yourSecretChat = new ChatEngineYou.Chat(targetChan);

        yourSecretChat.on('$.connected', () => {

            let illegalAccessChat = new ChatEngine.Chat(targetChan);

            illegalAccessChat.on('$.connected', () => {

                done(new Error('This user should not be able to join', illegalAccessChat.channel))

            });

            illegalAccessChat.once('$.error.connection', () => {

                done();

            });

            illegalAccessChat.emit('message', 'test');

        });

    });

});

