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
const app = (() => {
  'use strict';

  let isSubscribed = false;
  let swRegistration = null;

  const notifyButton = document.querySelector('.js-notify-btn');
  const pushButton = document.querySelector('.js-push-btn');

  // TODO 2.1 - check for notification support
  // Because notifications are not yet fully supported by all browsers, we must check for support.
  // Note: In a practical application we would perform some logic to compensate for lack of support, but for our purposes we can log an error and return.
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications!');
    return;
  }

  // TODO 2.2 - request permission to show notifications
  //Before we can show notifications, we must get permission from the user.
  /**
   * The requestPermission method opens a popup when the user first lands on the page prompting them to allow or block notifications. Once the user accepts, you can display a notification. This permission status is stored in the browser, so calling this again returns the user's last choice.

    Note: In production, requesting permissions on page load is a poor user experience. Rather, permissions are better requested when a user opts into a specific feature that requires some permission.
   */
  Notification.requestPermission(status => {
    console.log('Notification permission status:', status);
  });


  function displayNotification() {

    // TODO 2.3 - display a Notification
    if (Notification.permission == 'granted') {
      navigator.serviceWorker.getRegistration().then(reg => {
    
        // TODO 2.4 - Add 'options' object to configure the notification
        /**
         * Whenever you create a notification with a tag and there is already a notification with the same tag visible to the user, the system automatically replaces it without creating a new notification.

          Your can use this to group messages that are contextually relevant into one notification. This is a good practice if your site creates many notifications that would otherwise become overwhelming to the user.
         */
        const options = {
          body: 'First notification!',
          tag: 'id1',
          icon: 'images/notification-flat.png',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
          },
        
          // TODO 2.5 - add actions to the notification
          /**
           * The actions array contains a set of action objects that define the buttons that we want to show to the user. Actions get an ID (the action property) when they are defined so that we can tell them apart in the service worker. We can also specify the display text (title), and add an optional image (icon).
           */
          actions: [
            {action: 'explore', title: 'Go to the site',
              icon: 'images/checkmark.png'},
            {action: 'close', title: 'Close the notification',
              icon: 'images/xmark.png'},
          ]

          // TODO 5.1 - add a tag to the notification
        
        };
        
        /**
         * showNotification has an optional second parameter that takes an object containing various configuration options. See the reference on MDN for more information on each option.

          Attaching data to the notification when you create it lets your app get that data back at some point in the future. Because notifications are created and live asynchronously with respect to the browser, you will often want to inspect the notification object after the user interacts with it, to determine what action to take. In practice, we can use a "key" (unique) property in the data to determine which notification was called. 
         */
        reg.showNotification('Hello world!', options);
      });
    }
  }

  function initializeUI() {

    // TODO 3.3b - add a click event listener to the "Enable Push" button
    // and get the subscription object
    /**
     * Here we add a click event listener to the Enable Push Messaging button in the page. The button calls unsubscribeUser() if the user is already subscribed, and subscribeUser() if they are not yet subscribed.

      We then get the latest subscription object from the pushManager. In a production app, this is where we would update the subscription object for this user on the server. For the purposes of this lab, updateSubscriptionOnServer() simply posts the subscription object to the page so we can use it later. updateBtn() updates the text content of the Enable Push Messaging button to reflect the current subscription status. You'll need to use these functions later, so make sure you understand them before continuing.
     */
    pushButton.addEventListener('click', () => {
      pushButton.disabled = true;
      if (isSubscribed) {
        unsubscribeUser();
      } else {
        subscribeUser();
      }
    });
    
    swRegistration.pushManager.getSubscription()
    .then(subscription => {
      isSubscribed = (subscription !== null);
      updateSubscriptionOnServer(subscription);
      if (isSubscribed) {
        console.log('User IS subscribed.');
      } else {
        console.log('User is NOT subscribed.');
      }
      updateBtn();
    });

  }

  // TODO 4.2a - add VAPID public key
  const applicationServerPublicKey = 'BFP2psc87HP6Bx7oxQxoV8xsMJy9kHhY7ZlWepJBHTg4ej8s5HCvGPNtlMaDOr2nQgVGgLhpHkZQNFbz6ok0DvQ';

  function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(subscription => {
      console.log('User is subscribed:', subscription);
      updateSubscriptionOnServer(subscription);
      isSubscribed = true;
      updateBtn();
    })
    .catch(err => {
      if (Notification.permission === 'denied') {
        console.warn('Permission for notifications was denied');
      } else {
        console.error('Failed to subscribe the user: ', err);
      }
      updateBtn();
    });
  } 

/** ORIGINAL subscribeUser() FUNCTION TO USE WITH FIREBASE
 * MY KEY WAS NOT WORKING, FOR SOME REASON FIREBASE VENDOR_ID DID NOT WORK
    // TODO 3.4 - subscribe to the push service
    /**
     * Here we subscribe to the pushManager. In production, we would then update the subscription object on the server.

      The .catch handles the case in which the user has denied permission for notifications. We might then update our app with some logic to send messages to the user in some other way.

      Note: We are setting the userVisibleOnly option to true in the subscribe method. By setting this to true, we ensure that every incoming message has a matching notification. The default setting is false. Setting this option to true is required in Chrome.

  function subscribeUser() {
    swRegistration.pushManager.subscribe({
      userVisibleOnly: true
    })
    .then(subscription => {
      console.log('User is subscribed:', subscription);
      updateSubscriptionOnServer(subscription);
      isSubscribed = true;
      updateBtn();
    })
    .catch(err => {
      if (Notification.permission === 'denied') {
        console.warn('Permission for notifications was denied');
      } else {
        console.error('Failed to subscribe the user: ', err);
      }
      updateBtn();
    });
 }
    **************************************************************/

  // Let's give users the ability to opt-out of the push subscription.
  function unsubscribeUser() {

    // TODO 3.5 - unsubscribe from the push service
    /**
     * Here we unsubscribe from the push service and then "update the server" with a null subscription object. We then update the page UI to show that the user is no longer subscribed to push notifications.
     */
    swRegistration.pushManager.getSubscription()
      .then(subscription => {
        if (subscription) {
          return subscription.unsubscribe();
        }
      })
      .catch(err => {
        console.log('Error unsubscribing', err);
      })
      .then(() => {
        updateSubscriptionOnServer(null);
        console.log('User is unsubscribed');
        isSubscribed = false;
        updateBtn();
      });

  }

  function updateSubscriptionOnServer(subscription) {
    // Here's where you would send the subscription to the application server

    const subscriptionJson = document.querySelector('.js-subscription-json');
    const endpointURL = document.querySelector('.js-endpoint-url');
    const subAndEndpoint = document.querySelector('.js-sub-endpoint');

    if (subscription) {
      subscriptionJson.textContent = JSON.stringify(subscription);
      endpointURL.textContent = subscription.endpoint;
      subAndEndpoint.style.display = 'block';
    } else {
      subAndEndpoint.style.display = 'none';
    }
  }

  function updateBtn() {
    if (Notification.permission === 'denied') {
      pushButton.textContent = 'Push Messaging Blocked';
      pushButton.disabled = true;
      updateSubscriptionOnServer(null);
      return;
    }

    if (isSubscribed) {
      pushButton.textContent = 'Disable Push Messaging';
    } else {
      pushButton.textContent = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
  }

  function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  notifyButton.addEventListener('click', () => {
    displayNotification();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      console.log('Service Worker and Push is supported');

      navigator.serviceWorker.register('sw.js')
      .then(swReg => {
        console.log('Service Worker is registered', swReg);

        swRegistration = swReg;

        // TODO 3.3a - call the initializeUI() function
        // Whenever the user opens the app, check for the subscription object and update the server and UI.
        initializeUI();
      })
      .catch(err => {
        console.error('Service Worker Error', err);
      });
    });
  } else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
  }

})();
