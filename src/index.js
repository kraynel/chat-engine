// Allows us to create and bind to events. Everything in ChatEngine is an event
// emitter
const EventEmitter2 = require('eventemitter2').EventEmitter2;

const PubNub = require('pubnub');

// allows asynchronous execution flow.
const waterfall = require('async/waterfall');

// required to make AJAX calls for auth
const axios = require('axios');

/**
Global object used to create an instance of {@link ChatEngine}.

@alias ChatEngineCore
@param pnConfig {Object} ChatEngine is based off PubNub. Supply your PubNub configuration parameters here. See the getting started tutorial and [the PubNub docs](https://www.pubnub.com/docs/java-se-java/api-reference-configuration).
@param ceConfig {Object} A list of chat engine specific config options.
@param [ceConfig.globalChannel=chat-engine] {String} The root channel. See {@link ChatEngine.global}
@param [ceConfig.authUrl] {String} The root URL used to manage permissions for private channels. Omitting this forces insecure mode.
@param [ceConfig.throwErrors=true] {Boolean} Throws errors in JS console.
@param [ceConfig.insecure=true] {Boolean} Force into insecure mode. Will ignore authUrl and all Chats will be public.
@return {ChatEngine} Returns an instance of {@link ChatEngine}
@example
ChatEngine = ChatEngineCore.create({
    publishKey: 'demo',
    subscribeKey: 'demo'
}, {
    authUrl: 'http://localhost/auth',
    globalChannel: 'chat-engine-global-channel'
});
*/
const create = function(pnConfig, ceConfig = {}) {

    let ChatEngine = false;

    if(ceConfig.globalChannel) {
        ceConfig.globalChannel = ceConfig.globalChannel.toString()
    } else {
        ceConfig.globalChannel = 'chat-engine';
    }

    if(typeof ceConfig.throwErrors == "undefined") {
        ceConfig.throwErrors = true;
    }

    ceConfig.insecure = ceConfig.insecure || false;
    if(!ceConfig.authUrl) {
        console.info('ChatEngine is running in insecure mode. Supply a authUrl to run in secure mode.');
        ceConfig.insecure = true;
    }

    const throwError = function(self, cb, key, ceError, payload = {}) {

        if(ceConfig.throwErrors) {
            // throw ceError;
            throw ceError;
        }

        payload.ceError = ceError.toString();

        self[cb](['$', 'error', key].join('.'), payload);

    }

    /**
    * The {@link ChatEngine} object is a RootEmitter. Configures an event emitter that other ChatEngine objects inherit. Adds shortcut methods for
    * ```this.on()```, ```this.emit()```, etc.
    */
    class RootEmitter {

        constructor() {

            /**
            * @private
            */
            this.events = {};

            /**
            Create a new EventEmitter2 object for this class.

            @private
            */
            this.emitter = new EventEmitter2({
              wildcard: true,
              newListener: true,
              maxListeners: 50,
              verboseMemoryLeak: true
            });

            // we bind to make sure wildcards work
            // https://github.com/asyncly/EventEmitter2/issues/186

            /**
            Private emit method that broadcasts the event to listeners on this page.

            @private
            @param {String} event The event name
            @param {Object} the event payload
            */
            this._emit = this.emitter.emit.bind(this.emitter);

            /**
            Listen for a specific event and fire a callback when it's emitted. This is reserved in case ```this.on``` is overwritten.

            @private
            @param {String} event The event name
            @param {Function} callback The function to run when the event is emitted
            */

            this._on = this.emitter.on.bind(this.emitter);

            /**
            * Listen for a specific event and fire a callback when it's emitted. Supports wildcard matching.
            * @method
            * @param {String} event The event name
            * @param {Function} cb The function to run when the event is emitted
            * @example
            *
            * // Get notified whenever someone joins the room
            * object.on('event', (payload) => {
            *     console.log('event was fired').
            * })
            *
            * // Get notified of event.a and event.b
            * object.on('event.*', (payload) => {
            *     console.log('event.a or event.b was fired').;
            * })
            */
            this.on = this.emitter.on.bind(this.emitter);

            /**
            * Stop a callback from listening to an event.
            * @method
            * @param {String} event The event name
            * @example
            * let callback = function(payload;) {
            *    console.log('something happend!');
            * };
            * object.on('event', callback);
            * // ...
            * object.off('event', callback);
            */
            this.off = this.emitter.off.bind(this.emitter);

            /**
            * Listen for any event on this object and fire a callback when it's emitted
            * @method
            * @param {Function} callback The function to run when any event is emitted. First parameter is the event name and second is the payload.
            * @example
            * object.onAny((event, payload) => {
            *     console.log('All events trigger this.');
            * });
            */
            this.onAny = this.emitter.onAny.bind(this.emitter);

            /**
            * Listen for an event and only fire the callback a single time
            * @method
            * @param {String} event The event name
            * @param {Function} callback The function to run once
            * @example
            * object.once('message', => (event, payload) {
            *     console.log('This is only fired once!');
            * });
            */
            this.once = this.emitter.once.bind(this.emitter);

        }

    }

    /**
    Represents an event that may be emitted or subscribed to.
    */
    class Event {

        constructor(chat, event) {

            /**
            Events are always a property of a {@link Chat}. Responsible for
            listening to specific events and firing events when they occur.
;
            @readonly
            @type String
            @see [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-)
            */
            this.channel = chat.channel;

            /**
            Publishes the event over the PubNub network to the {@link Event} channel

            @private
            @param {Object} data The event payload object
            */
            this.publish = (m) => {

                m.event = event;

                ChatEngine.pubnub.publish({
                    message: m,
                    channel: this.channel
                }, (status, response) => {

                    if(status.statusCode == 200) {
                        chat.trigger('$.publish.success');
                    } else {

                        /**
                        * There was a problem publishing over the PubNub network.
                        * @event Chat#$"."error"."publish
                        */
                        throwError(chat, 'trigger', 'publish', new Error('There was a problem publishing over the PubNub network.'), {
                            errorText: status.errorData.response.text,
                            error: status.errorData,
                        });

                    }

                });

            }

            /**
            Forwards events to the Chat that registered the event {@link Chat}

            @private
            @param {Object} data The event payload object
            */
            this.onMessage = (m) => {

                if(this.channel == m.channel && m.message.event == event) {
                    chat.trigger(m.message.event, m.message);
                }

            }

            // call onMessage when PubNub receives an event
            ChatEngine.pubnub.addListener({
                message: this.onMessage
            });

        }

    }

    /**
    An ChatEngine generic emitter that supports plugins and forwards
    events to the root emitter.
    @extends RootEmitter
    */
    class Emitter extends RootEmitter {

        constructor() {

            super();

            /**
            Emit events locally.

            @private
            @param {String} event The event payload object
            */
            this._emit = (event, data) => {

                // all events are forwarded to ChatEngine object
                // so you can globally bind to events with ChatEngine.on()
                ChatEngine._emit(event, data);

                // emit the event from the object that created it
                this.emitter.emit(event, data);

            }

            /**
            * Listen for a specific event and fire a callback when it's emitted. Supports wildcard matching.
            * @method
            * @param {String} event The event name
            * @param {Function} cb The function to run when the event is emitted
            * @example
            *
            * // Get notified whenever someone joins the room
            * object.on('event', (payload) => {
            *     console.log('event was fired').
            * })
            *
            * // Get notified of event.a and event.b
            * object.on('event.*', (payload) => {
            *     console.log('event.a or event.b was fired').;
            * })
            */
            this.on = (event, cb) => {

                // keep track of all events on this emitter
                this.events[event] = this.events[event] || new Event(this, event);

                // call the private _on property
                this._on(event, cb);

            };

            /**
            Stores a list of plugins bound to this object
            @private
            */
            this.plugins = [];

            /**
            Binds a plugin to this object
            @param {Object} module The plugin module
            */
            this.plugin = function(module) {

                // add this plugin to a list of plugins for this object
                this.plugins.push(module);

                // returns the name of this class
                let className = this.constructor.name;

                // see if there are plugins to attach to this class
                if(module.extends && module.extends[className]) {

                    // attach the plugins to this class
                    // under their namespace
                    ChatEngine.addChild(this, module.namespace,
                        new module.extends[className]);

                    this[module.namespace].ChatEngine = ChatEngine;

                    // if the plugin has a special construct function
                    // run it
                    if(this[module.namespace].construct) {
                        this[module.namespace].construct();
                    }

                }


            }

        }

    }

    /**
    This is the root {@link Chat} class that represents a chat room

    @param {String} [channel=new Date().getTime()] A unique identifier for this chat {@link Chat}. The channel is the unique name of a {@link Chat}, and is usually something like "The Watercooler", "Support", or "Off Topic". See [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-).
    @param {Boolean} [autoConnect=true] Connect to this chat as soon as its initiated. If set to ```false```, call the {@link Chat#connect} method to connect to this {@link Chat}.
    @param {Boolean} [needGrant=true] This Chat has restricted permissions and we need to authenticate ourselves in order to connect.
    @extends Emitter
    @fires Chat#$"."ready
    @fires Chat#$"."state
    @fires Chat#$"."online
    @fires Chat#$"."offline
    */
    class Chat extends Emitter {

        constructor(channel = new Date().getTime(), needGrant = true, autoConnect = true) {

            super();

            if(ceConfig.insecure) {
                needGrant = false;
            }

            /**
            * A string identifier for the Chat room.
            * @type String
            * @readonly
            * @see [PubNub Channels](https://support.pubnub.com/support/solutions/articles/14000045182-what-is-a-channel-)
            */
            this.channel = channel.toString();

            let chanPrivString = 'public.';
            if(needGrant) {
                chanPrivString = 'private.';
            }

            if(this.channel.indexOf(ceConfig.globalChannel) == -1) {
                this.channel = [ceConfig.globalChannel, 'chat', chanPrivString, channel].join('#');
            }

            /**
            A list of users in this {@link Chat}. Automatically kept in sync as users join and leave the chat.
            Use [$.join](/Chat.html#event:$%2522.%2522join) and related events to get notified when this changes

            @type Object
            @readonly
            */
            this.users = {};

            /**
            A map of {@link Event} bound to this {@link Chat}

            @private
            @type Object
            @readonly
            */
            this.events = {}

            /**
            Updates list of {@link User}s in this {@link Chat}
            based on who is online now.

            @private
            @param {Object} status The response status
            @param {Object} response The response payload object
            */
            this.onHereNow = (status, response) => {

                if(status.error) {

                    /**
                    * There was a problem fetching the presence of this chat
                    * @event Chat#$"."error"."presence
                    */
                    throwError(this, 'trigger', 'presence', new Error('Getting presence of this Chat. Make sure PubNub presence is enabled for this key'), {
                        error: status.errorData,
                        errorText: status.errorData.response.text
                    });

                } else {

                    // get the list of occupants in this channel
                    let occupants = response.channels[this.channel].occupants;

                    // format the userList for rltm.js standard
                    for(let i in occupants) {
                        this.userUpdate(occupants[i].uuid, occupants[i].state);
                    }

                }

            };

            /**
            * Get messages that have been published to the network before this client was connected.
            * Events are published with the ```$history``` prefix. So for example, if you had the event ```message```,
            * you would call ```Chat.history('message')``` and subscribe to history events via ```chat.on('$history.message', (data) => {})```.
            *
            * @param {String} event The name of the event we're getting history for
            * @param {Object} [config] The PubNub history config for this call
            * @tutorial history
            */
            this.history = (event, config = {}) => {

                // create the event if it does not exist
                this.events[event] = this.events[event] || new Event(this, event);

                // set the PubNub configured channel to this channel
                config.channel = this.events[event].channel;

                // run the PubNub history method for this event
                ChatEngine.pubnub.history(config, (status, response) => {

                    if(status.error) {

                        /**
                        * There was a problem fetching the history of this chat
                        * @event Chat#$"."error"."history
                        */
                        throwError(this, 'trigger', 'history', new Error('There was a problem fetching the history. Make sure history is enabled for this PubNub key.'), {
                            errorText: status.errorData.response.text,
                            error: status.error,
                        });

                    } else {

                        response.messages.forEach((message) => {

                            if(message.entry.event == event) {

                                /**
                                * Fired by the {@link Chat#history} call. Emits old events again. Events are prepended with
                                * ```$.history.``` to distinguish it from the original live events.
                                * @event Chat#$"."history"."*
                                * @tutorial history
                                */
                                this.trigger(
                                    ['$', 'history', event].join('.'),
                                    message.entry);

                            }

                        });

                    }

                });

            }

            /**
            * Invite a user to this Chat. Authorizes the invited user in the Chat and sends them an invite via {@link User#direct}.
            * @param {User} user The {@link User} to invite to this chatroom.
            * @fires Me#event:$"."invite
            * @example
            * // one user running ChatEngine
            * let secretChat = new ChatEngine.Chat('secret-channel');
            * secretChat.invite(someoneElse);
            *
            * // someoneElse in another instance of ChatEngine
            * me.direct.on('$.invite', (payload) => {
            *     let secretChat = new ChatEngine.Chat(payload.data.channel);
            * });
            */
            this.invite = (user) => {

                let complete = () => {

                    let send = () => {

                        /**
                        * Notifies {@link Me} that they've been invited to a new private {@link Chat}.
                        * Fired by the {@link Chat#invite} method.
                        * @event Me#$"."invite
                        * @tutorial private
                        * @example
                        * me.direct.on('$.invite', (payload) => {
                        *    let privChat = new ChatEngine.Chat(payload.data.channel));
                        * });
                        */
                        user.direct.emit('$.invite', {
                            channel: this.channel
                        });

                    }

                    if(!user.direct.connected) {
                        user.direct.connect();
                        user.direct.on('$.connected', send);
                    } else {
                        send();
                    }

                }

                if(ceConfig.insecure) {
                    complete();
                } else {

                    axios.post(ceConfig.authUrl + '/invite', {
                        authKey: pnConfig.authKey,
                        uuid: user.uuid,
                        channel: this.channel,
                        myUUID: ChatEngine.me.uuid,
                        authData: ChatEngine.me.authData
                    })
                    .then((response) => {
                        complete();
                    })
                    .catch((error) => {

                        throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), {
                            error: error
                        });

                    });
                }

            };

            /**
            Keep track of {@link User}s in the room by subscribing to PubNub presence events.

            @private
            @param {Object} data The PubNub presence response for this event
            */
            this.onPresence = (presenceEvent) => {

                // make sure channel matches this channel
                if(this.channel == presenceEvent.channel) {

                    // someone joins channel
                    if(presenceEvent.action == "join") {

                        let user = this.createUser(presenceEvent.uuid, presenceEvent.state);

                        /**
                        * Fired when a {@link User} has joined the room.
                        *
                        * @event Chat#$"."online"."join
                        * @param {Object} data The payload returned by the event
                        * @param {User} data.user The {@link User} that came online
                        * @example
                        * chat.on('$.join', (data) => {
                        *     console.log('User has joined the room!', data.user);
                        * });
                        */
                        this.trigger('$.online.join', {
                            user: user
                        });

                    }

                    // someone leaves channel
                    if(presenceEvent.action == "leave") {
                        this.userLeave(presenceEvent.uuid);
                    }

                    // someone timesout
                    if(presenceEvent.action == "timeout") {
                        this.userDisconnect(presenceEvent.uuid);
                    }

                    // someone's state is updated
                    if(presenceEvent.action == "state-change") {
                        this.userUpdate(presenceEvent.uuid, presenceEvent.state);
                    }

                }

            };

            /**
             * Boolean value that indicates of the Chat is connected to the network.
             * @type {Boolean}
             */
            this.connected = false;

            /**
            * Connect to PubNub servers to initialize the chat.
            * @example
            * // create a new chatroom, but don't connect to it automatically
            * let chat = new Chat('some-chat', false)
            *
            * // connect to the chat when we feel like it
            * chat.connect();
            */
            this.connect = () => {

                if(!this.connected) {

                    if(!ChatEngine.pubnub) {
                        throwError(this, 'trigger', 'setup', new Error('You must call ChatEngine.connect() and wait for the $.ready event before creating new Chats.'));
                    }

                    // listen to all PubNub events for this Chat
                    ChatEngine.pubnub.addListener({
                        message: this.onMessage,
                        presence: this.onPresence
                    });

                    // subscribe to the PubNub channel for this Chat
                    ChatEngine.pubnub.subscribe({
                        channels: [this.channel],
                        withPresence: true
                    });

                }

            };

            /**
             * @private
             */
            this.onPrep = () => {

                if(autoConnect) {
                    this.connect();
                }

            }

            /**
             * @private
             */
            this.grant = () => {

                if(ceConfig.insecure) {
                    return this.onPrep();
                } else {

                    axios.post(ceConfig.authUrl + '/chat', {
                        authKey: pnConfig.authKey,
                        uuid: pnConfig.uuid,
                        channel: this.channel,
                        authData: ChatEngine.me.authData
                    })
                    .then((response) => {
                        this.onPrep();
                    })
                    .catch((error) => {

                        throwError(this, 'trigger', 'auth', new Error('Something went wrong while making a request to authentication server.'), {
                            error: error
                        });

                    });

                }

            }

            if(needGrant) {
                this.grant();
            } else {
                this.onPrep();
            }

            ChatEngine.chats[this.channel] = this;

        }

        /**
        * Send events to other clients in this {@link User}.
        * Events are trigger over the network  and all events are made
        * on behalf of {@link Me}
        *
        * @param {String} event The event name
        * @param {Object} data The event payload object
        * @example
        * chat.emit('custom-event', {value: true});
        * chat.on('custom-event', (payload) => {
        *     console.log(payload.sender.uuid, 'emitted the value', payload.data.value);
        * });
        */
        emit(event, data) {

            // create a standardized payload object
            let payload = {
                data: data,            // the data supplied from params
                sender: ChatEngine.me.uuid,   // my own uuid
                chat: this,            // an instance of this chat
            };

            // run the plugin queue to modify the event
            this.runPluginQueue('emit', event, (next) => {
                next(null, payload);
            }, (err, payload) => {

                // remove chat otherwise it would be serialized
                // instead, it's rebuilt on the other end.
                // see this.trigger
                delete payload.chat;

                // publish the event and data over the configured channel

                // ensure the event exists within the global space
                this.events[event] = this.events[event] || new Event(this, event);

                this.events[event].publish(payload);

            });

        }

        /**
        Broadcasts an event locally to all listeners.

        @private
        @param {String} event The event name
        @param {Object} payload The event payload object
        */
        trigger(event, payload) {

            if(typeof payload == "object") {

                // restore chat in payload
                if(!payload.chat) {
                    payload.chat = this;
                }

                // turn a uuid found in payload.sender to a real user
                if(payload.sender && ChatEngine.users[payload.sender]) {
                    payload.sender = ChatEngine.users[payload.sender];
                }

            }

            // let plugins modify the event
            this.runPluginQueue('on', event, (next) => {
                next(null, payload);
            }, (err, payload) => {

                // emit this event to any listener
                this._emit(event, payload);

            });

        }

        /**
        Add a user to the {@link Chat}, creating it if it doesn't already exist.

        @private
        @param {String} uuid The user uuid
        @param {Object} state The user initial state
        @param {Boolean} trigger Force a trigger that this user is online
        */
        createUser(uuid, state) {

            // Ensure that this user exists in the global list
            // so we can reference it from here out
            ChatEngine.users[uuid] = ChatEngine.users[uuid] || new User(uuid);

            // Add this chatroom to the user's list of chats
            ChatEngine.users[uuid].addChat(this, state);

            // trigger the join event over this chatroom
            if(!this.users[uuid]) {

                /**
                * Broadcast that a {@link User} has come online. This is when
                * the framework firsts learn of a user. This can be triggered
                * by, ```$.join```, or other network events that
                * notify the framework of a new user.
                *
                * @event Chat#$"."online"."here
                * @param {Object} data The payload returned by the event
                * @param {User} data.user The {@link User} that came online
                * @example
                * chat.on('$.online.here', (data) => {
                *     console.log('User has come online:', data.user);
                * });
                */
                this.trigger('$.online.here', {
                    user: ChatEngine.users[uuid]
                });

            }

            // store this user in the chatroom
            this.users[uuid] = ChatEngine.users[uuid];

            // return the instance of this user
            return ChatEngine.users[uuid];

        }

        /**
        * Update a user's state within this {@link Chat}.
        * @private
        * @param {String} uuid The {@link User} uuid
        * @param {Object} state State to update for the user
        */
        userUpdate(uuid, state) {

            // ensure the user exists within the global space
            ChatEngine.users[uuid] = ChatEngine.users[uuid] || new User(uuid);

            // if we don't know about this user
            if(!this.users[uuid]) {
                // do the whole join thing
                this.createUser(uuid, state);
            }

            // update this user's state in this chatroom
            this.users[uuid].assign(state, this);

            /**
            * Broadcast that a {@link User} has changed state.
            * @event Chat#$"."state
            * @param {Object} data The payload returned by the event
            * @param {User} data.user The {@link User} that changed state
            * @param {Object} data.state The new user state for this ```Chat```
            * @example
            * chat.on('$.state', (data) => {
            *     console.log('User has changed state:', data.user, 'new state:', data.state);
            * });
            */
            this.trigger('$.state', {
                user: this.users[uuid],
                state: this.users[uuid].state(this)
            });

        }

        /**
        * Leave from the {@link Chat} on behalf of {@link Me}.
        * @example
        * chat.leave();
        */
        leave() {

            ChatEngine.pubnub.unsubscribe({
                channels: [this.channel]
            });

        }

        /**
        Perform updates when a user has left the {@link Chat}.

        @private
        */
        userLeave(uuid) {

            // make sure this event is real, user may have already left
            if(this.users[uuid]) {

                // if a user leaves, trigger the event

                /**
                * Fired when a {@link User} intentionally leaves a {@link Chat}.
                *
                * @event Chat#$"."offline"."leave
                * @param {Object} data The data payload from the event
                * @param {User} user The {@link User} that has left the room
                * @example
                * chat.on('$.offline.leave', (data) => {
                *     console.log('User left the room manually:', data.user);
                * });
                */
                this.trigger('$.offline.leave', {
                    user: this.users[uuid]
                });

                // remove the user from the local list of users
                delete this.users[uuid];

                // we don't remove the user from the global list,
                // because they may be online in other channels

            } else {

                // that user isn't in the user list
                // we never knew about this user or they already left

                // console.log('user already left');
            }
        }

        /**
        Fired when a user disconnects from the {@link Chat}

        @private
        @param {String} uuid The uuid of the {@link Chat} that left
        */
        userDisconnect(uuid) {

            // make sure this event is real, user may have already left
            if(this.users[uuid]) {

                /**
                * Fired specifically when a {@link User} looses network connection
                * to the {@link Chat} involuntarily.
                *
                * @event Chat#$"."offline"."disconnect
                * @param {Object} data The {@link User} that disconnected
                * @param {Object} data.user The {@link User} that disconnected
                * @example
                * chat.on('$.offline.disconnect', (data) => {
                *     console.log('User disconnected from the network:', data.user);
                * });
                */

                this.trigger('$.offline.disconnect', {
                    user: this.users[uuid]
                });

            }

        }

        /**
        Load plugins and attach a queue of functions to execute before and
        after events are trigger or received.

        @private
        @param {String} location Where in the middleeware the event should run (emit, trigger)
        @param {String} event The event name
        @param {String} first The first function to run before the plugins have run
        @param {String} last The last function to run after the plugins have run
        */
        runPluginQueue(location, event, first, last) {

            // this assembles a queue of functions to run as middleware
            // event is a triggered event key
            let plugin_queue = [];

            // the first function is always required
            plugin_queue.push(first);

            // look through the configured plugins
            for(let i in this.plugins) {

                // if they have defined a function to run specifically
                // for this event
                if(this.plugins[i].middleware
                    && this.plugins[i].middleware[location]
                    && this.plugins[i].middleware[location][event]) {

                    // add the function to the queue
                    plugin_queue.push(
                        this.plugins[i].middleware[location][event]);
                }

            }

            // waterfall runs the functions in assigned order
            // waiting for one to complete before moving to the next
            // when it's done, the ```last``` parameter is called
            waterfall(plugin_queue, last);

        }

        /**
        Set the state for {@link Me} within this {@link User}.
        Broadcasts the ```$.state``` event on other clients

        @private
        @param {Object} state The new state {@link Me} will have within this {@link User}
        */
        setState(state) {

            ChatEngine.pubnub.setState(
                {
                    state: state,
                    channels: [this.channel]
                },
                (status, response) => {
                    // handle status, response
                }
            );

        }

        onConnectionReady() {

            /**
            * Broadcast that the {@link Chat} is connected to the network.
            * @event Chat#$"."connected
            * @example
            * chat.on('$.connected', () => {
            *     console.log('chat is ready to go!');
            * });
            */
            this.connected = true;

            this.trigger('$.connected');

            // get a list of users online now
            // ask PubNub for information about connected users in this channel
            ChatEngine.pubnub.hereNow({
                channels: [this.channel],
                includeUUIDs: true,
                includeState: true
            }, this.onHereNow);

        }

    };

    /**
    This is our User class which represents a connected client. User's are automatically created and managed by {@link Chat}s, but you can also instantiate them yourself.
    If a User has been created but has never been authenticated, you will recieve 403s when connecting to their feed or direct Chats.
    @class
    @extends Emitter
    @param uuid
    @param state
    @param chat
    */
    class User extends Emitter {

        constructor(uuid, state = {}, chat = ChatEngine.global) {

            super();

            /**
            The User's unique identifier, usually a device uuid. This helps ChatEngine identify the user between events. This is public id exposed to the network.
            Check out [the wikipedia page on UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier).

            @readonly
            @type String
            */
            this.uuid = uuid;

            /**
            A map of the User's state in each {@link Chat}. Stays in sync automatically.

            @private
            @type Object
            */
            this.states = {};

            /**
            * An object containing the Chats this {@link User} is currently in. The key of each item in the object is the {@link Chat.channel} and the value is the {@link Chat} object. Note that for privacy, this map will only contain {@link Chat}s that the client ({@link Me}) is also connected to.
            *
            * @readonly
            * @type Object
            * @example
            *{
            *    "globalChannel": {
            *        channel: "globalChannel",
            *        users: {
            *            //...
            *        },
            *    },
            *    // ...
            * }
            */
            this.chats = {};

            /**
            * Feed is a Chat that only streams things a User does, like
            * 'startTyping' or 'idle' events for example. Anybody can subscribe
            * to a User's feed, but only the User can publish to it. Users will
            * not be able to converse in this channel.
            *
            * @type Chat
            * @example
            * // me
            * me.feed.emit('update', 'I may be away from my computer right now');
            *
            * // another instance
            * them.feed.connect();
            * them.feed.on('update', (payload) => {})
            */

            // grants for these chats are done on auth. Even though they're marked private, they are locked down via the server
            this.feed = new Chat(
                [ChatEngine.global.channel, 'user', uuid, 'read.', 'feed'].join('#'), false, this.constructor.name == "Me");

            /**
            * Direct is a private channel that anybody can publish to but only
            * the user can subscribe to. Great for pushing notifications or
            * inviting to other chats. Users will not be able to communicate
            * with one another inside of this chat. Check out the
            * {@link Chat#invite} method for private chats utilizing
            * {@link User#direct}.
            *
            * @type Chat
            * @example
            * // me
            * me.direct.on('private-message', (payload) -> {
            *     console.log(payload.sender.uuid, 'sent your a direct message');
            * });
            *
            * // another instance
            * them.direct.connect();
            * them.direct.emit('private-message', {secret: 42});
            */
            this.direct = new Chat(
                [ChatEngine.global.channel, 'user', uuid, 'write.', 'direct'].join('#'), false, this.constructor.name == "Me");

            // if the user does not exist at all and we get enough
            // information to build the user
            if(!ChatEngine.users[uuid]) {
                ChatEngine.users[uuid] = this;
            }

            // update this user's state in it's created context
            this.assign(state, chat)

        }

        /**
        * Gets the user state in a {@link Chat}. See {@link Me#update} for how to assign state values.
        * @param {Chat} chat Chatroom to retrieve state from
        * @return {Object} Returns a generic JSON object containing state information.
        * @example
        *
        * // Global State
        * let globalState = user.state();
        *
        * // State in some channel
        * let someChat = new ChatEngine.Chat('some-channel');
        * let someChatState = user.state(someChat);s
        */
        state(chat = ChatEngine.global) {
            return this.states[chat.channel] || {};
        }

        /**
        * @private
        * @param {Object} state The new state for the user
        * @param {Chat} chat Chatroom to retrieve state from
        */
        update(state, chat = ChatEngine.global) {
            let chatState = this.state(chat) || {};
            this.states[chat.channel] = Object.assign(chatState, state);
        }

        /**
        this is only called from network updates

        @private
        */
        assign(state, chat) {
            this.update(state, chat);
        }

        /**
        adds a chat to this user

        @private
        */
        addChat(chat, state) {

            // store the chat in this user object
            this.chats[chat.channel] = chat;

            // updates the user's state in that chatroom
            this.assign(state, chat);
        }

    }

    /**
    Represents the client connection as a special {@link User} with write permissions.
    Has the ability to update it's state on the network. An instance of
    {@link Me} is returned by the ```ChatEngine.connect()```
    method.

    @class Me
    @param {String} uuid The uuid of this user
    @extends User
    */
    class Me extends User {

        constructor(uuid, authData) {

            // call the User constructor
            super(uuid);

            this.authData = authData;

        }

        // assign updates from network
        assign(state, chat) {
            // we call "update" because calling "super.assign"
            // will direct back to "this.update" which creates
            // a loop of network updates
            super.update(state, chat);

        }

        /**
        * Update {@link Me}'s state in a {@link Chat}. All {@link User}s in
        * the {@link Chat} will be notified of this change via ($.update)[Chat.html#event:$%2522.%2522state].
        * Retrieve state at any time with {@link User#state}.
        * @param {Object} state The new state for {@link Me}
        * @param {Chat} chat An instance of the {@link Chat} where state will be updated.
        * Defaults to ```ChatEngine.global```.
        * @fires Chat#event:$"."state
        * @example
        * // update global state
        * me.update({value: true});
        *
        * // update state in specific chat
        * let chat = new ChatEngine.Chat('some-chat');
        * me.update({value: true}, chat);
        */
        update(state, chat = ChatEngine.global) {

            // run the root update function
            super.update(state, chat);

            // publish the update over the global channel
            chat.setState(state);

        }

    }

    /**
    Provides the base Widget class...

    @class ChatEngine
    @extends RootEmitter
     */
    const init = function() {

        // Create the root ChatEngine object
        ChatEngine = new RootEmitter;

        /**
        * A map of all known {@link User}s in this instance of ChatEngine
        * @memberof ChatEngine
        */
        ChatEngine.users = {};

        /**
        * A map of all known {@link Chat}s in this instance of ChatEngine
        * @memberof ChatEngine
        */
        ChatEngine.chats = {};

        /**
        * A global {@link Chat} that all {@link User}s join when they connect to ChatEngine. Useful for announcements, alerts, and global events.
        * @member {Chat} global
        * @memberof ChatEngine
        */
        ChatEngine.global = false;

        /**
        * This instance of ChatEngine represented as a special {@link User} know as {@link Me}
        * @member {Me} me
        * @memberof ChatEngine
        */
        ChatEngine.me = false;

        /**
        * An instance of PubNub, the networking infrastructure that powers the realtime communication between {@link User}s in {@link Chats}.
        * @member {Object} pubnub
        * @memberof ChatEngine
        */
        ChatEngine.pubnub = false;

        /**
        * Indicates if ChatEngine has fired the {@link ChatEngine#$"."ready} event
        * @member {Object} ready
        * @memberof ChatEngine
        */
        ChatEngine.ready = false;

        /**
        * Connect to realtime service and create instance of {@link Me}
        * @method ChatEngine#connect
        * @param {String} uuid A unique string for {@link Me}. It can be a device id, username, user id, email, etc.
        * @param {Object} state An object containing information about this client ({@link Me}). This JSON object is sent to all other clients on the network, so no passwords!
        * * @param {Strung} authKey A authentication secret. Will be sent to authentication backend for validation. This is usually an access token or password. This is different from UUID as a user can have a single UUID but multiple auth keys.
        * @param {Object} [authData] Additional data to send to the authentication endpoint. Not used by ChatEngine SDK.
        * @fires $"."connected
        */
        ChatEngine.connect = function(uuid, state = {}, authKey = false, authData) {

            // this creates a user known as Me and
            // connects to the global chatroom

            pnConfig.uuid = uuid;

            let complete = () => {

                this.pubnub = new PubNub(pnConfig);

                // create a new chat to use as global chat
                // we don't do auth on this one becauseit's assumed to be done with the /auth request below
                this.global = new Chat(ceConfig.globalChannel, false, true);

                // create a new user that represents this client
                this.me = new Me(pnConfig.uuid, authData);

                // create a new instance of Me using input parameters
                this.global.createUser(pnConfig.uuid, state);

                this.me.update(state);

                /**
                 * Fired when ChatEngine is connected to the internet and ready to go!
                 * @event ChatEngine#$"."ready
                 */
                this.global.on('$.connected', () => {

                    this._emit('$.ready', {
                        me: this.me
                    });

                    this.ready = true;

                });



                /**
                Fires when PubNub network connection changes

                @private
                @param {Object} statusEvent The response status
                */
                this.pubnub.addListener({
                    status: (statusEvent) => {

                        /**
                        * SDK detected that network is online.
                        * @event ChatEngine#$"."network"."up"."online
                        */

                        /**
                        * SDK detected that network is down.
                        * @event ChatEngine#$"."network"."down"."offline
                        */

                        /**
                        * A subscribe event experienced an exception when running.
                        * @event ChatEngine#$"."network"."down"."issue
                        */

                        /**
                        * SDK was able to reconnect to pubnub.
                        * @event ChatEngine#$"."network"."up"."reconnected
                        */

                        /**
                        * SDK subscribed with a new mix of channels.
                        * @event ChatEngine#$"."network"."up"."connected
                        */

                        /**
                        * JSON parsing crashed.
                        * @event ChatEngine#$"."network"."down"."malformed
                        */

                        /**
                        * Server rejected the request.
                        * @event ChatEngine#$"."network"."down"."badrequest
                        */

                        /**
                        * If using decryption strategies and the decryption fails.
                        * @event ChatEngine#$"."network"."down"."decryption
                        */

                        /**
                        * Request timed out.
                        * @event ChatEngine#$"."network"."down"."timeout
                        */

                        /**
                        * PAM permission failure.
                        * @event ChatEngine#$"."network"."down"."denied
                        */

                        // map the pubnub events into chat engine events
                        let map = {
                            'PNNetworkUpCategory': 'up.online',
                            'PNNetworkDownCategory': 'down.offline',
                            'PNNetworkIssuesCategory': 'down.issue',
                            'PNReconnectedCategory': 'up.reconnected',
                            'PNConnectedCategory': 'up.connected',
                            'PNAccessDeniedCategory': 'down.denied',
                            'PNMalformedResponseCategory': 'down.malformed',
                            'PNBadRequestCategory': 'down.badrequest',
                            'PNDecryptionErrorCategory': 'down.decryption',
                            'PNTimeoutCategory': 'down.timeout'
                        };

                        let eventName = ['$', 'network', map[statusEvent.category]|| 'undefined'].join('.');

                        if(statusEvent.affectedChannels) {

                            statusEvent.affectedChannels.forEach((channel) => {

                                let chat = ChatEngine.chats[channel];

                                if(chat) {

                                    // connected category tells us the chat is ready
                                    if (statusEvent.category === "PNConnectedCategory") {
                                        chat.onConnectionReady();
                                    }

                                    // trigger the network events
                                    chat.trigger(eventName, statusEvent);


                                } else {

                                    this._emit(eventName, statusEvent);

                                }

                            });

                        } else {

                            this._emit(eventName, statusEvent);

                        }

                    }
                });


            }

            if(ceConfig.insecure) {
                complete();
            } else {

                pnConfig.authKey = authKey;



                axios.post(ceConfig.authUrl + '/auth', {
                    uuid: pnConfig.uuid,
                    channel: ceConfig.globalChannel,
                    authData: this.me.authData
                })
                .then((response) => {

                    complete();

                })
                .catch((error) => {

                    /**
                    * There was a problem logging in
                    * @event ChatEngine#$"."error"."auth
                    */
                    throwError(this, '_emit', 'auth', new Error('There was a problem logging into the auth server ('+ceConfig.authUrl+').'), {
                        error: error
                    });

                });

            }

        };

        /**
        * The {@link Chat} class.
        * @member {Chat} Chat
        * @memberof ChatEngine
        * @see {@link Chat}
        */
        ChatEngine.Chat = Chat;

        /**
        * The {@link User} class.
        * @member {User} User
        * @memberof ChatEngine
        * @see {@link User}
        */
        ChatEngine.User = User;

        // add an object as a subobject under a namespoace
        ChatEngine.addChild = (ob, childName, childOb) => {

            // assign the new child object as a property of parent under the
            // given namespace
            ob[childName] = childOb;

            // the new object can use ```this.parent``` to access
            // the root class
            childOb.parent = ob;

        }

        return ChatEngine;

    }

    // return an instance of ChatEngine
    return init();

}

// export the ChatEngine api
module.exports = {
    plugin: {},  // leave a spot for plugins to exist
    create: create
};
