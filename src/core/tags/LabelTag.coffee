class LabelTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "color", undefined
        @setopt "icon", undefined
        @setopt "iconclass", undefined
        @setopt "text", ""

    on_color_changed: (v) ->
        return unless v
        $(@refs.container).css "color", v

    on_icon_changed: (v) ->
        $(@refs.i).attr "style", ""
        if v
            $(@refs.i)
                .css "background", "url(#{Ant.OS.API.handle.get}/#{v})"
                .css "background-size", "100% 100%"
                .css "background-repeat", "no-repeat"
            $(@refs.i).show()
        else
            $(@refs.i).hide()

    on_iconclass_changed: (v) ->
        $(@refs.iclass).removeClass()
        if v
            $(@refs.iclass).addClass v
            $(@refs.iclass).show()
        else
            $(@refs.iclass).hide()



    on_text_changed: (v) ->
        $(@refs.text).text v.__() if v

    layout: () ->
        {
            el: "span", ref: "container", children: [
                { el: "i", ref: "iclass" },
                { el: "i", ref: "i", class: "icon-style" },
                { el: "i", ref: "text" }
            ]
        }


Ant.OS.GUI.define "afx-label", LabelTag