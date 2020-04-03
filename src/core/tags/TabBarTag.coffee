class TabBarTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "closable", false
        @setopt "ontabselect", (e) ->
        @setopt "items", []
    
    __items__: (v) ->
        @refs.list.set "data", v

    mount: () ->
        me  = @
        @refs.list.set "onlistselect", (e) ->
            me.get("ontabselect") e
            me.observable.trigger "tabselect", e
        @root.push = (e) -> me.refs.list.push e
        @root.unshift = (e) -> me.refs.list.unshift e
        @root.remove = (e) -> me.refs.list.remove e
        $(@refs.list).css "height", "100%"

    layout: () ->
        [{
            el: "afx-list-view", ref: "list"
        }]

Ant.OS.GUI.define "afx-tab-bar", TabBarTag