<afx-file-view>
    <afx-list-view if = {view == 'icon'} ref="listview"  observable = {root.observable}></afx-list-view>
    <afx-grid-view if = {view == 'list'} ref = "gridview" header = {header}  observable = {root.observable}></afx-grid-view>
    <afx-tree-view if = {view == 'tree'} ref = "treeview" observable = {root.observable}></afx-tree-view>
    <div if = {status == true} class = "status" ref = "stbar"></div>
    <script>
        var self = this
        self.root.observable = opts.observable || riot.observable()
        self.view = opts.view || 'list'
        self.data = opts.data || []
        self.onfileselect
        this.status = opts.status == undefined?true:opts.status
        this.rid = $(self.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
        this.header = [{value:"File name"},{value: "Type", width:100}, {value: "Size", width:70}]

        self.root.set = function(k,v)
        {
            if(k == "*")
                for(var i in v)
                    self[i] = v[i]
            else
                self[k] = v
            self.update()
        }
        self.root.get = function(k)
        {
            return self[k]
        }
        var sortByType = function(a,b)
        {
            return a.type < b.type ? -1 : ( a.type > b.type ? 1: 0 )
        }
        var calibre_size = function()
        {
            var h = $(self.root).height()
            if(self.refs.stbar)
                h -= $(self.refs.stbar).height()
            if(self.refs.listview)
                $(self.refs.listview.root).css("height", h + "px")
            else if(self.refs.gridview)
                $(self.refs.gridview.root).css("height", h + "px")
            else if(self.refs.treeview)
                $(self.refs.treeview.root).css("height", h + "px")
        }
        var refreshList = function(){
            $.each(self.data, function(i, v){
                v.text = v.filename
                if(v.text.length > 10)
                    v.text = v.text.substring(0,9) + "..."
                if(v.type == 'file')
                    v.iconclass = 'afx-file'
                else 
                    v.iconclass = 'afx-dir'
            })
            self.refs.listview.root.set("items", self.data)
        }
        var refreshGrid = function(){
            var rows = []
            $.each(self.data, function(i,v){
                var row = [{value:v.filename, iconclass: v.type == "dir"?"afx-dir":"afx-file" },{value:v.mime},{value:v.size}]
                rows.push(row)
            })
            self.refs.gridview.root.set("rows",rows)
        }
        var refreshData = function(){
            self.data.sort(sortByType)
            if(self.refs.listview)
                refreshList()
            else if(self.refs.gridview)
                refreshGrid()
        }
        self.on("updated", function(){
            refreshData()
            calibre_size()
        })
        self.on("mount", function(){
            if(self.refs.listview)
            {
                self.refs.listview.onlistselect = function(data)
                {
                    data.id = self.rid
                    self.root.observable.trigger("fileselect",data)
                }
            }
            if(self.refs.gridview)
            {
                self.refs.gridview.root.observable = self.root.observable
                self.refs.gridview.ongridselect = function(d)
                {
                    var data = {id:self.rid, data:self.data[d.data.i], idx:d.data.i}
                    self.root.observable.trigger("fileselect",data)
                }
            }
            self.root.observable.on("fileselect", function(e){
                if(e.id != self.rid) return
                $(self.refs.stbar).html("Selected: " + e.data.filename + " (" + e.data.size + " bytes)")
            })

            calibre_size()
            self.root.observable.on("resize", function(e){
                calibre_size()
            })
        })
    </script>
</afx-file-view>