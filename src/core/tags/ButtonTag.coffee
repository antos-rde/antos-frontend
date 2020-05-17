class ButtonTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "color", undefined
        @setopt "icon", undefined
        @setopt "iconclass", undefined
        @setopt "text", ""
        @setopt "enable", true
        @setopt "selected", false
        @setopt "toggle", false
        @setopt "onbtclick", () ->
    

    __color__: (v) ->
        @refs.label.set "color", v
    
    __icon__: (v) ->
        @refs.label.set "icon", v
    
    __iconclass__: (v) ->
        @refs.label.set "iconclass", v
    
    __text__: (v) ->
        @refs.label.set "text", v
    
    __enable__: (v) ->
        $(@refs.button).prop "disabled", !(@get "enable")
    
    __selected__: (v) ->
        $(@button).removeClass()
        $(@button).addClass "selected" if v

    mount: () ->
        @root.trigger = () =>
            $(@refs.button).trigger "click"

        $(@refs.button).click (e) =>
            @btclickhd e
    
    btclickhd: (e) ->
        hd = @get "onbtclick"
        if typeof hd is "string"
            eval hd
        else if hd
            hd { id: @aid(), data: e }
        @observable.trigger "btclick", { id: @aid(), data: e }
        if @toggle
            @set "selected", !@get "selected"

    layout: () ->
        [{
            el: "Button", ref: "button", children: [
                { el: "afx-label", ref: "label" }
            ]
        }]


Ant.OS.GUI.define "afx-button", ButtonTag