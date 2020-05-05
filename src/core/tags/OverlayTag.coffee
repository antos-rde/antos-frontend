class OverlayTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "width", 200
        @setopt "height", 400
    
    __width__: (v) ->
        @calibrate()
    
    __height__: (v) ->
        @calibrate()

    mount: () ->
        $(@root)
            .css("position", "absolute")
        @calibrate()

    calibrate: () ->
        $(@root)
            .css("width", @get("width") + "px")
            .css("height", @get("height") + "px")
        @observable.trigger "resize", {
            id: @aid(),
            data: {
                w: @get("width"),
                h: @get("height")
            }
        }

    layout: () ->
        [{
            el: "div", ref: "yield"
        }]
Ant.OS.GUI.define "afx-overlay", OverlayTag