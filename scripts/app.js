var app = new Vue({
    el: '#app',
    data: {
        log: [{text: ""}],
        pipelines: [{code: "", name: ""}]
    },
    methods: {
        init: function(){
            this.log=[];
            this.pipelines=[];
        },

        appendLog: function(msg) {
            this.log.push({text: msg})
        },

        addPipelineRow: function(pipelineCode, pipelineName) {
            const key = createGUID();

            // grab the values entered into the form fields and store them in an object ready for being inserted into the IDB
            let newItem = { id: key, code: pipelineCode, name: pipelineName };

            // open a read/write db transaction, ready for adding the data
            let transaction = dbInstance.transaction([storePipelines], "readwrite");

            // report on the success of the transaction completing, when everything is done
            transaction.oncomplete = function() {
                app.appendLog('Transaction completed: database modification finished');
                displayData();
            };

            transaction.onerror = function() {
                app.appendLog(`Transaction not opened due to error: ${transaction.error}`);
            };

            // call an object store that's already been added to the database
            let objectStore = transaction.objectStore(storePipelines);
            
            app.appendLog(`Info: ${storePipelines}`);
            app.appendLog(objectStore.indexNames);
            app.appendLog(objectStore.keyPath);
            app.appendLog(objectStore.name);
            app.appendLog(objectStore.transaction);
            app.appendLog(objectStore.autoIncrement);

            // Make a request to add our newItem object to the object store
            let objectStoreRequest = objectStore.add(newItem);
            objectStoreRequest.onsuccess = function(event) {
                app.appendLog('Request successful.');
            };
        },

        onAddClick: function(event){
            this.addPipelineRow("BIZ", "Business");
            this.addPipelineRow("SF", "Service Fabric");
            this.addPipelineRow("BI", "Business Intelligence");
        },

        onRemoveItemClick: function(event){
            let id = event.target.getAttribute('id');
            let transaction = dbInstance.transaction([storePipelines], "readwrite");
            transaction.objectStore(storePipelines).delete(id);
            this.onRefreshClick(null);

            transaction.oncomplete = function() {
                app.appendLog(`Item ${id} deleted!`);
            };
        },

        onRefreshClick(event) {
            app.pipelines = [];
            let objectStore = dbInstance.transaction(storePipelines).objectStore(storePipelines);
            objectStore.openCursor().onsuccess = function(event) {
                let cursor = event.target.result;
                // if there is still another cursor to go, keep runing this code
                if(cursor) {
                    const id = cursor.value.id;
                    const code = cursor.value.code;
                    const name = cursor.value.name;         
                  
                    app.pipelines.push({id, code, name});
        
                    // continue on to the next item in the cursor
                    cursor.continue();
                }
            }
        }
    }
});

app.init();