// runs on setup


// let gChan = new Date().getTime();
let gChan = 'test-chan6'


        let myUUID = 12345;
        let myAuthKey = "dog";

console.log('pubnub grant happened');

// runs on client
//
const ChatEngineCore = require('./src/index.js');


let PubNub = require('pubnub');

let pn = new PubNub({
    publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
    subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe',
    secretKey: 'sec-c-MjU3YjEwOGYtYzVkNC00N2M4LTliYTktN2FhY2U1OGI0Y2Iw'
});

let channels = [
    gChan,
    gChan + '-pnpres',
    gChan + ':chat:public.*',
    gChan + ':user:' + myUUID + ':read.*',
    gChan + ':user:' + myUUID + ':write.*'
];

// public-read, public-write, private-read, private-write

// setup
// server grants read write on all .public
// server revokes all permissions on .private
// .symbolizes what it is initially

// user is authorized
// server grants them read write on .private:user:uuid:feed
// server grants them read on .private:user:uuid:direct
//
//user.uuid.us.them.chan
//
// user.uuid:read.
// user.uuid:write.
//
//
// chat-engine-jquery-kitchen-sink:user:1501798631597:read.:feed
// chat-engine-jquery-kitchen-sink:user:1501798631597:write.:direct
// chat-engine-jquery-kitchen-sink

console.log(channels)

pn.grant({
        channels: channels,
        read: true, // false to disallow
        write: true, // false to disallow,
        authKeys: [myAuthKey],
        ttl: 0
    },
    function (a,b,c) {

        console.log(a,b,c)

        var ChatEngine = ChatEngineCore.create({
            publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
            subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe'
        }, gChan);

        me = ChatEngine.connect(myUUID, myAuthKey, {works: true});

        // ChatEngine.on('$.ready', () => {
        setTimeout(() => {

            let chat = new ChatEngine.Chat(new Date().getTime());

            chat.onAny((event) => {
                console.log(event);
            });

            setInterval(() => {
                chat.emit('message', {test: true});
                console.log('emitting')
            }, 1000);

        }, 3000);

    }
);
