# Set up tutorial with index.html, bootstrap, jQuery

Let's get started. In this tutorial, we'll be using:

- NodeJS
- Twitter Bootstrap
- jQuery
- PubNub Chat Engine

If you're not familiar with these, don't worry. They'll be helpful links along
the way.


## Install Twitter Bootstrap

Twitter Bootstrap will make it easy for us to create user interface elements for our chat application.

In fact, when using PubNub Chat Engine, creating the UI and hooking it up to the framework is about all you have to do.

We'll use bootstrap 3 since it's the latest stable version. You can install it using npm by running:

```
npm install bootstrap@3 --save
```

## Install jQuery

jQuery will provide us with some simple utilities for Javascript that will make programming our chat application easier. You can install it using npm by running:

```sh
npm install jquery --save
```

> You don't have to use jQuery with PubNub Chat Engine. We could use Angular, React, or just vanilla Javscript. The [Chat Engine Examples](https://github.com/pubnub/chat-engine-examples) page has examples for these other frameworks.

## Install http-server globally

Finally, we need a way to run our app. Sure, we could just load them with the ```file://``` protocol, but that creates all sorts of security issues and problems in the future. It's better to start with ```localhost```.

Install ```http-server``` globally using npm:

```sh
npm install http-server -g
```

This allows us to run a small http server on ```localhost``` that will serve our files properly.

# Build an example page and load dependencies

Alright, now it's time for the fun stuff. Let's create an example page.

Create a new page called ```index.html``` and paste the following page in. It will load the CSS, JS, and there's even a small script to test that all the libraries have been loaded.

```html
<html>
  <head>
    <link rel="stylesheet" type="text/css" href="node_modules/bootstrap/dist/css/bootstrap.css" />
  </head>
  <body>
    <div class="container">
        <div class="row">
            <div class="col-lg-12">
                <h1>Does it work?</h1>
                <div class="alert alert-info">Let's find out.</div>
            </div>
        </div>
    </div>
    <script type="text/javascript" src="node_modules/jquery/dist/jquery.js"></script>
    <script type="text/javascript" src="node_modules/bootstrap/dist/js/bootstrap.js"></script>
    <script type="text/javascript" src="node_modules/chat-engine/dist/chat-engine.js"></script>
    <script type="text/javascript">
    if(typeof $ == "undefined") {
      alert('Failed to load jQuery!');
    }
    if(typeof ChatEngineCore == "undefined") {
      alert('Failed to load PubNub Chat Engine');
    }
    if($ && ChatEngineCore) {
      alert('It works!');
    }
    </script>
  </body>
</html>
```

Once you've pasted this code, run the ```http-server``` command in your terminal and load the webpage in your browser.

```sh
http-server
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://192.168.0.8:8080
Hit CTRL-C to stop the server
```

Load http://127.0.0.1:8080 in your browser and see if the webpage looks like this screenshot:

![](/guide/getting-started/assets/README-988df6e2.png)

If you get an error alert, make sure you ran all the previous setup instructions properly. If the design does not look correct, make sure you installed the correct version of Twitter Bootstrap.

---

## Configure PubNub keys and how to get them

Update ```index.html``` to look like this:

```html
<html>
  <head>
    <link rel="stylesheet" type="text/css" href="node_modules/bootstrap/dist/css/bootstrap.css" />
  </head>
  <body>
    <div class="container">
    </div>
    <script type="text/javascript" src="node_modules/jquery/dist/jquery.js"></script>
    <script type="text/javascript" src="node_modules/bootstrap/dist/js/bootstrap.js"></script>
    <script type="text/javascript" src="node_modules/chat-engine/dist/chat-engine.js"></script>
    <script type="text/javascript" src="app.js"></script>
  </body>
</html>
```

Create a new file called ```app.js``` in the local dir. In ```app.js```:.
## Start the Chat Engine

In ```app.js```, add the line:

[chats concept]

[online list concept]

Chat Engine specific events begin with ```$```.

For example, you can find out when you're connected to a chatroom by subscribing to the ```$.ready``` event.

## Working with Chats and Users in jQuery

Let's combine the information above into a small app that logs when you and other users come online.

![](/guide/getting-started/assets/README-c71c143b.png)

First, we'll create a function to log messages into HTML.

Add the following to the ```<body>``` of ```index.html``` to build a place-holder for our log.

```html
<div class="container">
  <div class="row">
      <div class="col-sm-6 col-sm-offset-3">
        <div class="list-group" id="log">
        </div>
      </div>
  </div>
</div>
```

Next, we'll create a function that adds  ```username: text``` as a line in the log.

```js
const appendMessage = (username, text) => {

  let message =
    $(`<div class="list-group-item" />`)
      .append($('<strong>').text(username + ': '))
      .append($('<span>').text(text));

  $('#log').append(message);

  $("#log").animate({ scrollTop: $('#log').prop("scrollHeight") }, "slow");

};
```

Then, listen for the ```$.ready``` event to find out when the client is connected to the ```Chat```.

```js
chat.on('$.ready', (payload) => {
  appendMessage('Status', 'Connected to chat!');
});
```

We can also subscribe to the ```$.online``` event to find out when other ```User```s are online.

```js
chat.on('$.online', (payload) => {
  appendMessage('Status', payload.user.uuid + ' has come online!');
});
```

You should see a message showing that ```ian``` has come online and that connection has been established.

![](/guide/getting-started/assets/README-c71c143b.png)

# Chat room event overview and how it works

But what about custom messages? The life-blood of chat! Custom messages sent by each user.

[events concept]
[payload concept]

## Adding a Textbox

Let's build a textbox that will let us send our own message.

We'll add this line under the ```#log``` container.

```html
<input type="text" class="form-control" id="message" placeholder="Your message here...">
```

And then wrap the ```chat.emit()``` code in a jQuery function.

```js
$("#message").keypress(function(event) {

    if (event.which == 13) {
        chat.emit('message', $("#message").val());
        $("#message").val('');
        event.preventDefault();
    }

});
```

This function fires every time a key is pressed on the message input text area.

If the key is ```13``` (Enter or Return), we use ```chat.emit()``` to broadcast the value of the the text input to all other clients.

The text input is then cleared and we user ```event.preventDefault()``` to prevent the enter or return key from bubbling (allowing other things to happen).

## Send a Message

Now, when you type in the message input and hit "Enter", the message is sent over the network to all other machines!

Try it with two browsers!

![](/guide/getting-started/assets/README-316b8bd1.gif)

But hey, it looks like every message is sent by "ian". Shouldn't different browsers have different names? How do we differentiate between clients?

## Add Usernames and State

[username concept (part of me)]

[state concept]

# plugin for random usernames

# state

# Build a chat room
# Send a user a private message
# See when a user does something somewhere else
# Get the history of a room
# Make another event type (add an image via a url)
# Add a plugin
# Make your own plugin
