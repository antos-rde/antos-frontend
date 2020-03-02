
class MenuEntrySimpleContentTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "data", {}

    layout: () ->
        [{
            el: "a", children: [
                { el: "afx-switch" },
                { el: "afx-label" },
                { el: "span", class: "shortcut" }
            ]
        }]
    
class MenuEntryTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "data", {}
        @setopt "contentag", "afx-menu-entry"
    
    on_data_changed: (v) ->


    layout: () ->
        [{
            el: "li", ref: "container"
        }]

class MenuTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "context", false
        
    layout: () ->
        [{
            el: "ul", children: [
                { el: "li", ref: "start", class: "afx-corner-fix" },
                { el: "li", ref: "end", class: "afx-corner-fix" }
            ]
        }]

Ant.OS.GUI.define "afx-menu", MenuTag
Ant.OS.GUI.define "afx-menu-entry", MenuEntrySimpleContentTag