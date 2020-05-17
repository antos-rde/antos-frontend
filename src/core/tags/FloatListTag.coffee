class FloatListTag extends ListViewTag
    constructor: (r, o) ->
        super r, o

        @setopt "dir", "horizontal"
        @root.refresh = () => @calibrate()
        @root.push = (e) => @refs.mlist.push(e)
        @root.unshift = (e) => @refs.mlist.unshift(e)
        @root.remove = (e) => @refs.mlist.remove(e)

    # disable some uneccessary functions
    __dropdown__: (v) -> @set "dropdown", false if v
    __buttons__: (v) ->
    showlist: (e) ->
    dropoff: (e) ->
    __data__: (v) ->
        super.__data__(v)
        @calibrate()
    __dir__: (v) ->
        @calibrate()

    mount: () ->
        $(@refs.container)
            .css "width", "100%"
            .css "height", "100%"
        $(@refs.mlist)
            .css "position", "absolute"
            .css "display", "block"
            .css "width", "100%"
        @observable.on "resize", (e) => @calibrate()
        @root.ready(@root) if @root.ready

    push: (v) ->
        el = super.push(v)
        @enable_drag el
        el

    enable_drag: (el) ->
        $(el)
            .css "user-select", "none"
            .css "cursor", "default"
            .css "display", "block"
            .css "position", "absolute"
            .on "mousedown", (evt) =>
                globalof = $(@refs.mlist).offset()
                evt.preventDefault()
                offset = $(el).offset()
                offset.top = evt.clientY - offset.top
                offset.left = evt.clientX - offset.left
                mouse_move = (e) ->
                    top  = e.clientY - offset.top - globalof.top
                    left = e.clientX - globalof.left - offset.left
                    left = if left < 0 then 0 else left
                    top = if top < 0 then 0 else top
                    $(el)
                        .css "top", "#{top}px"
                        .css "left", "#{left}px"
                
                mouse_up = (e) ->
                    $(window).unbind "mousemove", mouse_move
                    $(window).unbind "mouseup", mouse_up
                $(window).on "mousemove", mouse_move
                $(window).on "mouseup", mouse_up

    calibrate: () ->
        ctop = 20
        cleft = 20
        $(@refs.mlist)
            .css "height", "#{$(@refs.container).height()}px"
        gw = $(@refs.mlist).width()
        gh = $(@refs.mlist).height()

        $(@refs.mlist).children().each (i, e) =>
            $(e)
                .css "top", "#{ctop}px"
                .css "left", "#{cleft}px"
            w = $(e).width()
            h = $(e).height()
            if @get("dir") is "vertical"
                ctop += h + 20
                if ctop > gh
                    ctop = 20
                    cleft += w + 20
            else
                cleft += w + 20
                if cleft > gw
                    cleft = 20
                    ctop += h + 20

Ant.OS.GUI.define "afx-float-list", FloatListTag
