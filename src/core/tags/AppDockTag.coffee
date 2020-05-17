class AppDockTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "onappselect", (e) ->
        @setopt "items", []
        @setopt "selectedApp", undefined
        @root.newapp = (a) => @addApp a
        @root.removeapp = (a) => @removeApp a

    __selectedApp__: (v) ->
        el = undefined
        for it in @get("items")
            it.app.blur()
            $(it.domel).removeClass()
            el = it.domel if v and v is it.app
        return unless el
        $(el).addClass "selected"
        $(Ant.OS.GUI.workspace)[0].unselect()

    addApp: (item) ->
        @get("items").push item
        el = $("<afx-button>")
        el.appendTo @root
        el[0].uify @observable
        el[0].set "*", item
        el.attr "tooltip", "cr:#{item.app.title()}"
        item.domel = el[0]
        el[0].set "onbtclick", (e) =>
            e.id = @aid()
            e.data.app = item
            item.app.show()
        @set "selectedApp", item.app

    removeApp: (a) ->
        i = -1
        for v, k in @get "items"
            if v.app.pid == a.pid
                i = k
                break

        if i != -1
            items = @get("items")
            delete items[i].app
            items.splice(i, 1)
            $($(@root).children()[i]).remove()

    mount: () ->
        @root.contextmenuHandle = (e, m) =>
            return if e.target is @root
            bt = $(e.target).closest "afx-button"
            app = bt[0].get "app"
            m.set "items", [
                { text: "__(Show)", dataid: "show" },
                { text: "__(Hide)", dataid: "hide" },
                { text: "__(Close)", dataid: "quit" }
            ]
            m.set "onmenuselect", (evt) ->
                item = evt.data.item.get("data")
                if(app[item.dataid])
                    app[item.dataid]()
            m.show(e)
        Ant.OS.announcer.trigger "sysdockloaded"

Ant.OS.GUI.define "afx-apps-dock", AppDockTag