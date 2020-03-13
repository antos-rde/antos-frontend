
class MenuEntryTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "data", {}
        @setopt "onmenuselect", () ->
        @setopt "children", undefined
        @setopt "child", undefined
        @setopt "parent", undefined

    on_data_changed: (data) ->
        @set  k, v for k, v of data
    
    on_child_changed: (v) ->
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

    on_switch_changed: (v) ->
        if @get("radio") or v
            $(@refs.switch).show()
        else
            $(@refs.switch).hide()
    
    on_radio_changed: (v) ->
        if @get("switch") or v
            $(@refs.switch).show()
        else
            $(@refs.switch).hide()

    on_checked_changed: (v) ->
        return unless @get("radio") or @get("switch")
        @refs.switch.set "swon", v

    on_color_changed: (v) ->
        return unless  v
        @refs.label.set "color", v
    
    on_icon_changed: (v) ->
        $(@refs.container).removeClass("fix_padding")
        return unless v
        @refs.label.set "icon", v
        $(@refs.container).addClass("fix_padding")
    
    on_iconclass_changed: (v) ->
        return unless v
        @refs.label.set "iconclass", v

    on_text_changed: (v) ->
        return unless v isnt undefined
        @refs.label.set "text", v
    
    on_shortcut_changed: (v) ->
        $(@refs.shortcut).hide()
        return unless v
        $(@refs.shortcut).show()
        $(@refs.shortcut).val v

    on_children_changed: (v) ->
        me = @
        $(@refs.container).removeClass("afx_submenu")
        return $(@refs.submenu).hide() unless v and v.length > 0
        $(@refs.container).addClass("afx_submenu")
        $(@refs.submenu)
            .show()
            .attr("style", "")
        @refs.submenu.set "parent", @
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
        children = @get("children")
        if @is_root() and @has_children()
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
        @observable.trigger "menuselect", evt

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
        @setopt "context", false
        @setopt "parent", undefined
        @setopt "contentag", "afx-menu-entry"
        @setopt "items", []

    mount: () ->

    on_context_changed: (v) ->
        $(@refs.container).removeClass("context")
        $(@refs.container).addClass("context") if v

    on_items_changed: (data) ->
        me = @
        $(@refs.container).empty()
        $("<li>").appendTo(@refs.container).addClass("afx-corner-fix")
        for item in data
            el = $("<#{@get("contentag")}>").appendTo @refs.container
            el[0].uify @observable
            el[0].set "data", item
            el[0].set "parent", me.get("parent")
            item.domel = el[0]
        $("<li>").appendTo(@refs.container).addClass("afx-corner-fix")

    layout: () ->
        [{ el: "ul", ref: "container" }]

Ant.OS.GUI.define "afx-menu", MenuTag
Ant.OS.GUI.define "afx-menu-entry-proto", MenuEntryTag
Ant.OS.GUI.define "afx-menu-entry", SimpleMenuEntryTag