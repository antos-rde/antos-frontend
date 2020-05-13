class WindowTag extends  Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "minimizable", true
        @setopt "resizable", true
        @setopt "apptitle", "Untitled"
        @setopt "desktop", Ant.OS.GUI.workspace
        @setopt "width", 400
        @setopt "height", 300
        @shown = false
        @isMaxi = false
        @history = {}
        @desktop = $(@get "desktop")
        @desktop_pos = @desktop.offset()

    resize: () ->
        ch = $(@refs["yield"]).height() / $(@refs["yield"]).children().length
        $(@refs["yield"]).children().each (e) ->
            $(this).css "height", "#{ch}px"

    mount: () ->
        me = @
        @root.contextmenuHandle = (e) ->
        $(@refs["minbt"]).click (e) ->
            me.observable.trigger "hide", { id: me.aid() }
        
        $(@refs["maxbt"]).click (e) ->
            me.toggle_window()

        $(@refs["closebt"]).click (e) ->
            me.observable.trigger("exit", { id: me.aid() })
        left = ($(@desktop).width()  - (@get "width")) / 2
        top = ($(@desktop).height() - (@get "height")) / 2
        $(@root)
            .css("position", 'absolute')
            .css("left", "#{left}px")
            .css("top", "#{top}px")
            .css("z-index", Ant.OS.GUI.zindex++)
        $(@root).on "mousedown", (e) ->
            return if me.shown
            me.observable.trigger "focus", { id: me.aid() }

        $(@refs["dragger"]).dblclick (e) ->
            me.toggle_window()

       
        @observable.on "resize", (e) -> me.resize()

        @observable.on "focus", () ->
            Ant.OS.GUI.zindex++
            $(me.root)
                .show()
                .css("z-index", Ant.OS.GUI.zindex)
                .removeClass("unactive")
            me.shown = true

        @observable.on "blur", () ->
            me.shown = false
            $(me.root)
                .addClass("unactive")
        @observable.on "hide", () ->
            $(me.root).hide()
            me.shown = false

        @observable.on "toggle", () ->
            if me.shown
                me.observable.trigger "hide", { id: me.aid() }
            else
                me.observable.trigger "focus", { id: me.aid() }
        @enable_dragging()
        @enable_resize()
        @setsize { w: (@get "width"), h: (@get "height") }
        @observable.trigger "rendered", { id: me.aid() }

    __minimizable__: (value) ->
        if value then $(@refs["minbt"]).show() else $(@refs["minbt"]).hide()
    
    __width__: (v) ->
        return unless v
        @setsize { w: v, h: @get("height") }
 
    __height__: (v) ->
        return unless v
        @setsize { w: @get("width"), h: v }

    setsize: (o) ->
        return unless o
        @opts.width = o.w
        @opts.height = o.h
        $(@root)
            .css("width", "#{o.w}px")
            .css("height", "#{o.h}px")
        @observable.trigger "resize", { id: @aid(), data: o }

    __resizable__: (value) ->
        if value
            $(@refs["maxbt"]).show()
            $(@refs["grip"]).show()
        else
            $(@refs["maxbt"]).hide()
            $(@refs["grip"]).hide()

    __apptitle__: (value) ->
        $(@refs["dragger"]).text value.__() if value

    enable_dragging: () ->
        me = @
        $(@refs["dragger"])
                .css("user-select", "none")
                .css("cursor", "default")
        $(@refs["dragger"]).on "mousedown", (e) ->
            e.preventDefault()
            offset = $(me.root).offset()
            offset.top = e.clientY - offset.top
            offset.left = e.clientX - offset.left
            $(window).on "mousemove", (e) ->
                if me.isMaxi
                    me.toggle_window()
                    top = 0
                    letf = e.clientX - $(me.root).width() / 2
                    offset.top = 10
                    offset.left = $(me.root).width() / 2
                else
                    top  = e.clientY - offset.top - me.desktop_pos.top
                    left = e.clientX - me.desktop_pos.top - offset.left
                    left = if left < 0 then 0 else left
                    top = if top < 0 then 0 else top
                
                $(me.root)
                    .css("top",  "#{top}px")
                    .css("left", "#{left}px")
            $(window).on "mouseup", (e) ->
                $(window).unbind "mousemove", null
                $(window).unbind "mouseup", null

    enable_resize: () ->
        me = @
        $(@refs["grip"])
            .css("user-select", "none")
            .css("cursor", "default")
            .css("position", "absolute")
            .css("bottom", "0")
            .css("right", "0")
            .css("cursor", "nwse-resize")
        
        $(@refs["grip"]).on "mousedown", (e) ->
            e.preventDefault()
            offset = { top: 0, left: 0 }
            offset.top = e.clientY
            offset.left = e.clientX
            $(window).on "mousemove", (e) ->
                w  = $(me.root).width() + e.clientX - offset.left
                h  = $(me.root).height() + e.clientY - offset.top
                w  = if w < 100 then 100 else w
                h  = if h < 100 then 100 else h
                offset.top = e.clientY
                offset.left = e.clientX
                me.isMaxi = false
                me.setsize { w: w, h: h }

            $(window).on "mouseup", (e) ->
                $(window).unbind "mousemove", null
                $(window).unbind "mouseup", null

    toggle_window: () ->
        return unless @get "resizable"
        me = @
        if @isMaxi is false
            @history = {
                top: $(@root).css("top"),
                left: $(@root).css("left"),
                width: $(@root).css("width"),
                height: $(@root).css("height")
            }
            w = $(@desktop).width() - 5
            h = $(@desktop).height() - 10
            $(@root)
                .css("top", "0")
                .css("left", "0")
            @setsize { w: w, h: h }
            @isMaxi = true
        else
            @isMaxi = false
            $(@root)
                .css("top", @history.top)
                .css("left", @history.left)
            @setsize { w: parseInt(@history.width), h: parseInt(@history.height) }

    layout: () ->
        [{
            el: "div", class: "afx-window-wrapper", children: [
                {
                    el: "ul", class: "afx-window-top", children: [
                        { el: "li", class: "afx-window-close", ref: "closebt" },
                        { el: "li", class: "afx-window-minimize", ref: "minbt" },
                        { el: "li", class: "afx-window-maximize", ref: "maxbt" },
                        { el: "li", class: "afx-window-title", ref: "dragger" }
                    ]
                },
                { el: "div", class: "afx-clear" },
                { el: "div", ref: "yield", class: "afx-window-content" },
                { el: "div", ref: "grip", class: "afx-window-grip" }
            ]
        }]

Ant.OS.GUI.define "afx-app-window", WindowTag