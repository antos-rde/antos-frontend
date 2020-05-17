class TabContainerTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "dir", "column" # or row
        @setopt "selectedTab", undefined
        @setopt "tabbarwidth", undefined
        @setopt "tabbarheight", undefined
        @setopt "ontabselect", () ->
        @refs.bar.set "ontabselect", (e) =>
            data = e.data.item.get "data"
            @set "selectedTab", data
            @get("ontabselect") { data: data, id: @aid() }

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
        $(@children).each (i, e) =>
            item = {}
            item.text = $(e).attr "tabname" if $(e).attr "tabname"
            item.icon = $(e).attr "icon" if $(e).attr "icon"
            item.iconclass = $(e).attr "iconclass" if $(e).attr "iconclass"
            item.container = e
            $(e)
                .css "width", "100%"
                .css "height", "100%"
            el = @refs.bar.push item
            el.set "selected", true
        @observable.on "resize", (e) => @calibrate()
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