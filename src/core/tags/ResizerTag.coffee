class ResizerTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @dir = "hz"
        @resizable_el = undefined
        @parent = $(@root).parent().parent()
        @minsize = 0

    mount: () ->
        $(@root).css " display", "block"
        tagname = $(@parent).prop("tagName")
        @resizable_el = if $(@root).prev().length is 1 then  $(@root).prev()[0] else undefined
        if tagname is "AFX-HBOX"
            @dir = "hz"
            $(@root).css "cursor", "col-resize"
            $(@root).addClass "horizontal"
            if @resizable_el
                att = $(@resizable_el).attr "min-width"
                @minsize = parseInt(att) if att
        else if tagname is "AFX-VBOX"
            @dir = "ve"
            $(@root).css "cursor", "row-resize"
            $(@root).addClass "vertical"
            if @resizable_el
                att = $(@resizable_el).attr "min-height"
                @minsize = parseInt(att) if att
        else
            @dir = "none"
        @minsize = 10 if @minsize is 0
        @draggable()

    draggable: () ->
        $(@root).css "user-select", "none"
        $(@root).on "mousedown", (e) =>
                e.preventDefault()
                $(window).on "mousemove", (evt) =>
                    return unless @resizable_el
                    if @dir is "hz"
                        @horizontalResize evt
                    else if @dir is "ve"
                        @verticalResize evt

                $(window).on "mouseup", (evt) ->
                    $(window).unbind "mousemove", null
                    $(window).unbind "mouseup", null

                    $(window).unbind "mouseup", null

    horizontalResize: (e) ->
        return unless @resizable_el
        offset = $(@resizable_el).offset()
        w = Math.round(e.clientX - offset.left)
        w = @minsize if w < @minsize
        $(@resizable_el).attr "data-width", w.toString()
        @observable.trigger "resize", { id: @aid(), data: { w: w } }


    verticalResize: (e) ->
        return unless @resizable_el
        offset = $(@resizable_el).offset()
        h = Math.round(e.clientY - offset.top)
        h = @minsize if h < @minsize
        $(@resizable_el).attr "data-height", h.toString()
        @observable.trigger "resize", { id: @aid(), data: { w: w } }

    layout: () ->
        []

Ant.OS.GUI.define "afx-resizer", ResizerTag