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
/*jshint esversion: 6*/

const app = (() => {

  function getImageName(country) {
    // create and return a promise
      country = country.toLowerCase();
      const promiseOfImageName = new Promise((resolve, reject) => {
        setTimeout(() => {
          if (country === 'spain' || country === 'chile' || country === 'peru') {
            resolve(country + '.png');
          } else {
            reject(Error('Didn\'t receive a valid country name!'));
          }
        }, 1000);
      });
      console.log(promiseOfImageName);
      return promiseOfImageName;    
    /*
    The getImageName function creates a promise. A promise object represents the eventual completion (or failure) of an asynchronous operation, and its resulting value. In effect, a promise lets an asynchronous function such as getImageName (the setTimeout method is used to make getImageName asynchronous) return a value much like a synchronous function. Rather than returning the final value (in this case, "Spain.png"), getImageName returns a promise of a future value (this is what you see in the console log). 
    */

  }

  function isSpain(country) {

    // Optional - create and return a promise that resolves if input is "Spain"

  }

  function flagChain(country) {
    return getImageName(country)
    .catch(fallbackName)
    .then(fetchFlag)
    .then(processFlag)
    .then(appendFlag)
    .catch(logError);

    /*

    Because catch returns a promise, you can use the catch method inside a promise chain to recover from earlier failed operations. Now the Chilean flag should display even though an invalid input was passed to flagChain.

    1. As before, getImageName returns a promise. The promise either resolves with an image file name, or rejects with an error, depending on the function's input.
    2. If the returned promise resolves, then the image file name is passed to fetchFlag inside the first then. This function requests the corresponding image file asynchronously, and returns a promise (see fetch documentation).
    3. If the promise from fetchFlag resolves, then the resolved value (a response object) is passed to processFlag in the next then. The processFlag function checks if the response is ok, and throws an error if it is not. Otherwise, it processes the response with the blob method, which also returns a promise.
    4. If the promise from processFlag resolves, the resolved value (a Blob), is passed to the appendFlag function. The appendFlag function creates an image from the value and appends it to the DOM.
    
    If any of the promises reject, then all subsequent then blocks are skipped, and catch executes, calling logError. Throwing an error in the processFlag function also triggers the catch block.
    */


    /*
    return getImageName(country)
      .then(logSuccess)
      .catch(logError); 

      
      The catch method is similar to then, but deals only with rejected cases. It behaves like then(undefined, onRejected). With this new pattern, if the promise from getImageName resolves, then logSuccess is called (and is implicitly passed the resolved promise value). If the promise from getImageName rejects, then logError is called (and implicitly passed the rejection error).

      This code is not quite equivalent to the code in section 2.2, however. This new code also triggers catch if logSuccess rejects, because logSuccess occurs before the catch. This new code would actually be equivalent to the following:

      return getImageName(country)
      .then(logSuccess)
      .then(undefined, logError);
      */
    
    // use the promise
    /*
      return getImageName(country)
      .then(logSuccess, logError);    

      
      The flagChain function returns the result of getImageName, which is a promise. The then method lets us implicitly pass the settled (either resolved or rejected) promise to another function. The then method takes two arguments in the following order:

      The function to be called if the promise resolves.
      The function to be called if the promise rejects.

      If the first function is called, then it is implicitly passed the resolved promise value. If the second function is called, then it is implicitly passed the rejection error.

      Note: We used named functions inside then as good practice, but we could use anonymous functions as well.
      */

  }

  function allFlags(promiseList) {

    // use promise.all
    return Promise.all(promiseList)
    .catch(returnFalse);

    /**
     * Promise.all returns a promise that resolves if all of the promises passed into it resolve. If any of the passed-in promises reject, then Promise.all rejects with the reason of the first promise that was rejected. This is very useful for ensuring that a group of asynchronous actions complete (such as multiple images loading) before proceeding to another step.

     Note: Promise.all would not work if the promises passed in were from flagChain calls because flagChain uses catch to ensure that the returned promise always resolves.

     Note: Even if an input promise rejects, causing Promise.all to reject, the remaining input promises still settle. In other words, the remaining promises still execute, they simply are not returned by Promise.all.
     * 
     * 
     */

  }

  // call the allFlags function
  var promises = [
    getImageName('Spain'),
    getImageName('Chile'),
    getImageName('Peru')
  ];

  allFlags(promises).then(function(result) {
    console.log(result);
  });

  // use Promise.race
  const promise1 = new Promise((resolve, reject) => {
    setTimeout(resolve, 500, 'one');
  });
  
  const promise2 = new Promise((resolve, reject) => {
    setTimeout(resolve, 100, 'two');
  });
  
  Promise.race([promise1, promise2])
  .then(logSuccess)
  .catch(logError);

/**
 * Promise.race takes a list of promises and settles as soon as the first promise in the list settles. If the   first promise resolves, Promise.race resolves with the corresponding value, if the first promise rejects, Promise.race rejects with the corresponding reason.

  In this example, if promise2 resolves before promise1 settles, the then block executes and logs the value of promise2. If promise2 rejects before promise1 settles, the catch block executes and logs the reason for the promise2 rejection.

  Note: Because Promise.race rejects immediately if one of the supplied promises rejects (even if another supplied promise resolves later) Promise.race by itself can't be used to reliably return the first promise that resolves.
 * 
 */
  

  /* Helper functions */

  function logSuccess(result) {
    console.log('Success!:\n' + result);
  }

  function logError(err) {
    console.log('Oh no!:\n' + err);
  }

  function returnFalse() {
    return false;
  }

  function fetchFlag(imageName) {
    return fetch('flags/' + imageName); // fetch returns a promise
  }

  function processFlag(flagResponse) {
    if (!flagResponse.ok) {
      throw Error('Bad response for flag request!'); // This will implicitly reject
    }
    return flagResponse.blob(); // blob() returns a promise
  }

  function appendFlag(flagBlob) {
    const flagImage = document.createElement('img');
    const flagDataURL = URL.createObjectURL(flagBlob);
    flagImage.src = flagDataURL;
    const imgContainer = document.getElementById('img-container');
    imgContainer.appendChild(flagImage);
    imgContainer.style.visibility = 'visible';
  }

  function fallbackName() {
    return 'chile.png';
  }

  // Don't worry if you don't understand this, it's not part of Promises.
  // We are using the JavaScript Module Pattern to enable unit testing of
  // our functions.
  return {
    getImageName: (getImageName),
    flagChain: (flagChain),
    isSpain: (isSpain),
    fetchFlag: (fetchFlag),
    processFlag: (processFlag),
    appendFlag: (appendFlag),
    allFlags: (allFlags)
  };

})();
