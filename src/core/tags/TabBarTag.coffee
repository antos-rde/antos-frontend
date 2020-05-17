class TabBarTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "closable", false
        @setopt "ontabselect", (e) ->
        @setopt "ontabclose", (e) ->
        @setopt "items", []
        @setopt "selected", -1
        @root.push = (e) =>
            e.closable = @get "closable"
            @refs.list.push e
        @root.remove = (e) => @refs.list.remove e
        @root.unshift = (e) => @refs.list.unshift e
        @refs.list.set "onlistselect", (e) =>
                @get("ontabselect") e
                @observable.trigger "tabselect", e

    __items__: (v) ->
        i.closable = @get "closable" for i in v
        @refs.list.set "data", v

    __selected__: (v) ->
        @refs.list.set "selected", v

    mount: () ->
        $(@refs.list).css "height", "100%"
        @refs.list.set "onitemclose", (e) =>
            e.id = @aid()
            @get("ontabclose") e

    layout: () ->
        [{
            el: "afx-list-view", ref: "list"
        }]

Ant.OS.GUI.define "afx-tab-bar", TabBarTag