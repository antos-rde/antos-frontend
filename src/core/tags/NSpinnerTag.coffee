
class NSpinnerTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "value", 0
        @setopt "step", 1
        @setopt "onchange", (e) ->
    
    mount: () ->
        me = @
        $(@refs.holder).attr "type", "text"
        $(@refs.incr).click (e) ->
            me.set "value", (me.get("value") + me.get("step") )
            e.nspin = me.get "value"
            me.get("onchange")(e)
            me.observable.trigger "nspin", { id: me.aid(), evt: e }
         $(@refs.decr).click (e) ->
            me.set "value", (me.get("value") - me.get("step") )
            e.nspin = me.get "value"
            me.get("onchange")(e)
            me.observable.trigger "nspin", { id: me.aid(), evt: e }

    on_value_changed: (v) ->
        $(@refs.holder).val @get("value")

    
        
    layout: () ->
        [
            {
                el: "input", ref: "holder"
            },
            {
                el: "ul", ref: "spinner", children: [
                    { el: "li", class: "incr", ref: "incr", children: [
                        { el: "i" }
                    ] },
                    { el: "li", class: "decr", ref: "decr",  children: [
                        { el: "i" }
                    ] }
                ]
            }
        ]

Ant.OS.GUI.define "afx-nspinner", NSpinnerTag