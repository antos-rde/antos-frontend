class TreeViewItemPrototype extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "data", undefined
        @setopt "nodes", undefined
        @setopt "treeroot", undefined
        @setopt "indent", 0
        @setopt "toggle", false
        @setopt "fetch", undefined
        @setopt "open", true
        @setopt "itemindex", 0
        @setopt "parent", undefined
        @setopt "selected", false
        @setopt "treepath", @aid()
    
    update: (p) ->
        return unless p
        return unless p is @get("treepath")
        @set "open", true

    __data__: (v) ->
        return unless v
        @set "nodes", v.nodes if v.nodes
        @set "open", v.open
        @set "treepath", v.path if v.path

    __selected__: (v) ->
        $(@refs.wrapper).removeClass()
        return $(@refs.wrapper).addClass("afx_tree_item_selected") if v
    
    __open__: (v) ->
        return unless @is_folder()
        $(@refs.toggle)
            .removeClass()
        if(v)
            if @get("fetch")
                @get("fetch")(@root)
                    .then (d) =>
                        return unless d
                        @.set "nodes", d
                    .catch (e) ->
                        Ant.OS.announcer.oserror e.toString(), e
            else
                @.set "nodes", @__("nodes")
            $(@refs.childnodes).show()
        else
            $(@refs.childnodes).hide()
        return $(@refs.toggle).addClass "afx-tree-view-folder-open" if v
        $(@refs.toggle).addClass "afx-tree-view-folder-close"
    
    __itemindex__: (v) ->
        return unless v
        $(@refs.wrapper).addClass "afx_tree_item_odd" if v % 2 isnt 0

    __indent__: (v) ->
        return unless v
        $(@refs.padding)
                .css("display", "inline-block")
                .css("height", "1px")
                .css("padding", 0)
                .css("margin", 0)
                .css("background-color", "transparent")
                .css("width", v * 15 + "px" )

    is_folder: () ->
        if @get("nodes") then true else false
    

    __nodes__: (nodes) ->
        return unless nodes
        # return unless @get("nodes") and @get("nodes").length > 0
        $(@refs.childnodes).empty()
        $(@refs.wrapper).addClass("afx_folder_item")
        root = @get("treeroot")
        for v in nodes
            el = $("<afx-tree-view>").appendTo @refs.childnodes
            el[0].uify undefined
            el[0].set "treeroot", root
            el[0].set "indent", (@get("indent") + 1)
            root.indexcounter++
            el[0].set "parent", @get("parent")
            el[0].set "itemindex", root.indexcounter
            el[0].set "treepath", "#{@get("treepath")}/#{el[0].aid()}"
            el[0].set "fetch", @get("fetch")
            el[0].set "data", v


    mount: () ->
        super.mount()
        $(@refs.container)
            .css "padding", 0
            .css "margin", 0
            .css "white-space", "nowrap"
        $(@refs.itemholder)
            .css "display", "inline-block"
        $(@refs.wrapper)
            .click (e) =>
                e.item = @root
                @get("treeroot").itemclick e, false
        $(@refs.wrapper)
            .dblclick (e) =>
                e.item = @root
                @get("treeroot").itemclick e, true

        $(@refs.toggle)
            .css "display", "inline-block"
            .css "width", "15px"
            .addClass "afx-tree-view-item"
            .click (e) =>
                @set "open", not @get("open")
                e.preventDefault()
                e.stopPropagation()


    layout: () ->
        [ {
            el: "div", ref: "wrapper", children: [
                {
                    el: "ul", ref: "container", children: [
                       { el: "li", ref: "padding" },
                       { el: "li", ref: "toggle" }
                       { el: "li", ref: "itemholder", class: "itemname", children: @itemlayout() }
                    ]
                }
            ] },
            {
                el: "ul", ref: "childnodes"
            }
        ]
    
    itemlayout: () ->

class SimpleTreeViewItem extends TreeViewItemPrototype
    constructor: (r, o) ->
        super r, o


    __data__: (v) ->
        return unless v
        super.__data__(v)
        @refs.label.set "color", v.color if v.color
        @refs.label.set "text", v.name if v.name
        @refs.label.set "icon", v.icon if v.icon
        @refs.label.set "iconclass", v.iconclass if v.iconclass

    itemlayout: () ->
        [{ el: "afx-label", ref: "label" }]


class TreeViewTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "itemtag", "afx-tree-view-item"
        @setopt "data", undefined
        @setopt "treeroot", undefined
        @setopt "parent", undefined
        @setopt "indent", 0
        @setopt "open", true
        @setopt "itemindex", 0
        @setopt "ontreeselect", () ->
        @setopt "ontreedbclick", () ->
        @setopt "ondragndrop", () ->
        @setopt "selectedItem", undefined
        @setopt "fetch", undefined
        @setopt "dragndrop", false
        @setopt "treepath", @aid()
        @root.is_left = () => @is_left()
        @indexcounter = 0

    __selectedItem: (v) ->
        return unless v
        @get("selectedItem").set "selected", false if @get("selectedItem")
        v.set "selected", true


    itemclick: (e, flag) ->
        return unless e and e.item
        return if e.item is @get("selectedItem") and not flag
        @set "selectedItem", e.item
        evt = { id: @aid(), data: e }
        if flag
            @get("ontreedbclick")  evt
            @observable.trigger "treedbclick", evt
        else
            @get("ontreeselect")  evt
            @observable.trigger "treeselect", evt

    is_root: () ->
        return @get("treeroot") is undefined

    is_left: () ->
        data = @get "data"
        return true unless data
        return if data.nodes then false else true

    __data__: (v) ->
        return unless v
        $(@root).empty()
        @set "treepath", v.path if v.path
        tag = @get "itemtag"
        tag = v.tag if v.tag
        el = $("<#{tag}>").appendTo @root
        el[0].uify undefined
        el[0].set "treeroot", if @is_root() then @ else @get "treeroot"
        el[0].set "indent", @get("indent")
        el[0].set "itemindex", @get "itemindex"
        el[0].set "treepath", @get("treepath")
        el[0].set "open", @get("open")
        el[0].set "fetch", @get("fetch")
        el[0].set "parent", @root
        el[0].set "data", v
        if @is_root()
            $(@root).off "mousedown", @treemousedown
            $(@root).on "mousedown", @treemousedown if @get("dragndrop")

    mount: () ->
        @dnd = {}
        @treemousedown = (e) =>
            el = $(e.target).closest("afx-tree-view")
            return if el.length is 0
            el = el[0]
            return if el is @root
            @dnd.from = el
            @dnd.to = undefined
            $(window).on "mouseup", @treemouseup
            $(window).on "mousemove", @treemousemove
        
        @treemouseup = (e) =>
            $(window).off "mouseup", @treemouseup
            $(window).off "mousemove", @treemousemove
            ($ "#systooltip").hide()
            el = $(e.target).closest("afx-tree-view")
            return if el.length is 0
            el = el[0]
            el = el.get("parent") if el.is_left()
            return if el is @dnd.from or el is @dnd.from.get("parent")
            @dnd.to = el
            @__("ondragndrop") { id: @aid(), data: @dnd }
            @dnd = {}

        @treemousemove = (e) =>
            return unless e
            return unless @dnd.from
            data = @dnd.from.get("data")
            $label = $("#systooltip")
            top = e.clientY + 5
            left = e.clientX + 5
            $label.show()
            $label[0].set "text", data.name
            $label[0].set "icon", data.icon if data.icon
            $label[0].set "iconclass", data.iconclass if data.iconclass
            $label
                .css "top", top + "px"
                .css "left", left + "px"

Ant.OS.GUI.define "afx-tree-view", TreeViewTag
Ant.OS.GUI.define "afx-tree-view-item-proto", TreeViewItemPrototype
Ant.OS.GUI.define "afx-tree-view-item", SimpleTreeViewItem