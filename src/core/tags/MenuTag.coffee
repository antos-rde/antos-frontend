
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
        $(@refs.shortcut).val v

    __children__: (v) ->
        me = @
        $(@refs.container).removeClass("afx_submenu")
        return $(@refs.submenu).hide() unless v and v.length > 0
        $(@refs.container).addClass("afx_submenu")
        $(@refs.submenu)
            .show()
            .attr("style", "")
        @refs.submenu.set "parent", @
        @refs.submenu.set "root", me.get("root")
        @refs.submenu.set "items", v
        if @is_root()
            $(@refs.container).mouseleave (e) ->
                $(me.refs.submenu).attr("style", "")

    mount: () ->
        me = @
        @refs.switch.set "enable", false
        $(@refs.entry).click (e) -> me.select e

    submenuoff: () ->
        p = @get "parent"
        return $(@refs.submenu).attr("style", "") unless p
        p.submenuoff()

    reset_radio: () ->
        return unless  @has_children()
        for v in @get "children"
            return unless v.domel.get "radio"
            v.domel.set "checked", false


    select: (e) ->
        me = @
        e.item = @root
        evt = { id: @aid(), data: e }
        e.preventDefault()
        if @is_root() and @has_children() and not @get "context"
            $(@refs.submenu).show()
        else
            @submenuoff()
        if @get "switch"
            @set "checked", !@get "checked"
        else if @get "radio"
            p = @get "parent"
            p.reset_radio() if p
            @set "checked", !@get "checked"
        @get("onmenuselect") evt
        if @get("parent")
            @get("parent").get("onchildselect") evt
        if @get("root")
            @get("root").get("onmenuitemselect") evt

    layout: () ->
        [{
            el: "li", ref: "container", children: [
                {
                    el: "a", ref: "entry", children: [
                        { el: "afx-switch", ref: "switch" },
                        { el: "afx-label", ref: "label" },
                        { el: "span", class: "shortcut", ref: "shortcut" }
                    ]
                },
                { el: "afx-menu", ref: "submenu" }
            ]
        }]

class MenuTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        me = @
        @setopt "context", false
        @setopt "parent", undefined
        @setopt "root", undefined
        @setopt "contentag", "afx-menu-entry"
        @setopt "onmenuitemselect", (e) -> me.handleselect e
        @setopt "onmenuselect", (e) ->
        @setopt "items", []
        @root.show = (e) ->
            me.showctxmenu e

    handleselect: (e) ->
        $(@root).hide() if @isctxmenu()
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
        me = @
        return unless me.isctxmenu()
        $(@refs.container).mouseleave (e) ->
            return unless me.is_root()
            $(me.root).hide()
    __context__: (v) ->
        $(@refs.container).removeClass("context")
        return unless v
        $(@refs.container).addClass("context")
        $(@root).hide()

    __items__: (data) ->
        me = @
        $(@refs.container).empty()
        $("<li>").appendTo(@refs.container).addClass("afx-corner-fix")
        for item in data
            el = $("<#{@get("contentag")}>").appendTo @refs.container
            el[0].uify undefined
            el[0].set "parent", me.get("parent")
            el[0].set "root", if me.get("parent") then me.get("parent").get("root") else me
            el[0].set "data", item
            item.domel = el[0]
        $("<li>").appendTo(@refs.container).addClass("afx-corner-fix")

    layout: () ->
        [{ el: "ul", ref: "container" }]

Ant.OS.GUI.define "afx-menu", MenuTag
Ant.OS.GUI.define "afx-menu-entry-proto", MenuEntryTag
Ant.OS.GUI.define "afx-menu-entry", SimpleMenuEntryTag