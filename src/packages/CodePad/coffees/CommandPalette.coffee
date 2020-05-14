class CommandPalette extends this.OS.GUI.BasicDialog
    constructor: () ->
        super "CommandPalete", CommandPalette.scheme
        
    init: () ->
        me = @
        offset = $(".afx-window-content", @parent.scheme).offset()
        pw = @parent.scheme.get("width") / 5
        @scheme.set "width", 3 * pw
        $(@scheme).offset { top: offset.top - 2, left: offset.left + pw }
        cb = (e) ->
            if ($ e.target).closest(me.scheme).length > 0
                $(me.find "searchbox").focus()
            else
                $(document).unbind "mousedown", cb
                me.quit()
        $(document).on "mousedown", cb
        $(me.find "searchbox").focus()
        @cmdlist = @find("container")
        @cmdlist.set "data", @data if @data
        $(@cmdlist).click (e) ->
            me.selectCommand()
    
        @searchbox = @find "searchbox"
        ($ @searchbox).keyup (e) ->
            me.search e

    search: (e) ->
        switch e.which
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
                @cmdlist.set "data", @data if text.length is 2
                return if text.length < 3
                result = []
                term = new RegExp text, 'i'
                result.push v for v in @data when v.text.match term
                @cmdlist.set "data", result


    selectCommand: () ->
        el = @cmdlist.get "selectedItem"
        return unless el
        @quit()
        @handle { data: { item: el } } if @handle


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