<afx-file-view>
    <afx-list-view  ref="listview"  observable = {root.observable}></afx-list-view>
    <afx-grid-view  ref = "gridview" header = {header}  observable = {root.observable}></afx-grid-view>
    <div class = "treecontainer" ref="treecontainer">
        <afx-tree-view  ref = "treeview" observable = {root.observable}></afx-tree-view>
    </div>
    <div if = {status == true} class = "status" ref = "stbar"></div>
    <script>
        var self = this
        self.root.observable = opts.observable || riot.observable()
        self.view = opts.view || 'list'
        self.data = opts.data || []
        self.path = opts.path || "home:///"
        self.onfileselect
        self.onfileopen
        this.status = opts.status == undefined?true:opts.status
        this.selectedFile = undefined
        this.showhidden = opts.showhidden
        this.fetch = opts.fetch
        this.chdir = opts.chdir
        this.rid = $(self.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
        this.header = [{value:"File name"},{value: "Type", width:150}, {value: "Size", width:70}]

        self.root.set = function(k,v)
        {
            if(k == "*")
                for(var i in v)
                    self[i] = v[i]
            else
                self[k] = v
            if(k == 'view')
                switchView()
            if(k == "data")
                self.selectedFile = undefined
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
            var h = $(self.root).outerHeight()
            var w = $(self.root).width()
            if(self.refs.stbar)
                h -= ($(self.refs.stbar).height() + 10)
            $(self.refs.listview.root).css("height", h + "px")
            $(self.refs.gridview.root).css("height", h + "px")
            $(self.refs.treecontainer).css("height", h + "px")
            $(self.refs.listview.root).css("width", w + "px")
            $(self.refs.gridview.root).css("width", w + "px")
            $(self.refs.treecontainer).css("width", w + "px")
        }
        var refreshList = function(){
            var items = []
            $.each(self.data, function(i, v){
                if(v.filename[0] == '.' && !self.showhidden) return
                v.text = v.filename
                if(v.text.length > 10)
                    v.text = v.text.substring(0,9) + "..."
                v.iconclass = v.type
                items.push(v)
            })
            self.refs.listview.root.set("items", items)
        }
        var refreshGrid = function(){
            var rows = []
            $.each(self.data, function(i,v){
                if(v.filename[0] == '.' && !self.showhidden) return
                var row = [{value:v.filename, iconclass: v.type},{value:v.mime},{value:v.size},{idx:i}]
                rows.push(row)
            })
            self.refs.gridview.root.set("rows",rows)
        }
        var refreshTree = function(){
            self.refs.treeview.root.set("selectedItem", null)
            var tdata = {}
            tdata.name = self.path
            tdata.nodes = getTreeData(self.data)
            self.refs.treeview.root.set("*", tdata)
        }
        var getTreeData = function(data)
        {
            nodes = []
            $.each(data, function(i,v){
                if(v.filename[0] == '.' && !self.showhidden) return
                v.name = v.filename
                if(v.type == 'dir')
                {
                    v.nodes = []
                    v.open = false
                }
                v.iconclass = v.type
                nodes.push(v)
            })
            return nodes
        }
        var refreshData = function(){
            self.data.sort(sortByType)
            if(self.view == "icon")
                refreshList()
            else if(self.view == "list")
                refreshGrid()
            else 
                refreshTree()
        }
        var switchView = function()
        {
            $(self.refs.listview.root).hide()
            $(self.refs.gridview.root).hide()
            $(self.refs.treecontainer).hide()
            self.selectedFile = undefined
            self.refs.listview.root.set("selected", -1)
            self.refs.treeview.selectedItem = undefined
            self.refs.treeview.root.set("fetch",function(e,f){
                if(!self.fetch) return
                self.fetch(e, function(d){
                    f(getTreeData(d))
                })
            })
            $(self.refs.stbar).html("")
            switch (self.view) {
                case 'icon':
                    $(self.refs.listview.root).show()
                    break;
                case 'list':
                    $(self.refs.gridview.root).show()
                    break;
                case 'tree':
                    $(self.refs.treecontainer).show()
                    break;
                default:
                    break;
            }
            calibre_size()
        }
        self.on("updated", function(){
            refreshData()
            calibre_size()
        })
        self.on("mount", function(){
            switchView()
            self.refs.listview.onlistselect = function(data)
            {
                data.id = self.rid
                self.root.observable.trigger("fileselect",data)
            }
            self.refs.listview.onlistdbclick = function(data)
            {
                data.id = self.rid
                self.root.observable.trigger("filedbclick",data)
            }
            self.refs.gridview.root.observable = self.root.observable
            self.refs.gridview.ongridselect = function(d)
            {
                var data = {id:self.rid, data:self.data[d.data.child[3].idx], idx:d.data.child[3].idx}
                self.root.observable.trigger("fileselect",data)
            }
            self.refs.gridview.ongriddbclick = function(d)
            {
                var data = {id:self.rid, data:self.data[d.data.child[3].idx], idx:d.data.child[3].idx}
                self.root.observable.trigger("filedbclick",data)
            }
            self.refs.treeview.ontreeselect = function(d)
            {
                if(!d.data) return;
                var data = {id:self.rid, data:d.data.child, idx:d.data.i}
                self.root.observable.trigger("fileselect",data)
            }
            self.refs.treeview.ontreedbclick = function(d)
            {
                if(!d.data) return;
                var data = {id:self.rid, data:d.data.child, idx:d.data.i}
                self.root.observable.trigger("filedbclick",data)
            }
            self.root.observable.on("fileselect", function(e){
                if(e.id != self.rid) return
                self.selectedFile = e.data
                if(self.onfileselect)
                    self.onfileselect(e.data)
                $(self.refs.stbar).html("Selected: " + e.data.filename + " (" + e.data.size + " bytes)")
            })
            self.root.observable.on("filedbclick", function(e){
                if(e.id != self.rid ) return
                if(e.data.type == "file" && self.onfileopen)
                    self.onfileopen(e.data)
                else if(self.chdir && e.data.type == "dir")
                    self.chdir(e.data.path)
            })
            calibre_size()
            self.root.observable.on("resize", function(e){
                calibre_size()
            })
        })
    </script>
</afx-file-view>