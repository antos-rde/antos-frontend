class TileLayoutTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o, @conf) ->
        super r, o
        @setopt @conf.opt, "grow"

    mount: () ->
        $(@root).css("display", "block")
        $(@refs.yield)
            .addClass("afx-#{@conf.name}-container")
            .css("display", "flex")
            .css("flex-direction", @conf.dir)
            .css("width", "100%")
        me = @
        @observable.on "resize", (e) -> me.calibrate()
        @observable.on "calibrate", (e) -> me.calibrate()
        @calibrate()

    calibrate: () ->


    layout: () ->
        [{
            el: "div", ref: "yield"
        }]


class HBoxTag extends TileLayoutTag
    constructor: (r, o) ->
        super r, o, {
            name: "hbox",
            dir: "row",
            opt: "data-width"
        }
    
    calibrate: () ->
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
        @observable.trigger "hboxchange",  { id: @aid(), w: avaiWidth, h: avaiheight }
        

class VBoxTag extends TileLayoutTag
    constructor: (r, o) ->
        super r, o, {
            name: "vbox",
            dir: "column",
            opt: "data-height"
        }
    
    calibrate: () ->
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

        @observable.trigger "vboxchange", { id: @aid(), w: avaiwidth, h: avaiheight }

Ant.OS.GUI.define "afx-hbox", HBoxTag
Ant.OS.GUI.define "afx-vbox", VBoxTag