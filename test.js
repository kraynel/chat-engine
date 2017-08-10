
const assert = require('chai').assert;

const ChatEngineCore = require('./src/index.js');

describe('import', function() {

    it('ChatEngine should be imported', function() {
        assert.isObject(ChatEngineCore, 'was successfully created');
    });

});

let me;
let ChatEngine;
let ChatEngine2;
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

        assert.isOk(ChatEngine);

    });

});

describe('connect', function() {

    it('should be identified as new user', function(done) {

        ChatEngine.connect('robot-tester', {works: true}, 'token-doesnt-matter');

        ChatEngine.on('$.ready', (data) => {
            assert.isObject(data.me);
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

let me2;
describe('invite', function() {

    it('should be created', function(done) {

        ChatEngine2 = ChatEngineCore.create({
            publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
            subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe'
        }, {
            authUrl: 'http://localhost:3000/insecure',
            globalChannel: globalChannel
        });

        me2 = ChatEngine2.connect('robot-tester2', {works: true}, 'token-doesnt-matter');

        ChatEngine2.on('$.ready', (data) => {
            done();
        });

    });

    it('should create chat', function(done) {

        let myChat2 = new ChatEngine2.Chat('secret-channel-' + new Date().getTime());

        myChat2.on('$.connected', () => {

            done();

        });

    });

});

