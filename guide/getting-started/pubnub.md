## How to Get Your PubNub Keys

Navigate to http://admin.pubnub.com and login or create an account. Don't worry, it's free!

https://admin.pubnub.com

Click "New App."

![](assets/README-ddad3667.png)

Give your new app a name and click "Create."

![](assets/README-a6e543f2.png)

Click on your keyset.

![](assets/README-84f858cd.png)

Copy and paste those keys into your ```app.js```.

```js
const ChatEngine = ChatEngineCore.create({
    publishKey: 'YOUR_PUB_KEY',
    subscribeKey: 'YOUR_SUB_KEY'
});
```

![](assets/README-943bee9f.png)


Scroll down and enable PubNub Presence.

![](assets/README-29b7db60.png)

> Not yet supported.
> Enable PubNub Access Manager.
> ![](assets/README-ad7eda0b.png)

Scroll down and enable PubNub Storage and Playback. "Retention" is how long messages will be stored in chatrooms.

![](assets/README-755671fd.png)

Click "Save Changes."

![](assets/README-8e5db3c0.png)
