
Ant.OS.GUI.tag.define "afx-window", (tag) ->
    childen = $(tag).childen()
    @(tag).empty()
    $(tag).append(
        $("<div>")
            .addClass("afx-window-wrapper")
            .append())