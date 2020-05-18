class LabelTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "color", undefined
        @setopt "icon", undefined
        @setopt "iconclass", undefined
        @setopt "class", undefined
        @setopt "text", undefined

    mount: () ->

    update: () ->
        @set "text", @get("text")

    __class__: (v) ->
        $(@root).removeClass()
        $(@root).addClass v if v

    __color__: (v) ->
        return unless v
        $(@refs.container).css "color", v

    __icon__: (v) ->
        $(@refs.i).attr "style", ""
        if v
            $(@refs.i)
                .css "background", "url(#{Ant.OS.API.handle.get}/#{v})"
                .css "background-size", "100% 100%"
                .css "background-repeat", "no-repeat"
            $(@refs.i).show()
        else
            $(@refs.i).hide()

    __iconclass__: (v) ->
        $(@refs.iclass).removeClass()
        if v
            $(@refs.iclass).addClass v
            $(@refs.iclass).show()
        else
            $(@refs.iclass).hide()



    __text__: (v) ->
        if v and v isnt ""
            $(@refs.text).show()
            $(@refs.text).html v.__()
        else
            $(@refs.text).hide()

    layout: () ->
       [{
            el: "span", ref: "container", children: [
                { el: "i", ref: "iclass" },
                { el: "i", ref: "i", class: "icon-style" },
                { el: "i", ref: "text", class: "label-text" }
            ]
        }]


Ant.OS.GUI.define "afx-label", LabelTag