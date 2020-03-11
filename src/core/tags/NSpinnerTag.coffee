
class NSpinnerTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "onchange", (e) ->
        @setopt "value", 0
        @setopt "step", 1
    
    mount: () ->
        me = @
        $(@refs.holder).attr "type", "text"
        $(@refs.incr).click (e) ->
            me.set "value", (me.get("value") + me.get("step") )

         $(@refs.decr).click (e) ->
            me.set "value", (me.get("value") - me.get("step") )
        
        # @observable.on "calibrate", () -> me.calibrate()
        @observable.on "resize", () -> me.calibrate()

        $(@refs.holder).on 'keyup', (e) ->
            if e.keyCode is 13
                val = me.refs.holder.value
                if not isNaN(val)
                    val = parseInt(val)
                    val = me.value if val < 0
                    me.set "value", val
        @calibrate()

    calibrate: () ->
        $(@refs.holder).css "width", $(@root).width() - 20 + "px"
        $(@refs.holder).css "height", $(@root).height() + "px"
        $(@refs.spinner)
            .css "width", "20px"
            .css "height", $(@root).height() + "px"
        $(@refs.incr)
            .css "height", $(@root).height() / 2 - 2 + "px"
            .css "position", "relative"
        $(@refs.decr).css "height", $(@root).height() / 2 - 2 + "px"
            .css "position", "relative"
        $(@refs.spinner).find("li")
            .css "display", "block"
            .css "text-align", "center"
            .css "vertical-align", "middle"
        $(@refs.spinner).find("i")
            .css "font-size", "16px"
            .css "position", "absolute"
        fn = (ie, pos) ->
            el = $(ie).find("i")
            el
            .css pos, ($(ie).height() - el.height()) / 2 + "px"
            .css "left", ($(ie).width() - el.width()) / 2 + "px"
        fn @refs.decr, "bottom"
        fn @refs.incr, "top"

    on_value_changed: (v) ->
        $(@refs.holder).val @get("value")
        evt = { id: @aid(), data: v }
        @get("onchange")(evt)
        @observable.trigger "nspin", evt
        
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