let PubNub = require('pubnub');

let pubnub = new PubNub({
    publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
    subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe',
    secretKey: 'sec-c-MjU3YjEwOGYtYzVkNC00N2M4LTliYTktN2FhY2U1OGI0Y2Iw'
});

const express = require('express')
const app = express()
const bodyParser = require('body-parser');


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
  res.send('Hello World!')
});

app.post('/setup', function (req, res) {

    console.log('setup called');

    // let gChan = new Date().getTime();
    let gChan = req.body.channel;
    let myUUID = req.body.uuid;
    let myAuthKey = req.body.authKey;

    let chanMeRW = [
        gChan,
        gChan + '-pnpres',
        gChan + ':chat:public.*',
        gChan + ':user:' + myUUID + ':read.*',
        gChan + ':user:' + myUUID + ':write.*'
    ];

    let chanEverybodyR = [
        gChan + ':user:' + myUUID + ':read.*'
    ];

    let chanEverybodyW = [
        gChan + ':user:' + myUUID + ':write.*'
    ];

    pubnub.grant({
        channels: chanEverybodyR,
        read: true, // false to disallow
        ttl: 0
    }, function (a,b,c) {

        pubnub.grant({
            channels: chanEverybodyW,
            write: true, // false to disallow
            ttl: 0
        }, function (a,b,c) {

            pubnub.grant({
                channels: chanMeRW,
                read: true, // false to disallow
                write: true, // false to disallow,
                authKeys: [myAuthKey],
                ttl: 0
            }, function (a,b,c) {

                res.send('It worked');

            });

        });

    });

});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
