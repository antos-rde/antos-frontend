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
            $(@root)
                .mouseover () =>
                    $(@refs.point).show()
                .mouseout () =>
                    $(@refs.point).hide()
        else
            $(@refs.point).hide()
            $(@root)
                .unbind("mouseover")
                .ubbind("mouseout")
    
    mount: () ->
        @enable_dragging()
        $(@refs.point).css "position", "absolute"
        $(@refs.point).hide()
        @observable.on "resize", (e) =>
            @calibrate()
        $(@refs.container).click (e) =>
            offset = $(@refs.container).offset()
            left = e.clientX  - offset.left
            maxw = $(@refs.container).width()
            @set "value", left * @get("max") / maxw
            @calibrate()
            evt = { id: @aid(), data: @get("value") }
            @get("onchange") evt
            @get("onchanging") evt
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
        $(@refs.point)
            .css "user-select", "none"
            .css "cursor", "default"
        $(@refs.point).on "mousedown", (e) =>
            e.preventDefault()
            offset = $(@refs.container).offset()
            $(window).on "mousemove", (e) =>
                left = e.clientX  - offset.left
                left = if left < 0 then 0 else left
                maxw = $(@refs.container).width()
                left = if left > maxw then maxw else left
                @set "value", left * @get("max") / maxw
                @calibrate()
                @get("onchanging") { id: @aid(), data: @get("value") }

            $(window).on "mouseup", (e) =>
                @get("onchange") { id: @aid(), data: @get("value") }
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