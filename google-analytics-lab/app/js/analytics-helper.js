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

// TODO Add your tracking ID
// Set this to your tracking ID: UA-XXXXXXXX-Y
/**
 *  creating a variable with your tracking ID. The Measurement Protocol needs this to identify your property, just like in the analytics snippet.
 */
const trackingId = 'UA-173939373-1';

// TODO Add the Measurement Protocol helper function
/**
 * The sendAnalyticsEvent helper function starts by checking that the tracking ID is set and that the function is being called with the correct parameters. After checking that the client is subscribed to push, the analytics data is created in the payloadData variable
 */
const sendAnalyticsEvent = (eventAction, eventCategory) => {

    console.log('Sending analytics event: ' + eventCategory + '/' + eventAction);
  
    if (!trackingId) {
      console.error('You need your tracking ID in analytics-helper.js');
      console.error('Add this code:\nconst trackingId = \'UA-XXXXXXXX-X\';');
      // We want this to be a safe method, so avoid throwing unless absolutely necessary.
      return Promise.resolve();
    }
  
    if (!eventAction && !eventCategory) {
      console.warn('sendAnalyticsEvent() called with no eventAction or ' +
      'eventCategory.');
      // We want this to be a safe method, so avoid throwing unless absolutely necessary.
      return Promise.resolve();
    }
  
    return self.registration.pushManager.getSubscription()
    .then(subscription => {
      if (subscription === null) {
        throw new Error('No subscription currently available.');
      }

      /**
       * analytics data is created in the payloadData variable
       * 
       * The version number, client ID, tracking ID, and hit type parameters are required by the API. The event category, event action, and event label are the same parameters that we have been using with the gtag.js interface.
       */
  
      // Create hit data
      const payloadData = {
        // Version Number
        v: 1,
        // Client ID
        cid: subscription.endpoint,
        // Tracking ID
        tid: trackingId,
        // Hit Type
        t: 'event',
        // Event Category
        ec: eventCategory,
        // Event Action
        ea: eventAction,
        // Event Label
        el: 'serviceworker'
      };
  
      // Format hit data into URI
      const payloadString = Object.keys(payloadData)
      .filter(analyticsKey => {
        return payloadData[analyticsKey];
      })
      .map(analyticsKey => {
        return analyticsKey + '=' + encodeURIComponent(payloadData[analyticsKey]);
      })
      .join('&');
  
      // Post to Google Analytics endpoint
      return fetch('https://www.google-analytics.com/collect', {
        method: 'post',
        body: payloadString
      });
    })
    .then(response => {
      if (!response.ok) {
        return response.text()
        .then(responseText => {
          throw new Error(
            'Bad response from Google Analytics:\n' + response.status
          );
        });
      } else {
        console.log(eventCategory + '/' + eventAction +
          ' hit sent, check the Analytics dashboard');
      }
    })
    .catch(function(err) {
      console.warn('Unable to send the analytics event', err);
    });
  };

/**
 * We start by using ImportScripts to import the analytics-helper.js file with our sendAnalyticsEvent helper function. This function is used send custom events at appropriate places (such as when push events are received, or notifications are interacted with). The eventAction and eventCategory that we want to associate with the event are passed in as parameters.

Note: event.waitUntil extends the life of an event until the asynchronous actions inside of it have completed. This ensures that the service worker will not be terminated preemptively while waiting for an asynchronous action to complete.
 */