class CommandPalette extends this.OS.GUI.BasicDialog
    constructor: () ->
        super "CommandPalete", CommandPalette.scheme
        
    init: () ->
        offset = $(".afx-window-content", @parent.scheme).offset()
        pw = @parent.scheme.get("width") / 5
        @scheme.set "width", 3 * pw
        $(@scheme).offset { top: offset.top - 2, left: offset.left + pw }
        cb = (e) =>
            if ($ e.target).closest(@scheme).length > 0
                $(@find "searchbox").focus()
            else
                $(document).unbind "mousedown", cb
                @quit()
        $(document).on "mousedown", cb
        $(@find "searchbox").focus()
        @cmdlist = @find("container")
        @cmdlist.set "data", (v for v in @data.child) if @data
        $(@cmdlist).click (e) =>
            @selectCommand()
    
        @searchbox = @find "searchbox"
        ($ @searchbox).keyup (e) =>
            @search e

    search: (e) ->
        switch e.which
            when 27
                # escape key
                @quit()
                @data.parent.run(@parent) if @data.parent and @data.parent.run
            when 37
                e.preventDefault()
            when 38
                @cmdlist.selectPrev()
                e.preventDefault()
            when 39
                e.preventDefault()
            when 40
                @cmdlist.selectNext()
                e.preventDefault()
            when 13
                e.preventDefault()
                @selectCommand()
            else
                text = @searchbox.value
                @cmdlist.set "data", (v for v in @data.child) if text.length is 2
                return if text.length < 3
                result = []
                term = new RegExp text, 'i'
                result.push v for v in @data.child when v.text.match term
                @cmdlist.set "data", result


    selectCommand: () ->
        el = @cmdlist.get "selectedItem"
        return unless el
        result = false
        result = @handle { data: { item: el } } if @handle
        return @quit() unless result

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