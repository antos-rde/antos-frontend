class ButtonTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "color", undefined
        @setopt "icon", undefined
        @setopt "iconclass", undefined
        @setopt "text", ""
        @setopt "enable", true
        
    layout: () ->
        {
            el: "Button", ref: "button", children: [
                { el: "afx-label", ref: "label" }
            ]
        }


Ant.OS.GUI.define "afx-button", ButtonTag