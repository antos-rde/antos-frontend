class LabelTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "color", undefined
        @setopt "icon", undefined
        @setopt "iconclass", undefined
        @setopt "class", undefined
        @refs.text = document.createTextNode ""
        $(@refs.container).append @refs.text
        @setopt "text", ""

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
            $(@refs.iclass).css "margin-right", "5px"
            $(@refs.iclass).show()
        else
            $(@refs.iclass).hide()



    __text__: (v) ->
        @refs.text.nodeValue =  v.__() if v

    layout: () ->
       [{
            el: "span", ref: "container", children: [
                { el: "i", ref: "iclass" },
                { el: "i", ref: "i", class: "icon-style" }
            ]
        }]


Ant.OS.GUI.define "afx-label", LabelTag