class AppDockTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "selectedApp"
        @setopt "onappselect", (e) ->
        @setopt "items", []
        me = @
        @root.newapp = (a) -> me.addApp a

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
        for v  in self.items
            v.app.blur()
    
    removeApp: (a) ->

    mount: () ->
        Ant.OS.announcer.trigger "sysdockloaded"
