class ListViewItemTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        me = @
        @setopt "data", {}
        @setopt "oncontextmenu", (e) ->
        @setopt "onclick", (e) ->
        @setopt "onselect", (e) ->
        @setopt "ondbclick", (e) ->
        @setopt "onclose", (e) ->
        @setopt "index", 0
        @setopt "closable", false
        @setopt "selected", false
        
class SimpleListItemTag extends ListViewItemTag
    constructor: (r, o) ->
        super r, o
    mount: () ->
        me = @
        @refs.item.oncontextmenu = (e) ->
            me.get("oncontextmenu")(e)

        $(@refs.item).click (e) ->
            e.item = me.root
            me.get("onclick")(e)

        $(@refs.item).dblclick (e) ->
            e.item = me.root
            me.get("ondbclick")(e)
        $(@refs.btcl).click (e) ->
            e.item = me.root
            me.get("onclose")(e)

    on_closable_changed: (v) ->
        if v then $(@refs.btcl).show() else $(@refs.btcl).hide()

    on_selected_changed: (v) ->
        $(@refs.item).removeClass()
        return unless v
        $(@refs.item).addClass "selected"
        @get("onselect")({ item: @root })

    on_data_changed: (v) ->
        return unless v
        @refs.label.set "class", v.class if v.class
        @refs.label.set "color", v.color if v.color
        @refs.label.set "iconclass", v.iconclass if v.iconclass
        @refs.label.set "icon", v.icon if v.icon
        @refs.label.set "text", v.text if v.text
        @set "selected", v.selected if v.selected
        @set "closable", v.closable if v.closable

    layout: () ->
        [{
            el: "li", ref: "item", children: [
                { el: "afx-label", ref: "label" },
                { el: "i", class: "closable", ref: "btcl" }
            ]
        }]


class ListViewTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "onlistselect", () ->
        @setopt "onlistdbclick", () ->
        @setopt "onitemclose", () ->
        @setopt "buttons", []
        @setopt "data", {}
        @setopt "dropdown", false
        @setopt "itemtag", "afx-list-item"
        @setopt "multiselect", false
        @setopt "selectedItem", undefined
        @setopt "selectedItems", []
        $(@root)
            .css "display", "flex"
            .css "flex-direction", "column"

    multiselect: () ->
        return false if @get "dropdown"
        @get "multiselect"


    on_buttons_changed: (v) ->
        return if @get "dropdown"
    
    on_data_changed: (data) ->
        $( @refs.mlist).empty()
        for item in data
            el = $("<#{@get "itemtag"}>").appendTo @refs.mlist
            el[0].uify @observable
            me = @
            el[0]
                .set "data", item
                .set "oncontextmenu", (e) ->
                    me.iclick e
                .set "ondbclick", (e) ->
                    me.idbclick e
                .set "onclick", (e) ->
                    me.iclick e
                .set "onselect", (e) ->
                    me.iselect e
                .set "onclose", (e) ->
                    me.iclose e

    iclick: (e) ->
        return if not e.item
        list = @get("selectedItems")
        if @multiselect() and list.includes(e.item)
            list.splice(list.indexOf(e.item), 1)
            return e.item.set "selected", false
        e.item.set "selected", true

    idbclick: (e) ->
        evt = { id: @aid(), data: e }
        @get("onlistdbclick") evt
        @observable.trigger "listdbclick", evt
    iselect: (e) ->
        return unless e.item
        if @multiselect()
            return if @get("selectedItems").includes e.item
            @set "selectedItem", e.item
            @get("selectedItems").push e.item
            e.items = @get("selectedItems")
        else
            @get("selectedItem").set "selected", false if @get("selectedItem")
            @set "selectedItem", e.item
            @set "selectedItems", [e.item]
            e.items = [e.item]

        if @get "dropdown"
            @refs.drlabel.set "*", e.item.get "data"
            $(@refs.mlist).hide()

        evt = { id: @aid(), data: e }
        @get("onlistselect") evt
        @observable.trigger "listselect", evt

    iclose: (e) ->
        return unless e.item
        $(e.item).remove()

    on_dropdown_changed: (v) ->
        $(@refs.container).removeAttr "style"
        $(@refs.mlist).removeAttr "style"
        $(@refs.container).css "flex", 1
        $(@root).removeClass()
        me = @
        drop = (e) ->
            me.dropoff e
        show = (e) ->
            me.showlist e
        calib = (e) ->
            me.calibrate e
        if v
            $(@root).addClass "dropdown"
            $(@refs.current).show()
            @observable.on "calibrate", calib
            @observable.on "resize", calib
            $(document).on "click", drop
            $(@refs.current).on "click", show
            $(@refs.container)
                .css "position", "absolute"
                .css "display", "inline-block"
            $(@refs.mlist)
                .css "position", "absolute"
                .css "display", "none"
                .css "top", "100%"
                .css "left", "0"
            @calibrate()
        else
            $(@refs.current).hide()
            @observable.off "calibrate", calib
            @observable.off "resize", calib
            $(document).off "click", drop
            $(@refs.current).off "click", show

    showlist: (e) ->
        return unless @get "dropdown"
        desktoph = $(Ant.OS.GUI.workspace).height()
        offset = $(@root).offset().top + $(@refs.mlist).height()
        if offset > desktoph
            $(@refs.mlist)
                .css "top", "-#{$(@refs.mlist).outerHeight()}px"
        else
            $(@mlist).css "top", "100%"
        $(@refs.mlist).show()

    dropoff: (e) ->
        $(@refs.mlist).hide() if $(e.target).closest(@refs.container).length is 0
        

    calibrate: (e) ->
        return unless @get "dropdown"
        w = "#{$(@root).width()}px"
        $(@refs.container).css "width", w
        $(@refs.current).css "width", w
        $(@refs.mlist).css "width", w


    layout: () ->
        [
            {
                el: "div",
                class: "list-container",
                ref: "container",
                children: [
                    {
                        el: "div", ref: "current", children: [
                            { el: "afx-label", ref: "drlabel" }
                        ]
                    },
                    { el: "ul", ref: "mlist" }
                ]
            },
            { el: "div", class: "button_container", ref: "btlist" }
        ]

Ant.OS.GUI.define "afx-list-view", ListViewTag
Ant.OS.GUI.define "afx-list-item-proto", ListViewItemTag
Ant.OS.GUI.define "afx-list-item", SimpleListItemTag