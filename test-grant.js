// runs on setup
let request = require('request');

const config = require('./test-grant-config.js');

let PubNub = require('pubnub');

let pn = new PubNub({
    publishKey: config.publishKey,
    subscribeKey: config.subscribeKey,
    authKey: config.authKey
});

request.post({
    url: 'https://pubsub.pubnub.com/v1/blocks/sub-key/sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe/grant-test',
    json: {
        authKey: config.authKey,
        chan: config.chan
    }
}, (err, httpResponse, body) => {

    console.log('pfunct response', body)

    pn.addListener({
        message: (message) => {
            console.log('incoming', message)
        }
    });

    pn.subscribe({
        channels: [config.chan]
    });

    console.log('publishing')
    pn.publish({
        channel: config.chan,
        message: 'test'
    })
});
