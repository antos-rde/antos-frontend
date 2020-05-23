
class MenuEntryTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "data", {}
        @setopt "onmenuselect", () ->
        @setopt "onchildselect", () ->
        @setopt "children", undefined
        @setopt "child", undefined
        @setopt "parent", undefined
        @setopt "root", undefined

    __data__: (data) ->
        @set  k, v for k, v of data
    
    __child__: (v) ->
        @set "children", v

    has_children: () ->
        ch = @get "children"
        return ch and ch.length > 0

    is_root: () ->
        return if @get "parent" then false else true
    
    layout: () ->
        [{
            el: "li", ref: "container", children: [
                {
                    el: "a", ref: "entry", children: @itemlayout()
                },
                { el: "afx-menu", ref: "submenu" }
            ]
        }]
    __children__: (v) ->
        $(@refs.container).removeClass("afx_submenu")
        return $(@refs.submenu).hide() unless v and v.length > 0
        $(@refs.container).addClass("afx_submenu")
        $(@refs.submenu)
            .show()
            .attr("style", "")
        @refs.submenu.set "parent", @
        @refs.submenu.set "root", @get("root")
        @refs.submenu.set "items", v
        if @is_root()
            $(@refs.container).mouseleave (e) =>
                $(@refs.submenu).attr("style", "")

    mount: () ->
        $(@refs.entry).click (e) => @select e

    submenuoff: () ->
        p = @get "parent"
        return $(@refs.submenu).attr("style", "") unless p
        p.submenuoff()

    select: (e) ->
        e.item = @root
        evt = { id: @aid(), data: e }
        e.preventDefault()
        if @is_root() and @has_children() and not @get "context"
            $(@refs.submenu).show()
        else
            @submenuoff()
        @get("onmenuselect") evt
        if @get("parent")
            @get("parent").get("onchildselect") evt
        if @get("root")
            @get("root").get("onmenuitemselect") evt

    itemlayout: () ->

class SimpleMenuEntryTag extends MenuEntryTag
    constructor: (r, o) ->
        super r, o
        @setopt "switch", false
        @setopt "radio", false
        @setopt "color", undefined
        @setopt "icon", undefined
        @setopt "iconclass", undefined
        @setopt "text", ""
        @setopt "shortcut", undefined
        @setopt "checked", false

    __switch__: (v) ->
        if @get("radio") or v
            $(@refs.switch).show()
        else
            $(@refs.switch).hide()
    
    __radio__: (v) ->
        if @get("switch") or v
            $(@refs.switch).show()
        else
            $(@refs.switch).hide()

    __checked__: (v) ->
        @get("data").checked = v
        return unless @get("radio") or @get("switch")
        @refs.switch.set "swon", v

    __color__: (v) ->
        return unless  v
        @refs.label.set "color", v
    
    __icon__: (v) ->
        $(@refs.container).removeClass("fix_padding")
        return unless v
        @refs.label.set "icon", v
        $(@refs.container).addClass("fix_padding")
    
    __iconclass__: (v) ->
        return unless v
        @refs.label.set "iconclass", v

    __text__: (v) ->
        return unless v isnt undefined
        @refs.label.set "text", v
    
    __shortcut__: (v) ->
        $(@refs.shortcut).hide()
        return unless v
        $(@refs.shortcut).show()
        $(@refs.shortcut).text v

    reset_radio: () ->
        return unless  @has_children()
        for v in @get "children"
            return unless v.domel.get "radio"
            v.domel.set "checked", false

    mount: () ->
        super.mount()
        @refs.switch.set "enable", false

    select: (e) ->
        if @get "switch"
            @set "checked", !@get "checked"
        else if @get "radio"
            p = @get "parent"
            p.reset_radio() if p
            @set "checked", !@get "checked"
        super.select(e)

    itemlayout: () ->
        [
            { el: "afx-switch", ref: "switch" },
            { el: "afx-label", ref: "label" },
            { el: "span", class: "shortcut", ref: "shortcut" }
        ]

class MenuTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "context", false
        @setopt "parent", undefined
        @setopt "root", undefined
        @setopt "contentag", "afx-menu-entry"
        @setopt "onmenuitemselect", (e) => @handleselect e
        @setopt "onmenuselect", (e) ->
        @setopt "items", []
        @root.show = (e) =>
            @showctxmenu e
        @root.push = (e) => @push e
        @root.remove = (e) => @remove e
        @root.unshift = (e) => @unshift e

    handleselect: (e) ->
        $(@root).hide() if @isctxmenu()
        e.id = @aid()
        @get("onmenuselect") e
        @observable.trigger "menuselect", e

    showctxmenu: (e) ->
        return unless @get "context"
        $(@root)
            .css("top", e.clientY - 15 + "px")
            .css("left", e.clientX  - 5 +  "px")
            .show()

    isctxmenu: () ->
        return @get "context"

    is_root: () ->
        return @get("root") is undefined

    mount: () ->
        $(@refs.container).css "display", "contents"
        return unless @isctxmenu()
        $(@refs.wrapper).mouseleave (e) =>
            return unless @is_root()
            $(@root).hide()

    __context__: (v) ->
        $(@refs.wrapper).removeClass("context")
        return unless v
        $(@refs.wrapper).addClass("context")
        $(@root).hide()

    unshift: (item) ->
        @push item, true

    remove: (item) ->
        el = item.get "data"
        data = @get "items"
        if data.includes el
            data.splice data.indexOf(el), 1
        $(item).remove()

    push: (item, flag) ->
        tag = @get "contentag"
        tag = item.tag if item.tag
        items = @get "items"
        el = $("<#{tag}>")
        if flag
            $(@refs.container).prepend el[0]
            @get("items").unshift item if not items.includes item
        else
            el.appendTo @refs.container
            @get("items").push item if not items.includes item
        el[0].uify undefined
        el[0].set "parent", @get("parent")
        el[0].set "root", if @get("parent") then @get("parent").get("root") else @
        el[0].set "data", item
        item.domel = el[0]
        el[0]

    __items__: (data) ->
        $(@refs.container).empty()
        for item in data
            @push item, false

    layout: () ->
        [{ el: "ul", ref: "wrapper", children: [
            { el: "li", class: "afx-corner-fix" },
            { el: "div", ref: "container" },
            { el: "li", class: "afx-corner-fix" }
        ] }]

Ant.OS.GUI.define "afx-menu", MenuTag
Ant.OS.GUI.define "afx-menu-entry-proto", MenuEntryTag
Ant.OS.GUI.define "afx-menu-entry", SimpleMenuEntryTag