class SystemPanelTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "osmenu", {
            text: __("Start"),
            iconclass: "fa fa-circle"
        }
        @setopt "appmenu", []
        @setopt "systray", []
        @root.attachservice = (s) => @attachservice s
        @root.detachservice = (s) => @detachservice s
        @view = false

    __osmenu__: (v) ->
        @refs.osmenu.set "items", [v]

    __appmenu__: (v) ->
        @refs.appmenu.set "items", v

    __systray__: (v) ->
        @refs.systray.set "items", v

    attachservice: (s) ->
        @refs.systray.unshift s
        s.attach @refs.systray

    open: () ->
        el = @refs.applist.get "selectedItem"
        return unless el
        data = el.get("data")
        return if not data or data.dataid is "header"
        @toggle false
        # launch the app or open the file
        Ant.OS.GUI.openWith data
        @refs.applist.unselect()
    
    search: (e) ->
        switch e.which
            when 37
                e.preventDefault()
            when 38
                @refs.applist.selectPrev()
                e.preventDefault()
            when 39
                e.preventDefault()
            when 40
                @refs.applist.selectNext()
                e.preventDefault()
            when 13
                e.preventDefault()
                @open()
            else
                text = @refs.search.value
                return @refreshAppList() unless text.length >= 3
                result = Ant.OS.API.search text
                return if result.length is 0
                @refs.applist.set "data", result

    detachservice: (s) ->
        @refs.systray.remove s.domel

    layout: () ->
        [
            {
                el: "div", ref: "panel", children: [
                    { el: "afx-menu", ref: "osmenu", class: "afx-panel-os-menu" },
                    { el: "afx-menu", id: "appmenu", ref: "appmenu", class: "afx-panel-os-app" },
                    { el: "afx-menu", id: "systray", ref: "systray", class: "afx-panel-os-stray" }
                ]
            },
            {
                el: "afx-overlay", id: "start-panel", ref: "overlay", children: [
                    {
                        el: "afx-hbox", height: 30, children: [
                            { el: "div", width: 30, id: "searchicon" },
                            { el: "input", ref: "search" }
                        ]
                    },
                    { el: "afx-list-view", id: "applist", ref: "applist" },
                    {
                        el: "afx-hbox", id: "btlist", height: 30, children: [
                            {
                                el: "afx-button",
                                ref: "btscreen",
                                tooltip: __("ct:Toggle fullscreen")
                            },
                            {
                                el: "afx-button",
                                ref: "btuser",
                                tooltip: __("ct:User: {0}", Ant.OS.setting.user.username)
                            },
                            { el: "afx-button", ref: "btlogout", tooltip: __("ct:Logout") }
                        ]
                    }
                ]
            }
        ]
    
    refreshAppList: () ->
        list = []
        list.push v for k, v of Ant.OS.setting.system.packages when (v and v.app)
        list.push v for k, v of Ant.OS.setting.system.menu
        @refs.applist.set "data", list

    toggle: (flag) ->
        if flag
            @refreshAppList()
            $(@refs.overlay).show()
            @calibrate()
            $(document).on "click", @cb
            @refs.search.value = ""
            $(@refs.search).focus()
        else
            $(@refs.overlay).hide()
            $(document).unbind "click", @cb

    calibrate: () ->
        @refs.overlay.set "height", "#{$(window).height() - $(@refs.panel).height()}px"

    mount: () ->
        @cb = (e) =>
            if not ($ e.target).closest($ @refs.overlay).length and not ($ e.target).closest(@refs.osmenu).length
                @toggle false
            else
                $(@refs.search).focus()
        $(@refs.appmenu).css("z-index", 1000000)
        $(@refs.systray).css("z-index", 1000000)
        @refs.btscreen.set "*", {
            iconclass: "fa fa-tv",
            onbtclick: (e) =>
                @toggle false
                Ant.OS.GUI.toggleFullscreen()
        }
        @refs.btuser.set "*", {
            iconclass: "fa fa-user-circle-o",
            onbtclick: (e) =>
                @toggle false
                Ant.OS.GUI.openDialog("InfoDialog", Ant.OS.setting.user)
        }
        @refs.btlogout.set "*", {
            iconclass: "fa fa-power-off",
            onbtclick: (e) =>
                @toggle false
                Ant.OS.exit()
        }
        @refs.osmenu.set "onmenuselect", (e) =>
            @toggle true
        
        ($ @refs.overlay).css "left", 0
            .css "top", "#{$(@refs.panel).height()}px"
            .css "bottom", "0"
            .hide()
        ($ @refs.search).keyup (e) =>
            @search e

        $(@refs.applist).click (e) =>
            @open()
        Ant.OS.GUI.bindKey "CTRL- ", (e) =>
            if @view is false
                @toggle true
            else
                @toggle false
            @view = not @view
        Ant.OS.announcer.trigger("syspanelloaded")

Ant.OS.GUI.define "afx-sys-panel", SystemPanelTag