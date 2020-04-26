class SliderTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "dragable", true
        @setopt "max", 100
        @setopt "value", 0
        @setopt "onchanging", (e) ->
        @setopt "onchange", (e) ->
    

    __value__: () ->
        @calibrate()
    
    __max__: () ->
        @calibrate()

    __dragable__: (v) ->
        if v
            me = @
            $(@root)
                .mouseover () ->
                    $(me.refs.point).show()
                .mouseout () ->
                    $(me.refs.point).hide()
        else
            $(@refs.point).hide()
            $(@root)
                .unbind("mouseover")
                .ubbind("mouseout")
    
    mount: () ->
        me = @
        @enable_dragging()
        $(@refs.point).css "position", "absolute"
        $(@refs.point).hide()
        @observable.on "resize", (e) ->
            me.calibrate()
        $(@refs.container).click (e) ->
            offset = $(me.refs.container).offset()
            left = e.clientX  - offset.left
            maxw = $(me.refs.container).width()
            me.set "value", left * me.get("max") / maxw
            me.calibrate()
            evt = { id: me.aid(), data: me.get("value") }
            me.get("onchange") evt
            me.get("onchanging") evt
        @calibrate()

    calibrate: () ->
        @set "value", @get("max") if @get("value") > @get("max")
        $(@refs.container).css "width", $(@root).width() + "px"
        w = $(@refs.container).width() * @get("value") / @get("max")
        $(@refs.prg)
            .css "width", w + "px"
            .css "height", $(@refs.container).height() + "px"
        if @get("dragable")
            ow = w - $(@refs.point).width() / 2
            top = Math.floor(($(@refs.prg).height() - $(@refs.point).height()) / 2)
            $(@refs.point)
                .css "left", ow + "px"
                .css "top", top + "px"

    enable_dragging: () ->
        me = @
        $(@refs.point)
            .css "user-select", "none"
            .css "cursor", "default"
        $(@refs.point).on "mousedown", (e) ->
            e.preventDefault()
            offset = $(me.refs.container).offset()
            $(window).on "mousemove", (e) ->
                left = e.clientX  - offset.left
                left = if left < 0 then 0 else left
                maxw = $(me.refs.container).width()
                left = if left > maxw then maxw else left
                me.set "value", left * me.get("max") / maxw
                me.calibrate()
                me.get("onchanging") { id: me.aid(), data: me.get("value") }

            $(window).on "mouseup", (e) ->
                me.get("onchange") { id: me.aid(), data: me.get("value") }
                $(window).unbind("mousemove", null)
                $(window).unbind("mouseup", null)

    layout: () ->
        [{
            el: "div", class: "container", ref: "container", children: [
                { el: "div", class: "progress", ref: "prg" },
                { el: "div", class: "dragpoint", ref: "point" }
            ]
        }]

Ant.OS.GUI.define "afx-slider", SliderTag