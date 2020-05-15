class TabBarTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "closable", false
        @setopt "ontabselect", (e) ->
        @setopt "ontabclose", (e) ->
        @setopt "items", []
        @setopt "selected", -1
        me = @
        @root.push = (e) ->
            e.closable = me.get "closable"
            me.refs.list.push e
        @root.remove = (e) -> me.refs.list.remove e
        @root.unshift = (e) -> me.refs.list.unshift e
        @refs.list.set "onlistselect", (e) ->
                me.get("ontabselect") e
                me.observable.trigger "tabselect", e

    __items__: (v) ->
        i.closable = @get "closable" for i in v
        @refs.list.set "data", v

    __selected__: (v) ->
        @refs.list.set "selected", v

    mount: () ->
        me  = @
        $(@refs.list).css "height", "100%"
        @refs.list.set "onitemclose", (e) ->
            e.id = me.aid()
            me.get("ontabclose") e

    layout: () ->
        [{
            el: "afx-list-view", ref: "list"
        }]

Ant.OS.GUI.define "afx-tab-bar", TabBarTag