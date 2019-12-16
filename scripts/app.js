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

        onAddClick: function(event){
            var db = new AzureDashBoardDB();
            db.add("BIZ", "Business");
            db.add("SF", "Service Fabric");
            db.add("BI", "Business Intelligence");
        },

        onRemoveItemClick: function(event){
            let id = event.target.getAttribute('id');
            var db = new AzureDashBoardDB();
            db.remove(id, () => {
                this.onRefreshClick(null);
            });
        },

        onRefreshClick(event) {
            app.pipelines = [];
            var db = new AzureDashBoardDB();
            db.getAll( (rows) => {
                rows.forEach(row => {
                    app.pipelines.push(row);
                });
                
            });           
        },

        onFilterClick(event) {
            app.pipelines = [];
            var db = new AzureDashBoardDB();
            db.getByCode("BIZ", (rows) => {
                rows.forEach(row => {
                    app.pipelines.push(row);
                });
                
            });           
        },

        onClearClick(event) {
            app.pipelines = [];
            var db = new AzureDashBoardDB();
            db.clear();
        }
    }
});

app.init();