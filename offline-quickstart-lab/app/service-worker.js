/*

Once the service worker is registered by the registration script in index.html, the service worker install event occurs. During this event, the install event listener opens a named cache, and caches the files specified with the cache.addAll method. This is called "precaching" because it happens during the install event, which is typically the first time a user visits your site.

After a service worker is installed, and if another service worker is not currently controlling the page, the new service worker is "activated" (the activate event listener is triggered in the service worker) and it begins controlling the page.

When resources are requested by a page that an activated service worker controls, the requests pass through the service worker, like a network proxy. A fetch event is triggered for each request. In our service worker, the fetch event listener searches the caches and responds with the cached resource if it's available. If the resource isn't cached, the resource is requested normally.

Caching resources allows the app to work offline by avoiding network requests. Now our app can respond with a 200 status code when offline!

Note: The activate event isn't used for anything besides logging in this example. The event was included to help debug service worker lifecycle issues.

*/

const cacheName = 'cache-v1';
const precacheResources = [
  '/',
  'index.html',
  'styles/main.css',
  'images/space1.jpg',
  'images/space2.jpg',
  'images/space3.jpg'
];

self.addEventListener('install', event => {
  console.log('Service worker install event!');
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(precacheResources);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service worker activate event!');
});

self.addEventListener('fetch', event => {
  console.log('Fetch intercepted for:', event.request.url);
  event.respondWith(caches.match(event.request)
    .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      })
    );
});
