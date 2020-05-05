class AppDockTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "selectedApp"
        @setopt "onappselect", (e) ->
        @setopt "items", []
        me = @
        @root.newapp = (a) -> me.addApp a

    __selectedApp__: (v) ->
        

    addApp: (item) ->
        @items.push item
        @set "selectedApp", item.app
        el = $("<afx-button>")
        el.appendTo @root
        el[0].uify @observable
        el[0].set "*", item
        el.attr "tooltip", "cr:#{item.app.title()}"
        me = @
        el[0].set "onbtclick", (e) ->
            e.id = me.aid()
            e.data.app = item
            me.get("onappselect") e
        for v  in @items
            v.app.blur()
    
    removeApp: (a) ->
        i = -1
        for v, k in self.items
            if v.app.pid == a.pid
                i = k
                break

        if i != -1
            delete @items[i].app
            @items.splice(i, 1)
            $($(@root).children()[i]).remove()

    mount: () ->
        Ant.OS.announcer.trigger "sysdockloaded"
        me = @
        @root.contextmenuHandle = (e, m) ->
            return if e.target is me.root
            bt = $(e.target).closest "afx-button"
            appidx = $(@root).children().indexOf bt
            app = self.items[appidx].app
            m.set "items", [
                { text: "__(Show)", dataid: "show" },
                { text: "__(Hide)", dataid: "hide" },
                { text: "__(Close)", dataid: "quit" }
            ]
            m.set "onmenuselect", (evt) ->
                console.log evt
                ### if(app[evt.item.data.dataid])
                    app[evt.item.data.dataid]() ###
            m.show(e)

Ant.OS.GUI.define "afx-apps-dock", AppDockTag