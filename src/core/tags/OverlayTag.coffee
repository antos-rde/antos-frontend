class OverlayTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "width", undefined
        @setopt "height", undefined
        $(@refs.yield)
            .css("position", "relative")
            .css("width", "100%" )
            .css("height", "100%")
        $(@root)
            .css("position", "absolute")
            .css "z-index", 1000000
            #.css "display", "flex"
            #.css "flex-direction", "column"
        #$(@refs.yield).css "flex", "1"

    __width__: (v) ->
        return unless v
        @calibrate()
    
    __height__: (v) ->
        return unless v
        @calibrate()

    mount: () ->
        @calibrate()

    calibrate: () ->
        $(@root)
            .css("width", @get("width") )
            .css("height", @get("height"))
        @observable.trigger "resize", {
            id: @aid(),
            data: {
                w: @get("width"),
                h: @get("height")
            }
        }

    layout: () ->
        [{
            el: "afx-vbox", ref: "yield"
        }]
Ant.OS.GUI.define "afx-overlay", OverlayTag