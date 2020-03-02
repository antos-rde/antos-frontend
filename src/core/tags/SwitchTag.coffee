
class SwitchTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "swon", false
        @setopt "enable", true
        @setopt "onchange", (e) ->
    
    mount: () ->
        me = @
        $(@refs.switch).click (e) ->
            me.onchange(e)

    onchange: (e) ->
        return unless @get "enable"
        @setopt "swon", !@get("swon")
        e.swon = @get "swon"
        @get("onchange")(e)
        @observable.trigger "switch", { id: @aid(), evt: e }

    on_swon_changed: (v) ->
        $(@refs.switch).removeClass()
        $(@refs.switch).addClass "swon" if v
        
    layout: () ->
        [{
            el: "span", ref: "switch"
        }]

Ant.OS.GUI.define "afx-switch", SwitchTag