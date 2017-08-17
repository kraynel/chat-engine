## Auth Url

ChatEngine uses PubNub Functions to handle {@link Chat} privacy.

When the {@link ChatEngine#connect} method is invoked, ChatEngine will make an authentication request to ```ceConfig.authUrl```. This url is responsible for granting the uuid permission to access the network.

### Insecure Mode

**If ```ceConfig.authUrl``` is omitted, the app is run in ```insecure``` mode**.

In insecure mode, all {@link User}s can access all {@link Chat}s and nothing is private (none of the below applies). This is not recommended and a warning will be logged to console.

## Chat Security

### Public Chat

```js
new Chat('channel', false);
```

This is a public chat any {@link User} can join.

### Private Chat

```js
new Chat('channel', true);
```

This is a private chat that a user must authenticated in. Usually this is done via {@link Chat#invite}.

### User Direct

{@link User#direct}

This is a private chat that anybody can write to but only the user can read.

### User Feed

{@link User#feed}

This is a public chat that anybody can read but only the user can write to.

## PubNub Security

Security is controlled via [PubNub PAM](https://www.pubnub.com/docs/tutorials/pubnub-access-manager).
