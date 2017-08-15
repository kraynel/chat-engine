
const ChatEngineCore = require('./src/index.js');

const assert = require('chai').assert;

describe('import', function() {

    it('ChatEngine should be imported', function() {
        assert.isObject(ChatEngineCore, 'was successfully created');
    });

});

let me;
let ChatEngine;
let ChatEngineYou;
let globalChannel  = 'chat-engine-demo-test' + new Date().getTime();

let pnConfig = {
    publishKey: 'pub-c-5f1e0d9d-89e5-485f-8f05-ad92a0fdb083',
    subscribeKey: 'sub-c-2fc37408-81fd-11e7-b8cd-f652352d4e79'
};

describe('config', function() {

    it('should be configured', function() {

        ChatEngine = ChatEngineCore.create(pnConfig, {
            authUrl: 'http://localhost:3000/insecure',
            globalChannel: globalChannel
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

        ChatEngine.on('$.network.*', (data) => {
            console.log(data.operation)
        })

    });

});

let chat;

describe('chat', function() {

    it('should be created', function(done) {

        chat = new ChatEngine.Chat(new Date() + 'chat');

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

let chat2;

describe('myself-join', function() {

    it('should get self as an online event', function(done) {

        ChatEngineChecker = ChatEngineCore.create(pnConfig, {
            authUrl: 'http://localhost:3000/insecure',
            globalChannel: globalChannel
        });
        ChatEngineChecker.connect('ian', {works: true}, 'ian-authtoken');

        ChatEngineChecker.on('$.ready', (data) => {

            chat2 = new ChatEngineChecker.Chat(new Date() + 'chat22', true, true);

            chat2.once('$.online.*', (p) => {
                assert(p.user.uuid == ChatEngine.me.uuid, 'this online event is me')
                done();
            });

        });

        this.timeout(10000)


    });


});

let myChat;

let you;
let yourChat;

describe('invite', function() {

    it('should be created', function(done) {

        ChatEngineYou = ChatEngineCore.create(pnConfig, {
            authUrl: 'http://localhost:3000/insecure',
            globalChannel: globalChannel
        });

        ChatEngineYou.connect('stephen', {works: true}, 'stephen-authtoken');

        ChatEngineYou.on('$.ready', (data) => {

            you = data.me;

            yourChat = new ChatEngineYou.Chat('secret-channel-' + new Date().getTime());

            yourChat.on('$.connected', () => {
                done();
            });

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

            illegalAccessChat.onAny((event, p) => {
                if(p && p.user) {
                    console.log(event, p.user.uuid)
                }
            })

            illegalAccessChat.on('$.connected', () => {
                done(new Error('This user should not be able to join', illegalAccessChat.channel))
            });

            illegalAccessChat.once('$.error.publish', () => {
                done();
            });

            illegalAccessChat.emit('message', 'test');

        });

    });

});

