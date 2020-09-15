/*
Copyright 2016 Google Inc.

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
var idbApp = (function() {
  'use strict';

  // TODO 2 - check for support
  // Because IndexedDB isn't supported by all browsers, we need to check that the user's browser supports it before using it.
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

  // create the database for the app
  // The IndexedDB UI in DevTools doesn't always accurately reflect what's in the database. In Chrome, if you don't see your changes, try right-clicking on IndexedDB in the Application tab and then click Refresh IndexedDB. If it still doesn't update, then try closing and re-opening DevTools.

  /**
   * idb.open takes a database name, version number, and optional callback function for performing database updates (not included in the above code). The version number determines whether the upgrade callback function is called. If the version number is greater than the version number of the database existing in the browser, then the upgrade callback is executed.

    Note: If at any point in the codelab your database gets into a bad state, you can delete it in Chrome DevTools by going to the Application tab, clicking on the database name under IndexedDB, and clicking the Delete database button. Alternatively, you can click Clear storage (in the Application tab) and then click the Clear site data button. In all browsers you can also delete the database from the console with the following command: indexedDB.deleteDatabase('couches-n-things');
   */

   /**
    * To ensure database integrity, object stores and indexes can only be created during database upgrades. This means they are created inside the upgrade callback function in idb.open, which executes only if the version number (in this case it's 2) is greater than the existing version in the browser, or if the database doesn't exist. The callback is passed the UpgradeDB object (see the documentation for details), which is used to create the object stores.

    Inside the callback, we include a switch block that executes its cases based on the version of the database already existing in the browser. case 0 executes if the database doesn't yet exist. The database already exists for us, but we need a case 0 in case we delete the database, or in case someone else uses our app on their own machine.

    We have specified the id property as the keyPath for the object store. Objects added to this store must have an id property and the value must be unique.

    Note: We are deliberately not including break statements in the switch block to ensure all of the cases after the starting case will execute.
    */
  var dbPromise = idb.open('couches-n-things', 5, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        // a placeholder case so that the switch block will 
        // execute when the database is first created
        // (oldVersion is 0)
      case 1:
        console.log('Creating the products object store');
        upgradeDb.createObjectStore('products', {keyPath: 'id'});
  
      // TODO 4.1 - create 'name' index
      /**
       * In the example, we create an index on the name property, allowing us to search and retrieve objects from the store by their name. The optional unique option ensures that no two items added to the products object store use the same name.
       */
      case 2:
        console.log('Creating a name index');
        var store = upgradeDb.transaction.objectStore('products');
        store.createIndex('name', 'name', {unique: true});
  
      // TODO 4.2 - create 'price' and 'description' indexes
      case 3:
        console.log('Creating price and description indexes');
        var store = upgradeDb.transaction.objectStore('products');
        store.createIndex('price', 'price');
        store.createIndex('description', 'description');
  
      // TODO 5.1 - create an 'orders' object store
      case 4:
        console.log('Creating the orders object store');
        upgradeDb.createObjectStore('orders', {keyPath: 'id'});
    }
  });

  function addProducts() {

    // TODO 3.3 - add objects to the products store
    // Add some sample furniture items to the object store.
    /**
     * All database operations must be carried out within a transaction. In the code we just wrote, we first open the transaction on the database object and then open the object store on the transaction. Now when we call store.add on that object store, the operation happens inside the transaction.

      We add each object to the store inside a Promise.all. This way if any of the add operations fail, we can catch the error and abort the transaction. Aborting the transaction rolls back all the changes that happened in the transaction so that if any of the events fail to add, none of them will be added to the object store. This ensures the database is not left in a partially updated state.

      Note: Specify the transaction mode as readwrite when making changes to the database (that is, for changes that use the add, put, or delete methods).
     */

    dbPromise.then(function(db) {
      var tx = db.transaction('products', 'readwrite');
      var store = tx.objectStore('products');
      var items = [
        {
          name: 'Couch',
          id: 'cch-blk-ma',
          price: 499.99,
          color: 'black',
          material: 'mahogany',
          description: 'A very comfy couch',
          quantity: 3
        },
        {
          name: 'Armchair',
          id: 'ac-gr-pin',
          price: 299.99,
          color: 'grey',
          material: 'pine',
          description: 'A plush recliner armchair',
          quantity: 7
        },
        {
          name: 'Stool',
          id: 'st-re-pin',
          price: 59.99,
          color: 'red',
          material: 'pine',
          description: 'A light, high-stool',
          quantity: 3
        },
        {
          name: 'Chair',
          id: 'ch-blu-pin',
          price: 49.99,
          color: 'blue',
          material: 'pine',
          description: 'A plain chair for the kitchen table',
          quantity: 1
        },
        {
          name: 'Dresser',
          id: 'dr-wht-ply',
          price: 399.99,
          color: 'white',
          material: 'plywood',
          description: 'A plain dresser with five drawers',
          quantity: 4
        },
        {
          name: 'Cabinet',
          id: 'ca-brn-ma',
          price: 799.99,
          color: 'brown',
          material: 'mahogany',
          description: 'An intricately-designed, antique cabinet',
          quantity: 11
        }
      ];
      return Promise.all(items.map(function(item) {
          console.log('Adding item: ', item);
          return store.add(item);
        })
      ).catch(function(e) {
        tx.abort();
        console.log(e);
      }).then(function() {
        console.log('All items added successfully!');
      });
    });

  }

  function getByName(key) {

    // TODO 4.3 - use the get method to get an object by name
    /**
     * Note: Make sure the items we added to the database in the previous step are still in the database. If the database is empty, click Add Products to populate it. Don't worry about adding things twice. IndexedDB will throw errors in the console if you try to add items that already exist and won't add them to the store.

      Enter an item name from step 3.3 (try "Chair") into the By Name field and click Search next to the text box. The corresponding furniture item should display on the page.

      Refresh the test page. The app should pass the next test, which checks if the getByName function returns a database object.
     * 
      The Search button calls the displayByName function, which passes the user input string to the getByName function. The code we just added calls the get method on the name index to retrieve an item by its name property.
     */
    return dbPromise.then(function(db) {
      var tx = db.transaction('products', 'readonly');
      var store = tx.objectStore('products');
      var index = store.index('name');
      return index.get(key);
    });

  }

  function displayByName() {
    var key = document.getElementById('name').value;
    if (key === '') {return;}
    var s = '';
    getByName(key).then(function(object) {
      if (!object) {return;}

      s += '<h2>' + object.name + '</h2><p>';
      for (var field in object) {
        s += field + ' = ' + object[field] + '<br/>';
      }
      s += '</p>';

    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });
  }

  function getByPrice() {

    // TODO 4.4a - use a cursor to get objects by price
    /**
     * After getting the price values from the page, we determine which method to call on IDBKeyRange to limit the cursor. We open the cursor on the price index and pass the cursor object to the showRange function in .then. This function adds the current object to the HTML string, moves on to the next object with cursor.continue(), and calls itself, passing in the cursor object. showRange loops through each object in the object store until it reaches the end of the range. Then the cursor object is undefined and if (!cursor) {return;} breaks the loop.
     */
      var lower = document.getElementById('priceLower').value;
      var upper = document.getElementById('priceUpper').value;
      var lowerNum = Number(document.getElementById('priceLower').value);
      var upperNum = Number(document.getElementById('priceUpper').value);

      if (lower === '' && upper === '') {return;}
      var range;
      if (lower !== '' && upper !== '') {
        range = IDBKeyRange.bound(lowerNum, upperNum);
      } else if (lower === '') {
        range = IDBKeyRange.upperBound(upperNum);
      } else {
        range = IDBKeyRange.lowerBound(lowerNum);
      }
      var s = '';
      dbPromise.then(function(db) {
        var tx = db.transaction('products', 'readonly');
        var store = tx.objectStore('products');
        var index = store.index('price');
        return index.openCursor(range);
      }).then(function showRange(cursor) {
        if (!cursor) {return;}
        console.log('Cursored at:', cursor.value.name);
        s += '<h2>Price - ' + cursor.value.price + '</h2><p>';
        for (var field in cursor.value) {
          s += field + '=' + cursor.value[field] + '<br/>';
        }
        s += '</p>';
        return cursor.continue().then(showRange);
      }).then(function() {
        if (s === '') {s = '<p>No results.</p>';}
        document.getElementById('results').innerHTML = s;
      });
  }

  function getByDesc() {
    var key = document.getElementById('desc').value;
    if (key === '') {return;}
    var range = IDBKeyRange.only(key);
    var s = '';
    dbPromise.then(function(db) {
      // TODO 4.4b - get items by their description
      /**
       *  code to get the items by their descriptions. The first part is done for you. The function uses the only method on IDBKeyrange to match all items with exactly the provided description. To test your code, try putting "A light, high-stool" into the By Description input and clicking Search.
       */
      var tx = db.transaction('products', 'readonly');
      var store = tx.objectStore('products');
      var index = store.index('description');
      return index.openCursor(range);
    }).then(function showRange(cursor) {
      if (!cursor) {return;}
      console.log('Cursored at:', cursor.value.name);
      s += '<h2>Price - ' + cursor.value.price + '</h2><p>';
      for (var field in cursor.value) {
        s += field + '=' + cursor.value[field] + '<br/>';
      }
      s += '</p>';
      return cursor.continue().then(showRange);
    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });
  }

  function addOrders() {

    // TODO 5.2 - add items to the 'orders' object store
    dbPromise.then(function(db) {
      var tx = db.transaction('orders', 'readwrite');
      var store = tx.objectStore('orders');
      var items = [
        {
          name: 'Cabinet',
          id: 'ca-brn-ma',
          price: 799.99,
          color: 'brown',
          material: 'mahogany',
          description: 'An intricately-designed, antique cabinet',
          quantity: 7
        },
        {
          name: 'Armchair',
          id: 'ac-gr-pin',
          price: 299.99,
          color: 'grey',
          material: 'pine',
          description: 'A plush recliner armchair',
          quantity: 3
        },
        {
          name: 'Couch',
          id: 'cch-blk-ma',
          price: 499.99,
          color: 'black',
          material: 'mahogany',
          description: 'A very comfy couch',
          quantity: 3
        }
      ];
      return Promise.all(items.map(function(item) {
          console.log('Adding item: ', item);
          return store.add(item);
        })
      ).then(function() {
        console.log('All items added successfully!');
      }).catch(function(e) {
        tx.abort();
        console.log(e);
      });
    });
  }

  function showOrders() {
    var s = '';
    dbPromise.then(function(db) {

      // TODO 5.3 - use a cursor to display the orders on the page
      var tx = db.transaction('orders', 'readonly');
      var store = tx.objectStore('orders');
      return store.openCursor();
    }).then(function showRange(cursor) {
      if (!cursor) {return;}
      console.log('Cursored at:', cursor.value.name);

      s += '<h2>' + cursor.value.name + '</h2><p>';
      for (var field in cursor.value) {
        s += field + '=' + cursor.value[field] + '<br/>';
      }
      s += '</p>';

      return cursor.continue().then(showRange);
    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('orders').innerHTML = s;
    });
  }

  function getOrders() {

    // TODO 5.4 - get all objects from 'orders' object store
    /**
     *  get all objects from the orders object store. You must use the getAll() method on the object store. This returns an array containing all the objects in the store, which is then passed to the processOrders function in in the fulfillOrders function.

      Hint: Return the call to dbPromise otherwise the orders array will not be passed to the processOrders function.
     */
      return dbPromise.then(function(db) {
        var tx = db.transaction('orders', 'readonly');
        var store = tx.objectStore('orders');
        return store.getAll();
      });

  }

  function fulfillOrders() {
    getOrders().then(function(orders) {
      return processOrders(orders);
    }).then(function(updatedProducts) {
      updateProductsStore(updatedProducts);
    });
  }

  function processOrders(orders) {

    // TODO 5.5 - get items in the 'products' store matching the orders
    /**
     * This code gets each object from the products object store with an id matching the corresponding order, and passes it and the order to the decrementQuantity function.
     */
    return dbPromise.then(function(db) {
      var tx = db.transaction('products');
      var store = tx.objectStore('products');
      return Promise.all(
        orders.map(function(order) {
          return store.get(order.id).then(function(product) {
            return decrementQuantity(product, order);
          });
        })
      );
    });
  }

  function decrementQuantity(product, order) {

    // TODO 5.6 - check the quantity of remaining products
    /**
     *  we need to check if there are enough items left in the products object store to fulfill the order
     * 
     * Here we are subtracting the quantity ordered from the quantity left in the products store. If this value is less than zero, we reject the promise. This causes Promise.all in the processOrders function to fail so that the whole order is not processed. If the quantity remaining is not less than zero, then we update the quantity and return the object.
     */
    return new Promise(function(resolve, reject) {
      var item = product;
      var qtyRemaining = item.quantity - order.quantity;
      if (qtyRemaining < 0) {
        console.log('Not enough ' + product.id + ' left in stock!');
        document.getElementById('receipt').innerHTML =
        '<h3>Not enough ' + product.id + ' left in stock!</h3>';
        throw 'Out of stock!';
      }
      item.quantity = qtyRemaining;
      resolve(item);
    });

  }

  // TODO 5.7 - update the items in the 'products' object store
      /**
       * code to update the items in the products objects store with their new quantities
       * 
       * e already updated the values in the decrementQuantity function and passed the array of updated objects into the updateProductsStore function. All that's left to do is use ObjectStore.put to update each item in the store. A few hints:

        Remember to make the transaction mode 'readwrite'
        Remember to return tx.complete after putting the items into the store
  */
  function updateProductsStore(products) {
    dbPromise.then(function(db) {
      var tx = db.transaction('products', 'readwrite');
      var store = tx.objectStore('products');
      return Promise.all(products.map(function(item) {
          return store.put(item);
        })
      ).catch(function(e) {
        tx.abort();
        console.log(e);
      }).then(function() {
        console.log('Orders processed successfully!');
        document.getElementById('receipt').innerHTML =
        '<h3>Order processed successfully!</h3>';
      });
    });
  }

  return {
    dbPromise: (dbPromise),
    addProducts: (addProducts),
    getByName: (getByName),
    displayByName: (displayByName),
    getByPrice: (getByPrice),
    getByDesc: (getByDesc),
    addOrders: (addOrders),
    showOrders: (showOrders),
    getOrders: (getOrders),
    fulfillOrders: (fulfillOrders),
    processOrders: (processOrders),
    decrementQuantity: (decrementQuantity),
    updateProductsStore: (updateProductsStore)
  };
})();
