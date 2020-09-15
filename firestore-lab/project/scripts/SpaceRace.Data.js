/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

SpaceRace.prototype.addShip = function(data) {
  /*
    TODO: Implement adding a document
    The code below adds a new document to the ships Firestore collection. The function first gets a reference to the ships collection and then add's the data. The document data comes from a plain JavaScript object.
  */
  const collection = firebase.firestore().collection('ships');
  return collection.add(data);
};

SpaceRace.prototype.getAllShips = function(render) {
  /*
    TODO: Retrieve a list of ships

    a query which will retrieve up to 50 ships of the top-level collection named "ships". Once we've declared this query, we pass it to the getDocumentsInQuery() method, which is responsible for loading and rendering the data. 
  */
  const query = firebase.firestore()
  .collection('ships')
  .limit(50);
  this.getDocumentsInQuery(query, render);
};

SpaceRace.prototype.getDocumentsInQuery = function(query, render) {
  /*
    TODO: Render all documents in the provided query

    will use a snapshot listener

    will be notified of all existing data that matches the query and receive updates in real time

    The query.onSnapshot in the code above triggers its callback argument every time there is a change to the result of the query. The first time, the callback is triggered with the entire result set of the query, which is the complete ships collection from Firestore. Individual document changes have a type property, indicating how they have changed. If a document is added, then the document is passed to the render function. If the document was removed, the corresponding ship card is removed from the DOM.

    Note: It is also possible to fetch documents from Firestore once, rather than listening for real time updates using the Query.get() method.
  */
    query.onSnapshot(snapshot => {
      if (!snapshot.size) return render();
      snapshot.docChanges.forEach(change => {
        if (change.type === 'added') {
          render(change.doc);
        }
        else if (change.type === 'removed') {
          document.getElementById(change.doc.id).remove();
        }
      });
    });
};

SpaceRace.prototype.deleteShip = function(id) {
  /*
    TODO: Delete a ship
  */

 const collection = firebase.firestore().collection('ships');
 return collection.doc(id).delete()
   .catch(function(error) {
     console.error('Error removing document: ', error);
   });
};
