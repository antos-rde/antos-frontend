class ListViewItemTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "data", {}
        @setopt "oncontextmenu", (e) ->
        @setopt "onclick", (e) ->
        @setopt "onselect", (e) ->
        @setopt "ondbclick", (e) ->
        @setopt "onclose", (e) ->
        @setopt "index", 0
        @setopt "closable", false
        @setopt "selected", false

    __closable__: (v) ->
        if v then $(@refs.btcl).show() else $(@refs.btcl).hide()

    __selected__: (v) ->
        $(@refs.item).removeClass()
        return unless v
        $(@refs.item).addClass "selected"
        @get("onselect")({ item: @root })

    mount: () ->
        $(@refs.item).attr "dataref", "afx-list-item"
        $(@refs.item).contextmenu (e) =>
            e.item = @root
            @get("oncontextmenu")(e)

        $(@refs.item).click (e) =>
            e.item = @root
            @get("onclick")(e)

        $(@refs.item).dblclick (e) =>
            e.item = @root
            @get("ondbclick")(e)
        $(@refs.btcl).click (e) =>
            e.item = @root
            @get("onclose")(e)
    layout: () ->
        [{
            el: "li", ref: "item", children: [
                @itemlayout(),
                { el: "i", class: "closable", ref: "btcl" }
            ]
        }]
    
    itemlayout: () ->

class SimpleListItemTag extends ListViewItemTag
    constructor: (r, o) ->
        super r, o

    __data__: (v) ->
        return unless v
        @refs.label.set "class", v.class if v.class
        @refs.label.set "color", v.color if v.color
        @refs.label.set "iconclass", v.iconclass if v.iconclass
        @refs.label.set "icon", v.icon if v.icon
        @refs.label.set "text", v.text if v.text
        @set "selected", v.selected if v.selected
        @set "closable", v.closable if v.closable

    __selected: (v) ->
        @get("data").selected = v

    update: () ->
        @set "data", @get("data")

    itemlayout: () ->
        { el: "afx-label", ref: "label" }

class ListViewTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "onlistselect", () ->
        @setopt "onlistdbclick", () ->
        @setopt "ondragndrop", () ->
        @setopt "onitemclose", () -> true
        @setopt "buttons", []
        @setopt "data", []
        @setopt "dropdown", false
        @setopt "itemtag", "afx-list-item"
        @setopt "multiselect", false
        @setopt "selectedItem", undefined
        @setopt "selectedItems", []
        @setopt "selected", -1
        @setopt "dragndrop", false
        $(@root)
            .css "display", "flex"
            .css "flex-direction", "column"
        @root.push = (e) => @push e
        @root.remove = (e) => @remove e
        @root.unshift = (e) => @unshift e
        @root.unselect = () => @unselect()
        @root.selectNext = () => @selectNext()
        @root.selectPrev = () => @selectPrev()

    multiselect: () ->
        return false if @get "dropdown"
        @get "multiselect"

    unshift: (item) ->
        @push item, true

    has_data: (v) ->
        @get("data").includes v

    push: (item, flag) ->
        tag = @get "itemtag"
        tag = item.tag if item.tag
        el = $("<#{tag}>")
        if flag
            @get("data").unshift item if not  @has_data item
            $(@refs.mlist).prepend el[0]
        else
            @get("data").push item if not  @has_data item
            el.appendTo @refs.mlist
        el[0].uify @observable
        el[0]
            .set "oncontextmenu", (e) =>
                @iclick e, true
            .set "ondbclick", (e) =>
                @idbclick e, false
            .set "onclick", (e) =>
                @iclick e, false
            .set "onselect", (e) =>
                @iselect e
            .set "onclose", (e) =>
                @iclose e
            .set "data", item
        item.domel = el[0]
        el[0]

    remove: (item) ->
        el = item.get "data"
        data = @get "data"
        @set "selectedItem", undefined if @get("selectedItem") is item
        list = @get("selectedItems")
        list.splice(list.indexOf(item), 1) if list.includes(item)
        if data.includes el
            data.splice data.indexOf(el), 1
        $(item).remove()

    selectNext: () ->
        return if @multiselect()
        el = @get "selectedItem"
        idx = 0
        idx = $(el).index() + 1 if el
        @set "selected", idx

    selectPrev: () ->
        return if @multiselect()
        el = @get "selectedItem"
        idx = 0
        idx = $(el).index() - 1 if el
        @set "selected", idx

    __selected__: (idx) ->
        return @unselect() if idx < 0
        data = @get "data"
        return if idx >= data.length
        data[idx].domel.set "selected", true

    __buttons__: (v) ->
        return if @get "dropdown"
        return unless v.length > 0
        for item in v
            $(@refs.btlist).show()
            bt = $("<afx-button>").appendTo @refs.btlist
            bt[0].uify @observable
            bt[0].set "*", item
            item.domel = bt[0]


    __data__: (data) ->
        $( @refs.mlist).empty()
        for item in data
            @push item, false
        $(@refs.container).off "mousedown", @onmousedown
        if @__("dragndrop") and not @__("dropdown")
            $(@refs.container).on "mousedown", @onmousedown


    unselect: () ->
        v.set "selected", false for v in @get("selectedItems")
        @set "selectedItems", []
        @set "selectedItem", undefined

    iclick: (e, flag) ->
        return if not e.item
        list = @get("selectedItems")
        if @multiselect() and list.includes(e.item) and not flag
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
            return if  @get("selectedItem") is e.item
            @get("selectedItem").set "selected", false if @get("selectedItem")
            @set "selectedItem", e.item
            @set "selectedItems", [e.item]
            e.items = [e.item]
            #scroll element
            li = $(e.item).children()[0]
            offset = $(@refs.container).offset()
            top = $(@refs.container).scrollTop()
            if ($(li).offset().top + $(li).height() > $(@refs.container).height() + offset.top)
                $(@refs.container).scrollTop(top + $(@refs.container).height() - $(li).height())
            else if ($(li).offset().top < offset.top)
                $(@refs.container).scrollTop(top - $(@refs.container).height() + $(li).height())

        if @get "dropdown"
            @refs.drlabel.set "*", e.item.get "data"
            $(@refs.mlist).hide()

        evt = { id: @aid(), data: e }
        @get("onlistselect") evt
        @observable.trigger "listselect", evt

    mount: () ->
        @dnd = {}
        @onmousedown = (e) =>
            el = $(e.target).closest("li[dataref='afx-list-item']")
            return if el.length is 0
            el = el.parent()[0]
            @dnd.from = el
            @dnd.to = undefined
            $(window).on "mouseup", @onmouseup
            $(window).on "mousemove", @onmousemove
        
        @onmouseup = (e) =>
            $(window).off "mouseup", @onmouseup
            $(window).off "mousemove", @onmousemove
            ($ "#systooltip").hide()
            el = $(e.target).closest("li[dataref='afx-list-item']")
            return if el.length is 0
            el = el.parent()[0]
            return if el is @dnd.from
            @dnd.to = el
            @__("ondragndrop") { id: @aid(), data: @dnd }
            @dnd = {}

        @onmousemove = (e) =>
            return unless e
            return unless @dnd.from
            data = @dnd.from.get("data")
            $label = $("#systooltip")
            top = e.clientY + 5
            left = e.clientX + 5
            $label.show()
            $label[0].set "*", data
            $label
                .css "top", top + "px"
                .css "left", left + "px"

        $(@refs.btlist).hide()
        @observable.on "resize", (e) => @calibrate()
        @calibrate()

    iclose: (e) ->
        return unless e.item
        evt = { id: @aid(), data: e }
        r = @get("onitemclose") evt
        return unless r
        @observable.trigger "itemclose", evt
        @remove(e.item)

    __dropdown__: (v) ->
        $(@refs.container).removeAttr "style"
        $(@refs.mlist).removeAttr "style"
        $(@refs.container).css "flex", 1
        $(@root).removeClass()
        drop = (e) =>
            @dropoff e
        show = (e) =>
            @showlist e
        if v
            $(@root).addClass "dropdown"
            $(@refs.current).show()
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