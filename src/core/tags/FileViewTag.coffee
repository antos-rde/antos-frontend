class FileViewTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "onfileselect", ()->
        @setopt "onfileopen", () ->
        @setopt "selectedFile", undefined
        @setopt "view", "list"
        @setopt "data", []
        @setopt "status", true
        @setopt "showhidden", false
        @setopt "fetch", undefined
        @setopt "path", undefined
        @preventUpdate = false
        @header = [
            { text: "__(File name)" },
            { text: "__(Type)", width: 150 },
            { text: "__(Size)", width: 70 }
        ]

    view: () -> @get "view"
    
    __view__: (v) ->
        @switchView()

    __path__: (v) ->
        return unless v
        me = @
        return unless @get "fetch"
        @get("fetch")(v)
            .then (data) ->
                me.set "data", data
                me.refs.status.set("text", " ") if me.get "status"
            .catch (e) ->
                # this should be handled by the OS
                console.error e
    
    __data__: (v) ->
        return unless v
        @refreshData()
    
    sortByType: (a, b) ->
        if a.type < b.type
            -1
        else if  a.type > b.type
             1
        else
            0

    calibrate: () ->
        h = $(@root).outerHeight()
        w = $(@root).width()
        h -= ($(@refs.status).height() + 10) if @get("status")
        $(@refs.listview).css("height", h + "px")
        $(@refs.gridview).css("height", h + "px")
        $(@refs.treecontainer).css("height", h + "px")
        $(@refs.listview).css("width", w + "px")
        $(@refs.gridview).css("width", w + "px")
        $(@refs.treecontainer).css("width", w + "px")

    refreshList: () ->
        items = []
        me = @
        $.each @get("data"), (i, v) ->
            return if v.filename[0] is '.' and not me.get("showhidden")
            v.text = v.filename
            v.text = v.text.substring(0, 9) + "..." if v.text.length > 10
            v.iconclass = if v.iconclass then v.iconclass else v.type
            v.icon = v.icon
            items.push(v)
        @refs.listview.set "data", items

    refreshGrid: () ->
        rows = []
        me = @
        $.each @get("data"), (i, v) ->
            return if v.filename[0] is '.' and not me.get("showhidden")
            v.text = v.filename
            v.iconclass = if v.iconclass then v.iconclass else v.type
            row = [
                v,
                {
                    text: v.mime,
                    data: v
                },
                {
                    text: v.size,
                    data: v
                }
            ]
            rows.push(row)
        @refs.gridview.set "rows", rows

    refreshTree: () ->
        #@treeview.root.set("selectedItem", null)
        tdata = {}
        tdata.name = @get "path"
        tdata.path = tdata.name
        tdata.open = true
        tdata.nodes = @getTreeData( @get("data"))
        @refs.treeview.set("data", tdata)

    getTreeData: (data) ->
        nodes = []
        me = @
        $.each data, (i, v) ->
            return if v.filename[0] is '.' and not me.get("showhidden")
            v.name = v.filename
            if v.type is 'dir'
                v.nodes = []
                v.open = false
            v.iconclass = if v.iconclass then v.iconclass else v.type
            v.icon = v.icon
            nodes.push(v)
        return nodes

    refreshData: () ->
        return unless @get("data")
        @get("data").sort(@sortByType)
        switch @get("view")
            when "icon"
                @refreshList()
            when "list"
                @refreshGrid()
            else
                @refreshTree()
                
    switchView: () ->
        $(@refs.listview).hide()
        $(@refs.gridview).hide()
        $(@refs.treecontainer).hide()
        @set "selectedFile", undefined
        switch @get "view"
            when 'icon'
                $(@refs.listview).show()
            when 'list'
                $(@refs.gridview).show()
            else
                $(@refs.treecontainer).show()
        @refreshData()
        @calibrate()
        @refs.status.set("text", " ") if @get "status"

    fileselect: (e) ->
        if @get "status"
            @refs.status.set "text", __(
                "Selected: {0} ({1} bytes)",
                e.filename,
                if e.size then e.size else "0" )
        evt  = { id: @aid(), data: e }
        @get("onfileselect") evt
        @observable.trigger "fileselect", evt

    filedbclick: (e) ->
        if e.type is "dir"
            @set "path", e.path
        else
            evt  = { id: @aid(), data: e }
            @get("onfileopen") evt
            @observable.trigger "fileopen", evt

    mount: () ->
        me = @
        @observable.on "resize", (e) -> me.calibrate()
        @refs.treeview.set "fetch", (v) ->
            new Promise (resolve, reject) ->
                return resolve undefined unless me.get("fetch")
                me.get("fetch")(v.get("data").path)
                    .then (d) -> resolve me.getTreeData(d.sort me.sortByType)
                    .catch (e) -> reject e
        @refs.gridview.set "header", @header
        # even handles
        @refs.listview.set "onlistselect", (e) ->
            me.fileselect e.data.item.get("data")
        @refs.gridview.set "onrowselect", (e) ->
            me.fileselect $(e.data.item).children()[0].get("data")
        @refs.treeview.set "ontreeselect", (e) ->
            me.fileselect e.data.item.get("data")
        # dblclick
        @refs.listview.set "onlistdbclick", (e) ->
            me.filedbclick e.data.item.get("data")
        @refs.gridview.set "oncelldbclick", (e) ->
            me.filedbclick e.data.item.get("data")
        @refs.treeview.set "ontreedbclick", (e) ->
            me.filedbclick e.data.item.get("data")
        @switchView()
        ### self.refs.listview.onlistselect = function(data)
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
            if(!d) return;
            var data;
            var el = d;
            if(d.treepath == 0)// select the root
            {
                el = self.path.asFileHandler()
                el.size = 0
                el.filename = el.path
            }
            var data = {id:self.rid, data:el}
            self.root.observable.trigger("fileselect",data)
        }
        self.refs.treeview.ontreedbclick = function(d)
        {
            if(!d || d.treepath == 0) return;
            var data = {id:self.rid, data:d}
            self.root.observable.trigger("filedbclick",data)
        }
        self.root.observable.on("fileselect", function(e){
            if(e.id != self.rid) return
            self.selectedFile = e.data
            if(self.onfileselect)
                self.onfileselect(e.data)
            if(self.refs.stbar)
                self.refs.stbar.root.set("text", __("Selected: {0} ({1} bytes)", e.data.filename,  e.data.size?e.data.size:"0"))//.html()
        })
        self.root.observable.on("filedbclick", function(e){
            if(e.id != self.rid ) return
            if(e.data.type != "dir" && self.onfileopen)
                self.onfileopen(e.data)
            else if(self.chdir && e.data.type == "dir")
                self.chdir(e.data.path)
        })
        calibre_size()
        self.root.observable.on("resize", function(e){
            calibre_size()
        })
        self.root.observable.on("calibrate", function(e){
            calibre_size()
        })
        }) ###

    layout: () ->
        [
            { el: "afx-list-view", ref: "listview" },
            { el: "afx-grid-view", ref: "gridview" },
            { el: "div", class: "treecontainer", ref: "treecontainer", children: [
                { el: "afx-tree-view", ref: "treeview" }
            ] },
            { el: "afx-label", class: "status", ref: "status" }
        ]

Ant.OS.GUI.define "afx-file-view", FileViewTag