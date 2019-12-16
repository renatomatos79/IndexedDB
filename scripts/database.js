let dbInstance;

var AzureDashBoardDB = function(){
  var self = this;
  // constants
  self.dbName = "AzureDevOpsDashboard";
  self.storePipelines = "Pipelines";
  self.storeReleases = "Releases";
  self.storeWorkItems = "WorkItems";

  self.init = function(){
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    // var request = window.indexedDB.open("AzureDevOpsDashboard", {version: 4, storage: "temporary"});
    DBOpenRequest = window.indexedDB.open(self.dbName, 4);
    
    // these two event handlers act on the database being opened successfully, or not
    DBOpenRequest.onerror = function(event) {
      app.appendLog('Error loading database.');
    };

    // connection ok
    DBOpenRequest.onsuccess = function(event) {
      app.appendLog('Database initialised.');
      dbInstance = DBOpenRequest.result;
    };

    // This event handles the event whereby a new version of the database needs to be created
    // Either one has not been created before, or a new version number has been submitted via the
    // window.indexedDB.open line above
    // it is only implemented in recent browsers
    DBOpenRequest.onupgradeneeded = function(event) {
      dbInstance = event.target.result;
  
      dbInstance.onerror = function(event) {
        app.appendLog('Error loading database.');
      };
  
      // Create an objectStore for this database
      let pipelineStore = dbInstance.createObjectStore(self.storePipelines, { keyPath: "id" });
      pipelineStore.createIndex("code", "code", { unique: true });
      pipelineStore.createIndex("name", "name", { unique: false });
  
      app.appendLog(`Object ${self.storePipelines} created!`);
  
      // Create an objectStore for this database
      let releaseStore = dbInstance.createObjectStore(self.storeReleases, { keyPath: "id" });
      releaseStore.createIndex("pipelineCode", "pipelineCode", { unique: false });
      releaseStore.createIndex("code", "code", { unique: true });
      releaseStore.createIndex("version", "version", { unique: false });
  
      app.appendLog(`Object ${self.storeReleases} created!`);
  
      // Create an objectStore for this database
      let releaseWorkItem = dbInstance.createObjectStore(self.storeWorkItems, { keyPath: "id" });
      releaseWorkItem.createIndex("releaseCode", "releaseCode", { unique: false });
      releaseWorkItem.createIndex("code", "code", { unique: true });
      releaseWorkItem.createIndex("description", "description", { unique: false });
          
      app.appendLog(`Object ${self.storeWorkItems} created!`);    
    };

  };

  // add new row
  self.add = function(pipelineCode, pipelineName) {
    const key = createGUID();

    // grab the values entered into the form fields and store them in an object ready for being inserted into the IDB
    let newItem = { id: key, code: pipelineCode, name: pipelineName };

    // open a read/write db transaction, ready for adding the data
    let transaction = dbInstance.transaction([self.storePipelines], "readwrite");

    // report on the success of the transaction completing, when everything is done
    transaction.oncomplete = function() {
        app.appendLog('Transaction completed: database modification finished');
    };

    transaction.onerror = function(error) {
        app.appendLog(`Transaction not opened due to error: ${error.target.error.message}`);
    };

    // call an object store that's already been added to the database
    let objectStore = transaction.objectStore(self.storePipelines);
    
    app.appendLog(`Info: ${self.storePipelines}`);
    app.appendLog(objectStore.indexNames);
    app.appendLog(objectStore.keyPath);
    app.appendLog(objectStore.name);
    app.appendLog(objectStore.transaction);
    app.appendLog(objectStore.autoIncrement);

    // Make a request to add our newItem object to the object store
    let objectStoreRequest = objectStore.add(newItem);
    objectStoreRequest.onsuccess = function() {
        app.appendLog('Request successful.');
    };
  };

  self.remove = function(id, callback) {
    let transaction = dbInstance.transaction([self.storePipelines], "readwrite");
    transaction.objectStore(self.storePipelines).delete(id);
    transaction.oncomplete = function() {
      app.appendLog(`Item ${id} deleted!`);
      if (callback) {
        callback.call(self);
      }
    };   
  }

  // get rows
  self.getAll = function(callback) {
    let result = [];
    let objectStore = dbInstance.transaction(self.storePipelines).objectStore(self.storePipelines);
    objectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        // if there is still another cursor to go, keep runing this code
        if(cursor) {
            const id = cursor.value.id;
            const code = cursor.value.code;
            const name = cursor.value.name;         
          
            result.push({id, code, name});

            // continue on to the next item in the cursor
            cursor.continue();
        } else {
          callback.call(self, result);
        }
    }
}

  return self;
}

window.onload = function() {
  var dbSetup = new AzureDashBoardDB();
  dbSetup.init(); 
}