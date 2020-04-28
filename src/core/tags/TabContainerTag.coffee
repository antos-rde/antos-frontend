class TabContainerTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "dir", "column" # or row
        @setopt "selectedTab", undefined
        @setopt "tabbarwidth", undefined
        @setopt "tabbarheight", undefined
        me = @
        @refs.bar.set "ontabselect", (e) ->
            data = e.data.item.get "data"
            me.set "selectedTab", data

    __selectedTab: (v) ->
        return unless v
        selected = @get("selectedTab")
        $(selected.container).hide() if selected
        $(v.container).show()
        @observable.trigger "resize"

    __tabbarwidth__: (v) ->
        return unless v
        $(@refs.bar).attr "data-width", "#{@get("tabbarwidth")}"
        @refs.wrapper.calibrate()

    __tabbarheight__: (v) ->
        $(@refs.bar).attr "data-height", "#{@get("tabbarheight")}"
        @refs.wrapper.calibrate()

    __dir__: (v) ->
        return unless v
        @refs.wrapper.set "dir", v
        @set "tabsize", @get("tabsize")

    mount: () ->
        me = @
        $(@children).each () ->
            item = {}
            item.text = $(@).attr "title" if $(@).attr "title"
            item.icon = $(@).attr "icon" if $(@).attr "icon"
            item.iconclass = $(@).attr "iconclass" if $(@).attr "iconclass"
            item.container = @
            $(@)
                .css "width", "100%"
                .css "height", "100%"
            el = me.refs.bar.push item
            el.set "selected", true
        @observable.on "resize", (e) -> me.calibrate()
        @calibrate()

    calibrate: () ->
        $(@refs.wrapper).css "height", "#{$(@root).height()}px"

    layout: () ->
        [{
            el: "afx-tile", ref: "wrapper", children: [
                { el: "afx-tab-bar", ref: "bar" },
                { el: "div", ref: "yield" }
            ]
        }]

Ant.OS.GUI.define "afx-tab-container", TabContainerTag