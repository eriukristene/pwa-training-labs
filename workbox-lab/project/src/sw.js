/**
 * Explanation
In this code, the importScripts call imports the workbox-sw.js library from a Content Delivery Network (CDN). Once the library is loaded, the workbox object gives our service worker access to all the Workbox modules.

The precacheAndRoute method of the precaching module takes a precache "manifest" (a list of file URLs with "revision hashes") to cache on service worker installation. It also sets up a cache-first strategy for the specified resources, serving them from the cache by default.

Currently, the array is empty, so no files will be cached.

Rather than adding files to the list manually, workbox-build can generate the manifest for us. Using a tool like workbox-build has multiple advantages:

The tool can be integrated into our build process. Adding workbox-build to our build process eliminates the need for manual updates to the precache manifest each time that we update the apps files.
workbox-build automatically adds "revision hashes" to the files in the manifest entries. The revision hashes enable Workbox to intelligently track when files have been modified or are outdated, and automatically keep caches up to date with the latest file versions. Workbox can also remove cached files that are no longer in the manifest, keeping the amount of data stored on a user's device to a minimum. You'll see what workbox-build and the file revision hashes look like in the next section.
 */

 /**
 * In addition to precaching, the precacheAndRoute method sets up an implicit cache-first handler, ensuring that the precached resources are served offline.

Note: Workbox also handles an edge case that we haven't mentioned. Workbox knows to serve my-domain/index.html even if my-domain/ is requested! With this functionality, you don't have to manage multiple cached resources (one for index.html and one for /).
 */


importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);

  workbox.precaching.precacheAndRoute([]);

  /**
   * 
   * The registerRoute method on the routing class adds a route to the service worker. The first parameter in registerRoute is a regular expression URL pattern to match requests against. The second parameter is the handler that provides a response if the route matches. In this case the route uses the strategies class to access the cacheFirst run-time caching strategy. This means that whenever the app requests article images, the service worker checks the cache first for the resource before going to the network.

    The handler in this code also configures Workbox to maintain a maximum of 50 images in the cache (ensuring that user's devices don't get filled with excessive images). Once 50 images has been reached, Workbox will remove the oldest image automatically. The images are also set to expire after 30 days, signaling to the service worker that the network should be used for those images.
   */
  workbox.routing.registerRoute(
    /(.*)articles(.*)\.(?:png|gif|jpg)/,
    workbox.strategies.cacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        })
      ]
    })
  );


/**
     * Sometimes content must always be kept up-to-date (e.g., news articles, stock figures, etc.). For this kind of data, the cacheFirst strategy is not the best solution. Instead, we can use the networkFirst strategy to fetch the newest content first, and only if that fails does the service worker get old content from the cache.
     * 
     * Here we are using the networkFirst strategy to handle a resource we expect to update frequently (trending news articles). This strategy updates the cache with the newest content each time it's fetched from the network.

    Unlike the images route established in the previous step, the code above uses the handle method on the built-in networkFirst strategy. The handle method takes the object passed to the handler function (in this case we called it args) and returns a promise that resolves with a response. We could have passed in the caching strategy directly to the second argument of registerRoute as we did in the previous example, but instead we return a call to the handle method in a custom handler function. This technique gives us access to the response, as you'll see in the next step.
 */
const articleHandler = workbox.strategies.networkFirst({
    cacheName: 'articles-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50,
      })
    ]
  });
  
  /**
   * The .then statement receives the response passed in from the handle method. If the response doesn't exist, then it means the user is offline and the response was not previously cached. Instead of letting the browser show a default offline page, the service worker returns the custom offline page that was precached. If the response exists but the status is 404, then our custom 404 page is returned. Otherwise, we return the original response.
   */
  workbox.routing.registerRoute(/(.*)article(.*)\.html/, args => {
    return articleHandler.handle(args).then(response => {
      if (!response) {
        return caches.match('pages/offline.html');
      } else if (response.status === 404) {
        return caches.match('pages/404.html');
      }
      return response;
    });
  });

  /**
   * Add a final service worker route for the app's "post" pages (pages/   post1.html, pages/post2.html, etc.).
    The route should use Workbox's cacheFirst strategy, creating a cache called "posts-cache" that stores a maximum of 50 entries.
    If the caches or network returns a resources with a 404 status, then return the pages/404.html resource.
    If the resource is not available in the cache, and the app is offline, then return the pages/offline.html resource.
   */
  const postHandler = workbox.strategies.cacheFirst({
    cacheName: 'posts-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50,
      })
    ]
  });

  workbox.routing.registerRoute(/(.*)pages\/post(.*)\.html/, args => {
    console.log('test');
    return postHandler.handle(args).then(response => {
      if (response.status === 404) {
        return caches.match('pages/404.html');
      }
      return response;
    })
    .catch(function() {
      return caches.match('pages/offline.html');
    });
  });

} else {
  console.log(`Boo! Workbox didn't load 😬`);
}