let PubNub = require('pubnub');

let pubnub = new PubNub({
    publishKey: 'pub-c-c6303bb2-8bf8-4417-aac7-e83b52237ea6',
    subscribeKey: 'sub-c-67db0e7a-50be-11e7-bf50-02ee2ddab7fe',
    secretKey: 'sec-c-MjU3YjEwOGYtYzVkNC00N2M4LTliYTktN2FhY2U1OGI0Y2Iw'
});

const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const request = require('request');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get('/', function (req, res) {
  res.send('Hello World!')
});

let reset = function() {

    pubnub.grant({
        read: false,
        write: false,
        ttl: 0
    }, function (a,b,c) {
        console.log('ALL PAM PERMISSIONS RESET');
    });

}

let grant = function(gChan, myUUID, myAuthKey, next) {

    console.log('granting on channel', gChan, 'for uuid', myUUID, 'with auth key', myAuthKey)

    let chanMeRW = [
        gChan,
        gChan + '-pnpres',
        gChan + ':chat:public.*',
        gChan + ':user:' + myUUID + ':read.*',
        gChan + ':user:' + myUUID + ':write.*',
        gChan + ':chat:public.*'
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

                next();

            });

        });

    });

}

app.post('/facebook', function (req, res) {

    request.get('https://graph.facebook.com/debug_token', {
        qs: {
            input_token: req.body.authKey,
            access_token: '1628895400474971|a505381fd6a6af14da16db8b1ffffaee'
        },
        json: true
    }, function(err, body, response){

        if(response.data.is_valid) {

            grant(req.body.channel, req.body.uuid, req.body.authKey, () => {
                res.send('it worked');
            });

        } else {
            res.status(401);
        }

    });

});

let permitted = {};

app.use('/insecure', function(req, res, next) {

    console.log('THIS IS WORKING')
    console.log('Making sure logged in')

    if(true) {
        next(null);
    } else {
        return res.status(401);
    }

});

// we logged in, grant
app.post('/insecure/auth', function (req, res) {

    console.log('made it to /auth')

    grant(req.body.channel, req.body.uuid, req.body.authKey, () => {
        console.log('grant happened')
        res.send('it worked');
    });

});

// new chat
app.post('/insecure/chat', function(req, res) {

    console.log('chat endpoint called')

    console.log(req.body)

    pubnub.grant({
        channels: [req.body.channel, req.body.channel + '-pnpres'],
        read: true, // false to disallow
        write: true,
        ttl: 0
    }, function (a,b,c) {
        res.status(200);
        res.sendStatus(200)
    });

    // make a new chat
    // person who makes chat gets the permission
    // response tells them to join

});

app.post('/insecure/invite', function (req, res) {

    // you can only invite if you're in the channel
    // grants the user permission in the channel

    // grants everybody!
    grant(req.body.channel, req.body.uuid, req.body.authKey, () => {
        res.send('it worked');
    });

});

// uuids are permitted in channels
// authKey is what is used to grant
// server should make sure that uuid or other auth params match authKey for security

app.post('/test', function (req, res) {

    if(req.body.authKey == 'open-sesame') {

        // grants everybody!
        grant(req.body.channel, req.body.uuid, req.body.authKey, () => {
            res.send('it worked');
        });

    } else {
        res.status(401);
    }

});

reset();

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
