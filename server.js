let PubNub = require('pubnub');

let pubnub = new PubNub({
    publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
    subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe',
    secretKey: 'sec-c-MjU3YjEwOGYtYzVkNC00N2M4LTliYTktN2FhY2U1OGI0Y2Iw'
});

pubnub.grant({
        channels: ['test-chan2', 'test-chan2.public.*', 'test-chan2-pnpres'],
        read: true, // false to disallow
        write: true, // false to disallow
        ttl: 0
    },
    function (status) {
        console.log(status)
    }
);
