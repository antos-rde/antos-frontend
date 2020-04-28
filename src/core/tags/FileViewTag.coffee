class FileViewTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "onfileselect", ()->
        @setopt "onfileopen", () ->
        @setopt "selectedFile", undefined
        @setopt "view", "list"
        @setopt "data", []
        @setopt "path", "home:///"
        @setopt "status", true
        @setopt "showhidden", false
        @setopt "fetch", undefined
        @setopt "chdir", undefined
        @preventUpdate = false
        @header = [
            { text: "__(File name)" },
            { text: "__(Type)", width: 150 },
            { text: "__(Size)", width: 70 }
        ]

    view: () -> @get "view"
    

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

    switchView: () ->
        

    layout: () ->
        [
            { el: "afx-list-view", ref: "listview" },
            { el: "afx-grid-view", ref: "gridview" },
            { el: "div", class: "treecontainer", ref: "treecontainer", children: [
                { el: "afx-tree-view", ref: "treeview" }
            ] },
            { el: "afx-label", class: "status", ref: "status" }
        ]