let Client = require('./client.js');

let api = new Client({
    debug: true,
    endpoint: 'http://admin.bronze.ps.pn'
});

api.init({
    email: 'ian+pubnubgarbage@meetjennings.com',
    password: 'Mrgarbageis#1!'
}, (err, body) => {

    let session = body.result;

     api.request('post', ['api', 'apps'], {
        form: {
            name: 'test-app-2',
            owner_id: session.user.id,
            properties: {}
        }
    }, function (err, data) {

         api.request('get', ['api', 'apps'], {
            qs: {
                owner_id: session.user.id,
            }
        }, function (err, data) {

            let key = data.result[0].keys[0];

            key.properties.name = 'ChatEngine Keyset';
            key.properties.presence = 1;
            key.properties.history = 1;
            key.properties.message_storage_ttl = 7;
            key.properties.multiplexing = 1;
            key.properties.presence_announce_max = 20;
            key.properties.presence_debounce = 2;
            key.properties.presence_global_here_now = 1;
            key.properties.presence_interval = 10;
            key.properties.presence_leave_on_disconnect = 0;
            key.properties.blocks = 1;
            key.properties.uls = 1;
            key.properties.wildcardsubscribe = 1;

            api.request('put', ['api', 'keys', key.id], {
                form: key
            }, function (err, data) {

                console.log(err, data.result.publish_key, data.result.subscribe_key)

            });

        });

    });

});
