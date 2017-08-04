// runs on setup
let request = require('request');const config = require('./test-grant-config.js');
let PubNub = require('pubnub');

let channel = 'chan' + new Date().getTime();
channel = "pam-chan"

request.post({
    url: 'https://pubsub.pubnub.com/v1/blocks/sub-key/sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe/auther',
    json: {
        channel: channel
    }
}, (err, httpResponse, body) => {

    console.log('pfunct response', body)

    setTimeout(function(){


        let pn = new PubNub({
            publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
            subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe',
            logVerbosity: true,
        });

        pn.addListener({
            message: (message) => {
                console.log('incoming', message)
            }
        });

        pn.subscribe({
            channels: [channel]
        });

        console.log('publishing')
        pn.publish({
            channel: channel,
            message: 'test'
        }, function(a,b,c){
            // console.log(a,b,c)
        })


    }, 5000)
});
