class TileLayoutTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o, @conf) ->
        super r, o
        @setopt @conf.opt, "grow"
        @mount()

    mount: () ->
        $(@refs.yield)
            .css("display", "flex")
            .css("flex-direction", @conf.dir)
            .css("width", "100%")
        me = @
        @observable.on "resize", (e) -> me.calibrate()
        @observable.on "calibrate", (e) -> me.calibrate()
        @calibrate()

    calibrate: () ->
        

    layout: () ->
        {
            el: "div", class: "afx-#{@conf.name}-container", ref: "yield"
        }


class HBoxTag extends TileLayoutTag
    constructor: (r, o) ->
        super r, o, {
            name: "hbox",
            dir: "row",
            opt: "data-width"
        }
        

class VBoxTag extends TileLayoutTag
    constructor: (r, o) ->
        super r, o, {
            name: "vbox",
            dir: "column",
            opt: "data-height"
        }