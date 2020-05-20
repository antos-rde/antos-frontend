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
        @root.contextmenuHandle = (e) ->
        $(@refs["minbt"]).click (e) =>
            @observable.trigger "hide", { id: @aid() }
        
        $(@refs["maxbt"]).click (e) =>
            @toggle_window()

        $(@refs["closebt"]).click (e) =>
            @observable.trigger("exit", { id: @aid() })
        left = ($(@desktop).width()  - (@get "width")) / 2
        top = ($(@desktop).height() - (@get "height")) / 2
        $(@root)
            .css("position", 'absolute')
            .css("left", "#{left}px")
            .css("top", "#{top}px")
            .css("z-index", Ant.OS.GUI.zindex++)
        $(@root).on "mousedown", (e) =>
            return if @shown
            @observable.trigger "focus", { id: @aid() }

        $(@refs["dragger"]).dblclick (e) =>
            @toggle_window()

       
        @observable.on "resize", (e) => @resize()

        @observable.on "focus", () =>
            Ant.OS.GUI.zindex++
            $(@root)
                .show()
                .css("z-index", Ant.OS.GUI.zindex)
                .removeClass("unactive")
            @shown = true

        @observable.on "blur", () =>
            @shown = false
            $(@root)
                .addClass("unactive")
        @observable.on "hide", () =>
            $(@root).hide()
            @shown = false

        @observable.on "toggle", () =>
            if @shown
                @observable.trigger "hide", { id: @aid() }
            else
                @observable.trigger "focus", { id: @aid() }
        @enable_dragging()
        @enable_resize()
        @setsize { w: (@get "width"), h: (@get "height") }
        @observable.trigger "rendered", { id: @aid() }

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
        @refs["txtTitle"].set "text", value if value

    enable_dragging: () ->
        $(@refs["dragger"])
                .css("user-select", "none")
                .css("cursor", "default")
        $(@refs["dragger"]).on "mousedown", (e) =>
            e.preventDefault()
            offset = $(@root).offset()
            offset.top = e.clientY - offset.top
            offset.left = e.clientX - offset.left
            $(window).on "mousemove", (e) =>
                if @isMaxi
                    @toggle_window()
                    top = 0
                    letf = e.clientX - $(@root).width() / 2
                    offset.top = 10
                    offset.left = $(@root).width() / 2
                else
                    top  = e.clientY - offset.top - @desktop_pos.top
                    left = e.clientX - @desktop_pos.top - offset.left
                    left = if left < 0 then 0 else left
                    top = if top < 0 then 0 else top
                
                $(@root)
                    .css("top",  "#{top}px")
                    .css("left", "#{left}px")
            $(window).on "mouseup", (e) ->
                $(window).unbind "mousemove", null
                $(window).unbind "mouseup", null

    enable_resize: () ->
        $(@refs["grip"])
            .css("user-select", "none")
            .css("cursor", "default")
            .css("position", "absolute")
            .css("bottom", "0")
            .css("right", "0")
            .css("cursor", "nwse-resize")
        
        $(@refs["grip"]).on "mousedown", (e) =>
            e.preventDefault()
            offset = { top: 0, left: 0 }
            offset.top = e.clientY
            offset.left = e.clientX
            $(window).on "mousemove", (e) =>
                w  = $(@root).width() + e.clientX - offset.left
                h  = $(@root).height() + e.clientY - offset.top
                w  = if w < 100 then 100 else w
                h  = if h < 100 then 100 else h
                offset.top = e.clientY
                offset.left = e.clientX
                @isMaxi = false
                @setsize { w: w, h: h }

            $(window).on "mouseup", (e) ->
                $(window).unbind "mousemove", null
                $(window).unbind "mouseup", null

    toggle_window: () ->
        return unless @get "resizable"
        if @isMaxi is false
            @history = {
                top: $(@root).css("top"),
                left: $(@root).css("left"),
                width: $(@root).css("width"),
                height: $(@root).css("height")
            }
            w = $(@desktop).width()
            h = $(@desktop).height()
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
                        { el: "li", class: "afx-window-title", ref: "dragger", children: [{
                            el: "afx-label", ref: "txtTitle"
                        }] }
                    ]
                },
                { el: "div", class: "afx-clear" },
                { el: "div", ref: "yield", class: "afx-window-content" },
                { el: "div", ref: "grip", class: "afx-window-grip" }
            ]
        }]

Ant.OS.GUI.define "afx-app-window", WindowTag