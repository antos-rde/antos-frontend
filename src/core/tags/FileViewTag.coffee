class FileViewTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "onfileselect", ()->
        @setopt "onfileopen", () ->
        @setopt "selectedFile", undefined
        @setopt "data", []
        @setopt "status", true
        @setopt "showhidden", false
        @setopt "fetch", undefined
        @setopt "path", undefined
        @setopt "view", "list"
        @preventUpdate = false
        @header = [
            { text: "__(File name)" },
            { text: "__(Type)", width: 150 },
            { text: "__(Size)", width: 70 }
        ]

    view: () -> @get "view"
    
    __view__: (v) ->
        @switchView()

    __status__: (v) ->
        return $(@refs.status).show() if v
        $(@refs.status).hide()

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
        @set "selectedFile", e
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

    layout: () ->
        [
            { el: "afx-list-view", ref: "listview" },
            { el: "div", class: "treecontainer", ref: "treecontainer", children: [
                { el: "afx-tree-view", ref: "treeview" }
            ] },
            { el: "afx-grid-view", ref: "gridview" },
            { el: "afx-label", class: "status", ref: "status" }
        ]

Ant.OS.GUI.define "afx-file-view", FileViewTag