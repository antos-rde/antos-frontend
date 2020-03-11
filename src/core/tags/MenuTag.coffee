
class MenuEntryTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "switch", false
        @setopt "radio", false
        @setopt "color", undefined
        @setopt "icon", undefined
        @setopt "iconclass", undefined
        @setopt "text", ""
        @setopt "shortcut", undefined
        @setopt "children", undefined
        @setopt "data", {}

    on_data_changed: (data) ->
        @set  k, v for k, v of data

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
        $(@refs.container).removeClass("afx_submenu")
        return $(@refs.submenu).hide() unless v and v.length > 0
        $(@refs.container).addClass("afx_submenu")
        $(@refs.submenu)
            .show()
            .attr("style", "")
        @refs.submenu.set "root", false
        @refs.submenu.set "items", v

    mount: () ->
        @refs.switch.set "enable", false

    layout: () ->
        [{
            el: "li", ref: "container", children: [
                {
                    el: "a", children: [
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
        @setopt "root", true
        @setopt "contentag", "afx-menu-entry"
        @setopt "items", []

    mount: () ->

    on_context_changed: (v) ->
        $(@refs.container).removeClass("context")
        $(@refs.container).addClass("context") if v

    on_items_changed: (data) ->
        $(@refs.container).empty()
        $("<li>").appendTo(@refs.container).addClass("afx-corner-fix")
        for item in data
            el = $("<#{@get("contentag")}>").appendTo @refs.container
            el[0].uify @observable
            el[0].set "data", item

        $("<li>").appendTo(@refs.container).addClass("afx-corner-fix")

    layout: () ->
        [{ el: "ul", ref: "container" }]

Ant.OS.GUI.define "afx-menu", MenuTag
Ant.OS.GUI.define "afx-menu-entry", MenuEntryTag