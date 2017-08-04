const PubNub = require('pubnub');
const config = require('./test-grant-config.js');

let pn = new PubNub({
    publishKey: config.publishKey,
    subscribeKey: config.subscribeKey,
    secretKey: config.secretKey
});

let grantParams = {
    channels: [config.chan],
    read: true,
    write: true,
    authKeys: [config.authKey]
};

console.log('granting with params', grantParams)

pn.grant(grantParams, (err, res) => {

    console.log('granted on', err, res);

});
