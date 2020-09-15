/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * We are using the web-push library for Node.js to simplify the syntax for sending a message to the push service. This library takes care of encrypting the message with the public encryption key. The code we added to node/main.js configures the server key (for Chrome), payload, and push subscription. These configuration options are then passed to the sendNotification method.
 */

// TODO 3.8 - push a message using the web push library
const webPush = require('web-push');

const pushSubscription = {"endpoint":"https://fcm.googleapis.com/fcm/send/eH60453RFCc:APA91bG6husQEEXiO6h_dWkgY2s-t_XPFlpzOHmWFI0ksPS3v7ZlHjPWzTY1KXwJnK7-M2dh_F04NfcFS3a8xjLuXxYLaLEdo-Ec7iJW1I9QLRzPHVaEhKMaR7ybYUQ3p50uGiXtv4vB","expirationTime":null,"keys":{"p256dh":"BETNoaVnLUfdzCgdpjtHz5Zx3fR-MHgVH_SqM8H1gbBE1I-53L-EbdVNCAxynjcWIAyviKaU_fqTIrvL9Gv8Lsk","auth":"FjB4Ed3TnKZJA77_LB_HaA"}};

/**
 * Both Chrome and Firefox support the The Voluntary Application Server Identification for Web Push (VAPID) protocol for the identification of your service.

The web-push library makes using VAPID relatively simple, but the process is a bit more involved behind the scenes. For a full explanation of VAPID, see the links below.
 */

// TODO 4.3a - include VAPID keys
const vapidPublicKey = 'BFP2psc87HP6Bx7oxQxoV8xsMJy9kHhY7ZlWepJBHTg4ej8s5HCvGPNtlMaDOr2nQgVGgLhpHkZQNFbz6ok0DvQ';
const vapidPrivateKey = 'Rc8gmNAbaIVIblBvPH5RGfzvcIsIibXevHoMgWrWoww';

const payload = 'Here is a payload!';

const options = {
  //gcmAPIKey: 'YOUR_SERVER_KEY',
  TTL: 60,

  // TODO 4.3b - add VAPID details
  vapidDetails: {
    subject: 'mailto: eriukristene@gmail.com',
    publicKey: vapidPublicKey,
    privateKey: vapidPrivateKey
  }
};

webPush.sendNotification(
  pushSubscription,
  payload,
  options
);