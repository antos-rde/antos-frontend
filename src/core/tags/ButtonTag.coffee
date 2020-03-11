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
    

    on_color_changed: (v) ->
        console.log @refs
        @refs.label.set "color", v
    
    on_icon_changed: (v) ->
        @refs.label.set "icon", v
    
    on_iconclass_changed: (v) ->
        @refs.label.set "iconclass", v
    
    on_text_changed: (v) ->
        @refs.label.set "text", v
    
    on_enable_changed: (v) ->
        $(@refs.button).prop "disabled", !(@get "enable")
    
    on_selected_changed: (v) ->
        $(@button).removeClass()
        $(@button).addClass "selected" if v

    mount: () ->
        me = @
        @root.trigger = () ->
            ($me.refs.button).trigger "click"

        $(@refs.button).click (e) ->
            me.btclickhd e
    
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