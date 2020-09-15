// cache the application shell during the install event
/**
 * We first define the files to cache and assign them to the filesToCache variable. These files make up the "application shell" (the static HTML,CSS, and image files that give your app a unified look and feel). We also assign a cache name to a variable so that updating the cache name (and by extension the cache version) happens in one place.

In the install event handler we create the cache with caches.open and use the addAll method to add the files to the cache. We wrap this in event.waitUntil to extend the lifetime of the event until all of the files are added to the cache and addAll resolves successfully.
 */

const filesToCache = [
    '/',
    'style/main.css',
    'images/still_life_medium.jpg',
    'index.html',
    'pages/offline.html',
    'pages/404.html'
];
  
const staticCacheName = 'pages-cache-v2';
  
self.addEventListener('install', event => {
    console.log('Attempting to install service worker and cache static assets');
    event.waitUntil(
      caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
    );
});

  //  intercept requests for those files from the network and respond with the files from the cache / caching predetermined files

  /**
   * The fetch event listener intercepts all requests. We use event.respondWith to create a custom response to the request. Here we are using the Cache falling back to network strategy: we first check the cache for the requested resource (with caches.match) and then, if that fails, we send the request to the network.
   */

self.addEventListener('fetch', event => {
    console.log('Fetch event for ', event.request.url);
    event.respondWith(
      caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Found ', event.request.url, ' in cache');
          return response;
        }
        console.log('Network request for ', event.request.url);
        return fetch(event.request)
  
        // TODO 4 - Add fetched files to the cache
        // dynamically add files to the cache as they are requested
        /**
         * Here we are taking the responses returned from the network requests and putting them into the cache.

            We need to pass a clone of the response to cache.put, because the response is a stream and can only be read once. See Jake Archibald's What happens when you read a response article for a more comprehensive explanation.
         */

        .then(response => {
            // TODO 5 - Respond with custom 404 page
            // respond with the 404.html page from the cache if the response status is 404
            /**
             * Network response errors do not cause a fetch promise to reject. Instead, fetch promises resolve with the response object containing the network error code. This means we handle network errors explicitly by checking the response status. fetch promises only reject when the browser cannot reach the network in the first place (user is offline).

                Note: When intercepting a network request and serving a custom response, the service worker does not redirect the user to the address of the new response. The response is served at the address of the original request. For example, if the user requests a nonexistent file at www.example.com/non-existent.html and the service worker responds with a custom 404 page, 404.html, the custom page will display at www.example.com/non-existent.html, not www.example.com/404.html
             */
            if (response.status === 404) {
                return caches.match('pages/404.html');
            }
            return caches.open(staticCacheName).then(cache => {
              cache.put(event.request.url, response.clone());
              return response;
            });
          });
  
      }).catch(error => {
  
        // TODO 6 - Respond with custom offline page
        // respond with the offline.html page from the cache. The catch will trigger if the fetch to the network fails
        // If fetch cannot reach the network, it rejects with an error and triggers the .catch
        console.log('Error, ', error);
        return caches.match('pages/offline.html');
      })
    );
});

// get rid of unused caches in the service worker "activate" event
/**
 * It's important to remove outdated resources to conserve space on users' devices. We delete old caches in the activate event to ensure that we aren't deleting caches before the new service worker has taken over the page (in case the new service worker activation fails, in which case we don't want to remove the existing service worker's caches). To remove outdated caches, we create an array of caches that are currently in use and delete all other caches
 */

self.addEventListener('activate', event => {
    console.log('Activating new service worker...');
  
    const cacheWhitelist = [staticCacheName];
  
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
});