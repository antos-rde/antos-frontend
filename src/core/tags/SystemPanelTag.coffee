class SystemPanelTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        me = @
        @setopt "osmenu", { children: [] }
        @setopt "appmenu", []
        @setopt "systray", []
        @root.attachservice = (s) -> me.attachservice s
        @root.detachservice = (s) -> me.detachservice s

    __osmenu__: (v) ->
        @refs.osmenu.set "items", [v]

    __appmenu__: (v) ->
        @refs.appmenu.set "items", v

    __systray__: (v) ->
        @refs.systray.set "items", [v]

    attachservice: (s) ->
        @refs.systray.unshift s
        s.attach @refs.systray

    detachservice: (s) ->
        @refs.systray.remove s

    layout: () ->
        [{
            el: "div", children: [
                { el: "afx-menu", id: "osmenu", ref: "osmenu", class: "afx-panel-os-menu" },
                { el: "afx-menu", id: "appmenu", ref: "appmenu", class: "afx-panel-os-app" },
                { el: "afx-menu", id: "systray", ref: "systray", class: "afx-panel-os-stray" }
            ]
        }]
    
    mount: () ->
        $(@refs.osmenu).css("z-index", 1000000)
        $(@refs.appmenu).css("z-index", 1000000)
        $(@refs.systray).css("z-index", 1000000)
        Ant.OS.announcer.trigger("syspanelloaded")

Ant.OS.GUI.define "afx-sys-panel", SystemPanelTag