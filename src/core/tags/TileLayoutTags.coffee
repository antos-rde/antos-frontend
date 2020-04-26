class TileLayoutTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "name", undefined
        @setopt "dir", undefined
        $(@root).css("display", "block")
        $(@refs.yield)
            .css("display", "flex")
            .css("width", "100%")
        # @setopt @conf.opt, "grow"

    __name__: (v) ->
        return unless v
        $(@refs.yield)
            .removeClass()
            .addClass("afx-#{v}-container")
        @calibrate()

    __dir__: (v) ->
        return unless v
        $(@refs.yield)
            .css("flex-direction", v)
        @calibrate()

    mount: () ->
        me = @
        @observable.on "resize", (e) -> me.calibrate()
        @calibrate()

    calibrate: () ->
        return @hcalibrate() if @get("dir") is "row"
        @vcalibrate() if @get("dir") is "column"

    hcalibrate: () ->
        auto_width = []
        ocwidth = 0
        avaiheight = $(@root).height()
        avaiWidth = $(@root).width()
        $(@refs.yield).css "height",  "#{avaiheight}px"
        $(@refs.yield)
            .children()
            .each (e) ->
                dw = $(@).attr "data-width"
                if dw and dw isnt "grow"
                    dw = Number(dw.slice(0, -1)) * avaiWidth / 100 if dw[dw.length - 1] is "%"
                    $(@).css "width", "#{dw}px"
                    ocwidth += Number dw
                else
                    $(@).css "flex-grow", "1"
                    auto_width.push(@)

        csize = (avaiWidth - ocwidth) / auto_width.length
        if csize > 0
            $.each auto_width, (i, v) ->
                $(v).css "width", "#{csize}px"
        @observable.trigger "hboxchange",  { id: @aid(), data: { w: avaiWidth, h: avaiheight } }

    vcalibrate: () ->
        auto_height = []
        ocheight = 0
        avaiheight = $(@root).height()
        avaiwidth = $(@root).width()
        $(@refs.yield).css "height", "#{avaiheight}px"
        $(@refs.yield)
            .children()
            .each (e) ->
                dh = $(@).attr "data-height"
                if dh and dh isnt "grow"
                    dh = Number(dh.slice(0, -1)) * avaiheight / 100 if dh[dh.length - 1] is "%"
                    $(@).css "height", "#{dh}px"
                    ocheight += Number(dh)
                else
                    $(@).css "flex-grow", "1"
                    auto_height.push @

        csize = (avaiheight - ocheight) / auto_height.length
        if csize > 0
            $.each auto_height, (i, v) ->
                $(v).css "height", "#{csize}px"

        @observable.trigger "vboxchange", { id: @aid(), data: { w: avaiwidth, h: avaiheight } }

    layout: () ->
        [{
            el: "div", ref: "yield"
        }]


class HBoxTag extends TileLayoutTag
    constructor: (r, o) ->
        super r, o
        @set "dir", "row"
        @set "name", "hbox"

class VBoxTag extends TileLayoutTag
    constructor: (r, o) ->
        super r, o
        @set "dir", "column"
        @set "name", "vbox"
    
    
Ant.OS.GUI.define "afx-tile", TileLayoutTag
Ant.OS.GUI.define "afx-hbox", HBoxTag
Ant.OS.GUI.define "afx-vbox", VBoxTag