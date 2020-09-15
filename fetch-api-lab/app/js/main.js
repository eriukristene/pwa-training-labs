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

// helper functions ----------

function logResult(result) {
  console.log(result);
}

function logError(error) {
  console.log('Looks like there was a problem:', error);
}


// Fetch JSON ----------

function fetchJSON() {
  fetch('examples/animals.json') // 1
    .then(validateResponse) // 2
    .then(readResponseAsJSON) // 3
    .then(logResult) // 4
    .catch(logError);

    /**
     * The fetch method accepts the path for the resource we want to retrieve as a parameter, in this case examples/animals.json. fetch returns a promise that resolves to a Response object. If the promise resolves, the response is passed to the logResult function. If the promise rejects, the catch takes over and the error is passed to the logError function.

    Response objects represent the response to a request. They contain the response body and also useful properties and methods.

    Step 1. Fetch is called on a resource, examples/animals.json. Fetch returns a promise that resolves to a Response object. When the promise resolves, the response object is passed to validateResponse.

    Step 2. validateResponse checks if the response is valid (is it a 200?). If it isn't, an error is thrown, skipping the rest of the then blocks and triggering the catch block. This is particularly important. Without this check bad responses are passed down the chain and could break later code that may rely on receiving a valid response. If the response is valid, it is passed to readResponseAsJSON.

    Step 3. readResponseAsJSON reads the body of the response using the Response.json() method. This method returns a promise that resolves to JSON. Once this promise resolves, the JSON data is passed to logResult. (If the promise from response.json() rejects, the catch block is triggered.)

    Step 4. Finally, the JSON data from the original request to examples/animals.json is logged by logResult.

     * 
     */
}

function validateResponse(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;

  /**
   * Now that we have added the validateResponse check, bad responses (like 404s) throw an error and the catch takes over. This allows us to handle failed responses and prevents unexpected responses from propagating down the fetch chain.
   */

}

function readResponseAsJSON(response) {
  return response.json();
}

const jsonButton = document.getElementById('json-btn');
jsonButton.addEventListener('click', fetchJSON);


// Fetch Image ----------
/**
 * In this example an image is being fetched, examples/fetching.jpg. Just like in the previous exercise, the response is validated with validateResponse. The response is then read as a Blob (instead of JSON as in the previous section). An image element is created and appended to the page, and the image's src attribute is set to a data URL representing the Blob.

Note: The URL object's createObjectURL() method is used to generate a data URL representing the Blob. This is important to note. You cannot set an image's source directly to a Blob. The Blob must be converted into a data URL.
 * 
 */
function showImage(responseAsBlob) {
  const container = document.getElementById('img-container');
  const imgElem = document.createElement('img');
  container.appendChild(imgElem);
  const imgUrl = URL.createObjectURL(responseAsBlob);
  imgElem.src = imgUrl;
}

function readResponseAsBlob(response) {
  return response.blob();
}

function fetchImage() {
  fetch('examples/fetching.jpg')
    .then(validateResponse)
    .then(readResponseAsBlob)
    .then(showImage)
    .catch(logError);
}

const imgButton = document.getElementById('img-btn');
imgButton.addEventListener('click', fetchImage);


// Fetch text ----------

/**
 * fetch /examples/words.txt
   validate the response with validateResponse
   read the response as text (hint: see Response.text())
   and display the text on the page

   Note: While it may be tempting to fetch HTML and append it using the innerHTML attribute, be careful. This can expose your site to cross-site scripting attacks!
 */

function fetchText() {
  fetch('examples/words.txt')
    .then(validateResponse)
    .then(readResponseAsText)
    .then(showText)
    .catch(logError);
}

function showText(responseAsText) {
  const message = document.getElementById('message');
  message.textContent = responseAsText;
}

function readResponseAsText(response) {
  return response.text();
}

const textButton = document.getElementById('text-btn');
textButton.addEventListener('click', fetchText);


// HEAD request ----------

/*
The fetch method can receive a second optional parameter, init. This parameter enables the configuration of the fetch request, such as the request method, cache mode, credentials, and more.

In this example we set the fetch request method to HEAD using the init parameter. HEAD requests are just like GET requests, except the body of the response is empty. This kind of request can be used when all you want is metadata about a file but don't need to transport all of the file's data.

In this example, the HEAD method is used to request the size (in bytes) of a resource (represented in the content-length header) without actually loading the resource itself. In practice this could be used to determine if the full resource should be requested (or even how to request it).
 */

function headRequest() {
    fetch('examples/words.txt', {
      method: 'HEAD'
    })
    .then(validateResponse)
    // .then(readResponseAsText) if this is uncommented, logSize() won't work
    .then(logSize)
    //.then(logResult) if this is uncommented, logSize() won't work
    .catch(logError);
}
const headButton = document.getElementById('head-btn');
headButton.addEventListener('click', headRequest);

function logSize(response) {
  const url = response.url;
  const size = response.headers.get('content-length');
  console.log(`${url} is ${size} bytes`);
}


// POST request ----------

/**
 * To make a POST request with fetch, we use the init parameter to specify the method (similar to how we set the HEAD method in the previous section). This is also where we set the body of the request, in this case a simple string. The body is the data we want to send.

Note: In production, remember to always encrypt any sensitive user data.

When data is sent as a POST request to localhost:5000/, the request is echoed back as the response. The response is then validated with validateResponse, read as text, and displayed on the page.

In practice, this server would represent a 3rd party API.

The FormData constructor can take in an HTML form, and create a FormData object. This object is populated with the form's keys and values.

this is for the original first version of hte postRequest() function
 */


/* NOTE: Never send unencrypted user credentials in production! */

/**
 * Fetch (and XMLHttpRequest) follow the same-origin policy. This means that browsers restrict cross-origin HTTP requests from within scripts. A cross-origin request occurs when one domain (for example http://foo.com/) requests a resource from a separate domain (for example http://bar.com/).

Note: Cross-origin request restrictions are often a point of confusion. Many resources like images, stylesheets, and scripts are fetched across domains (i.e., cross-origin). However, these are exceptions to the same-origin policy. Cross-origin requests are still restricted from within scripts.

Since our app's server has a different port number than the two echo servers, requests to either of the echo servers are considered cross-origin. The first echo server, however, running on localhost:5000/, is configured to support CORS (you can open echo-servers/cors-server.js and examine the configuration). The new echo server, running on localhost:5001/, is not (which is why we get an error).

Using mode: no-cors allows fetching an opaque response. This allows use to get a response, but prevents accessing the response with JavaScript (which is why we can't use validateResponse, readResponseAsText, or showResponse). The response can still be consumed by other APIs or cached by a service worker.
 */
/*
function postRequest() {
  const formData = new FormData(document.getElementById('msg-form'));
  fetch('http://localhost:5001/', {
    method: 'POST',
    body: formData,
    mode: 'no-cors'
  })
    .then(logResult)
    .catch(logError);
}
*/

// first version of this function
/**
 * The Header interface enables the creation and modification of Headers objects. Some headers, like Content-Type can be modified by fetch. Others, like Content-Length, are guarded and can't be modified (for security reasons).
 * 
 * Like cross-origin requests, custom headers must be supported by the server from which the resource is requested. In this example, our echo server is configured to accept the X-Custom header but not the Y-Custom header (you can open echo-servers/cors-server.js and look for Access-Control-Allow-Headers to see for yourself). Anytime a custom header is set, the browser performs a preflight check. This means that the browser first sends an OPTIONS request to the server, to determine what HTTP methods and headers are allowed by the server. If the server is configured to accept the method and headers of the original request, then it is sent, otherwise an error is thrown.
 */
function postRequest() {
  const formData = new FormData(document.getElementById('msg-form'));
  const messageHeaders = new Headers({
    'Content-Type': 'application/json',
    // 'Content-Length': 'kittens' // Content-Length can't be modified!
    'X-Custom': 'hello world',
    // 'Y-Custom': 'this will not work' // Y-Custom is not accepted by our echo server!
  })
  fetch('http://localhost:5000/', {
    method: 'POST',
    // body: formData,
    body: JSON.stringify({ lab: 'fetch', status: 'fun' }),
    headers: messageHeaders
  })
    .then(validateResponse)
    .then(readResponseAsText)
    .then(showText)
    .catch(logError);
}


const postButton = document.getElementById('post-btn');
postButton.addEventListener('click', postRequest);
