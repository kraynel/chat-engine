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

    console.log('granting global access for', myUUID, 'permissions on ', gChan, 'for uuid', myUUID, 'with auth key', myAuthKey)

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

app.use('/insecure', function(req, res, next) {

    if(true) { // not very secure
        next(null);
    } else {
        return res.status(401);
    }

});

let db = {};

let authUser = (uuid, authKey, channel, done) => {

    console.log('new grant for ', uuid, 'access on channel', channel)

    let key = ['channel', channel].join(':');
    db[key] = db[key] || [];

    let newChannels = [channel, channel + '-pnpres'];

    pubnub.grant({
        channels: newChannels,
        read: true, // false to disallow
        write: true,
        ttl: 0,
        authKey: authKey
    }, function (a,b,c) {

        db[key] = db[key].concat([uuid]);

       done();

    });

}

// we logged in, grant
app.post('/insecure/auth', function (req, res) {

    grant(req.body.channel, req.body.uuid, req.body.authKey, () => {
        res.send('it worked');
    });

});


// new chat
app.post('/insecure/chat', function(req, res) {

    let key = ['channel', req.body.channel].join(':');

    if(!db[key]) {

        console.log('new chat created on behalf of ', req.body.uuid, 'for channel', req.body.channel);

        authUser(req.body.uuid, req.body.authKey, req.body.channel, () => {
            return res.sendStatus(200);
        });

    } else {

        console.log('not auto granting', req.body.uuid, 'permissions on', req.body.channel, 'because it already has permissions');
        return res.sendStatus(401)
    }


    // make a new chat
    // person who makes chat gets the permission
    // response tells them to join

});

app.post('/insecure/invite', function (req, res) {

    console.log('invite called')

    // you can only invite if you're in the channel
    // grants the user permission in the channel

    let key = ['channel', req.body.uuid].join(':');

    if(db[key] && db[key].indexOf(req.body.uuid) > -1) {

        console.log('this user has auth in this chan, and can invite other users... proceeding');

        // grants everybody!
        grant(req.body.channel, req.body.uuid, req.body.authKey, () => {
            res.send('it worked');
        });

    } else {
        res.sendStatus(401)
    }

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
