class CommandPalette extends this.OS.GUI.BasicDialog
    constructor: () ->
        super "CommandPalete", CommandPalette.scheme
        
    init: () ->
        me = @
        offset = $(".afx-window-content", @parent.scheme).offset()
        pw = @parent.scheme.get("width") / 5
        @scheme.set "width", 3 * pw
        $(@scheme).offset { top: offset.top, left: offset.left + pw }
        cb = (e) ->
            if ($ e.target).closest(me.scheme).length > 0
                $(me.find "searchbox").focus()
            else
                $(document).unbind "mousedown", cb
                me.quit()

        $(document).on "mousedown", cb
        $(me.find "searchbox").focus()

CommandPalette.scheme = """
<afx-app-window data-id = "cmd-win"
    apptitle="" minimizable="false"
    resizable = "false" width="200" height="200">
    <afx-vbox>
        <input data-height="25" type = "text" data-id="searchbox"/>
        <afx-list-view data-id="container"></afx-list-view>
    </afx-vbox>
</afx-app-window>
"""