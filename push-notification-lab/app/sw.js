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

// TODO 2.6 - Handle the notificationclose event
// When the user closes a notification, a notificationclose event is triggered in the service worker
/**
 * This code gets the notification object and its data from the event. This data can be anything we like. In this case, we get the value of the primaryKey property.

Note: The notificationclose event is a great place to add Google analytics to see how often users are closing our notifications. You can learn more about this in the Google Analytics lab.
 */
self.addEventListener('notificationclose', event => {
    const notification = event.notification;
    const primaryKey = notification.data.primaryKey;
  
    console.log('Closed notification: ' + primaryKey);
});

// TODO 2.7 - Handle the notificationclick event
/**
 * When the user clicks on a notification or notification action, a notificationclick event is triggered in the service worker.
 * 
 * Note: Notice we check for the "close" action first and handle the "explore" action in an else block. This is a best practice as not every platform supports action buttons, and not every platform displays all your actions. Handling actions in this way provides a default experience that works everywhere.
 */
self.addEventListener('notificationclick', event => {
    const notification = event.notification;
    const primaryKey = notification.data.primaryKey;
    const action = event.action;
  
    if (action === 'close') {
      notification.close();
    } else {
        /**
         * Note: The clients.openWindow method can only open a window when called as the result of a notificationclick event. Therefore, we need to wrap the clients.matchAll() method in a waitUntil, so that the event does not complete before openWindow is called. Otherwise, the browser throws an error.

            Explanation
            In this code we get all the clients of the service worker and assign the first "visible" client to the client variable. Then we open the page in this client. If there are no visible clients, we open the page in a new tab.
         */
        event.waitUntil(
            clients.matchAll().then(clis => {
              const client = clis.find(c => {
                return c.visibilityState === 'visible';
              });
              if (client !== undefined) {
                client.navigate('samples/page' + primaryKey + '.html');
                client.focus();
              } else {
                // there are no visible windows. Open one.
                clients.openWindow('samples/page' + primaryKey + '.html');
                notification.close();
              }
            })
          );
    }
  
    // TODO 5.3 - close all notifications when one is clicked
    /**
     * Note: If you don't want to clear out all of the notifications, you can filter based on the tag attribute by passing the tag into the getNotifications function. See the getNotifications reference on MDN for more information.

        Note: You can also filter out the notifications directly inside the promise returned from getNotifications. For example there might be some custom data attached to the notification that you would use as your filter criteria.

        Explanation
        In most cases, you send the user to the same page that has easy access to the other data that is held in the notifications. We can clear out all of the notifications that we have created by iterating over the notifications returned from the getNotifications method on our service worker registration and then closing each notification.
     */
    self.registration.getNotifications().then(notifications => {
        notifications.forEach(notification => {
          notification.close();
        });
      });
});

// TODO 3.1 - add push event listener
/**
 * This event handler displays a notification similar to the ones we've seen before. One important note is that the notification creation is wrapped in an event.waitUntil function. This extends the lifetime of the push event until the showNotification Promise resolves.
 * 
 * In this example, we're getting the data payload as text and setting it as the body of the notification.

We've now created everything necessary to handle the notifications in the client, but we have not yet sent the data from our server. That comes next.
 */
self.addEventListener('push', event => {
    let body;
  
    if (event.data) {
      body = event.data.text();
    } else {
      body = 'Default body';
    }
  
    const options = {
      body: body,
      icon: 'images/notification-flat.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {action: 'explore', title: 'Go to the site',
          icon: 'images/checkmark.png'},
        {action: 'close', title: 'Close the notification',
          icon: 'images/xmark.png'},
      ]
    };
    
    /**
     * The clients global object in the service worker lists all of the active clients of the service worker on this machine. If there are no clients active, we create a notification.

        If there are active clients it means that the user has your site open in one or more windows. The best practice is usually to relay the message to each of those windows.
     */
    event.waitUntil(
        clients.matchAll().then(c => {
          console.log(c);
          if (c.length === 0) {
            // Show notification
            self.registration.showNotification('Push Notification', options);
          } else {
            // Send a message to the page to update the UI
            console.log('Application is already open!');
          }
        })
    );

    /* ORIGINAL event.waitUntil()
    event.waitUntil(
      self.registration.showNotification('Push Notification', options)
    );
    */
  }); // end addEventListener()


/* ORIGINAL EVENT LISTENER
self.addEventListener('push', event => {
    const options = {
      body: 'This notification was generated from a push!',
      icon: 'images/notification-flat.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {action: 'explore', title: 'Go to the site',
          icon: 'images/checkmark.png'},
        {action: 'close', title: 'Close the notification',
          icon: 'images/xmark.png'},
      ]
    };
  
    event.waitUntil(
      self.registration.showNotification('Push Notification', options)
    );
  });

  */