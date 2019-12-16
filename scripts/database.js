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
    app.appendLog('Error loading database.');
  };

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
    let pipelineStore = dbInstance.createObjectStore(storePipelines, { keyPath: "id" });
    pipelineStore.createIndex("code", "code", { unique: false });
    pipelineStore.createIndex("name", "name", { unique: false });

    app.appendLog(`Object ${storePipelines} created!`);

    // Create an objectStore for this database
    let releaseStore = dbInstance.createObjectStore(storeReleases, { keyPath: "id" });
    releaseStore.createIndex("pipelineCode", "pipelineCode", { unique: false });
    releaseStore.createIndex("code", "code", { unique: false });
    releaseStore.createIndex("version", "version", { unique: false });

    app.appendLog(`Object ${storeReleases} created!`);

    // Create an objectStore for this database
    let releaseWorkItem = dbInstance.createObjectStore(storeWorkItems, { keyPath: "id" });
    releaseWorkItem.createIndex("releaseCode", "releaseCode", { unique: false });
    releaseWorkItem.createIndex("code", "code", { unique: false });
    releaseWorkItem.createIndex("description", "description", { unique: false });
        
    app.appendLog(`Object ${storeWorkItems} created!`);    
  };  

}
