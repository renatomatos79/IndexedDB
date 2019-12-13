let dbInstance;
const dbName = "AzureDevOpsDashboard";
const storePipelines = "Pipelines";
const storeReleases = "Releases";
const storeWorkItems = "WorkItems";

window.onload = function() {
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  
  // var request = window.indexedDB.open("AzureDevOpsDashboard", {version: 4, storage: "temporary"});
  const DBOpenRequest = window.indexedDB.open(dbName, 4);

  // these two event handlers act on the database being opened successfully, or not
  DBOpenRequest.onerror = function(event) {
    console.log('Error loading database.');
  };

  DBOpenRequest.onsuccess = function(event) {
    console.log('Database initialised.');
    dbInstance = DBOpenRequest.result;

    debugger;
    addPipelineRow("BIZ", "Business");
    addPipelineRow("SF", "Service Fabric");
    addPipelineRow("BI", "Business Intelligence");

    displayData();
  };

  // This event handles the event whereby a new version of the database needs to be created
  // Either one has not been created before, or a new version number has been submitted via the
  // window.indexedDB.open line above
  // it is only implemented in recent browsers
  DBOpenRequest.onupgradeneeded = function(event) {
    dbInstance = event.target.result;

    dbInstance.onerror = function(event) {
      console.log('Error loading database.');
    };

    // Create an objectStore for this database
    let pipelineStore = dbInstance.createObjectStore(storePipelines, { keyPath: 'Pipelines' });
    pipelineStore.createIndex("code", "code", { unique: true });
    pipelineStore.createIndex("name", "name", { unique: false });

    console.log(`Object ${storePipelines} created!`);

    // Create an objectStore for this database
    let releaseStore = dbInstance.createObjectStore(storeReleases, { keyPath: 'Releases' });
    releaseStore.createIndex("pipelineCode", "pipelineCode", { unique: false });
    releaseStore.createIndex("code", "code", { unique: true });
    releaseStore.createIndex("version", "version", { unique: false });

    console.log(`Object ${storeReleases} created!`);

    // Create an objectStore for this database
    let releaseWorkItem = dbInstance.createObjectStore(storeWorkItems, { keyPath: 'WorkItems' });
    releaseWorkItem.createIndex("releaseCode", "releaseCode", { unique: false });
    releaseWorkItem.createIndex("code", "code", { unique: true });
    releaseWorkItem.createIndex("description", "description", { unique: false });
        
    console.log(`Object ${storeWorkItems} created!`);    
  };

  function displayData() {
    let objectStore = dbInstance.transaction(dbName).objectStore(storePipelines);
    objectStore.openCursor().onsuccess = function(event) {
      let cursor = event.target.result;
        // if there is still another cursor to go, keep runing this code
        if(cursor) {
          const code = cursor.value.code;
          const name = cursor.value.name;         
          
          console.log(`${storePipelines}: ${code}, ${name}`);

          // continue on to the next item in the cursor
          cursor.continue();
        } 
      }
    }  

  function addPipelineRow(pipelineCode, pipelineName) {   
      // grab the values entered into the form fields and store them in an object ready for being inserted into the IDB
      let row = [
        { code: pipelineCode, name: pipelineName }
      ];

      // open a read/write db transaction, ready for adding the data
      let transaction = dbInstance.transaction([dbName], "readwrite");

      // report on the success of the transaction completing, when everything is done
      transaction.oncomplete = function() {
        console.log('Transaction completed: database modification finished');
        displayData();
      };

      transaction.onerror = function() {
        console.log(`Transaction not opened due to error: ${transaction.error}`);
      };

      // call an object store that's already been added to the database
      let objectStore = transaction.objectStore(storePipelines);
      
      console.log(`Info: ${storePipelines}`);
      console.log(objectStore.indexNames);
      console.log(objectStore.keyPath);
      console.log(objectStore.name);
      console.log(objectStore.transaction);
      console.log(objectStore.autoIncrement);

      // Make a request to add our newItem object to the object store
      let objectStoreRequest = objectStore.add(row);
      objectStoreRequest.onsuccess = function(event) {
          console.log('Request successful.');
      };
  };

}
