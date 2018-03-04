class SpotlightDialog extends this.OS.GUI.BaseDialog
    constructor: () ->
        super "SpotlightDialog"

    init: () ->
        #@render "#{@path()}/spotlight.html"
        @_gui.htmlToScheme SpotlightDialog.scheme, @, @host
    main: () ->
        me = @
        @height = ($ @scheme).css("height")
        @container = @find "container"
        ($ @scheme).css("height", "45px")
        @fn = (e) ->
            if e.which is 27
                ($ document).unbind "click", me.fn1
                ($ document).unbind "keyup", me.fn
                me.handler(e) if me.handler
                me.quit()
        ($ document).keyup @fn

        @fn1 = (e) ->
            return if $(e.target).closest(me.parent.holder.root).length
            if not $(e.target).closest(me.scheme).length
                ($ document).unbind "click", me.fn1
                ($ document).unbind "keyup", me.fn
                me.handler(e) if me.handler
                me.quit()
        
        ($ document).click @fn1
        @searchbox = @find "searchbox"
        ($ @searchbox).focus()
        ($ @searchbox).keyup (e) ->
            me.search e
        @container.set "onlistdbclick", (e)->
            return if e.data.dataid and e.data.dataid is "header"
            me.handler(e) if me.handler
            me._gui.openWith e.data
            ($ document).unbind "click", me.fn1
            ($ document).unbind "keyup", me.fn
            me.quit()


    search: (e) ->
        switch e.which
            when 37
                e.preventDefault()
            when 38
                @container.selectPrev()
                e.preventDefault()
            when 39
                e.preventDefault()
            when 40
                @container.selectNext()
                e.preventDefault()
            when 13
                e.preventDefault()
                sel = @container.get "selected"
                return unless sel
                return if sel.dataid and sel.dataid is "header"
                @.handler(e) if @.handler
                @._gui.openWith sel
                ($ document).unbind "click", @fn1
                ($ document).unbind "keyup", @fn
                @.quit()
            else
                text = @searchbox.value
                ($ @scheme).css("height", "45px")
                return unless text.length >= 3
                result = @_api.search text
                return if result.length is 0
                @container.set "items", result
                ($ @scheme).css("height", @height)

SpotlightDialog.scheme = """
<afx-app-window data-id = "spotlight-win" apptitle="" minimizable="false" resizable = "false" width="500" height="300">
    <afx-vbox>
        <afx-hbox data-height="45">
            <div data-id = "searchicon" data-width="45"></div>
            <input type = "text" data-id="searchbox"/>
        </afx-hbox>
        <afx-list-view data-id="container"></afx-list-view>
    </afx-vbox>
</afx-app-window>
"""  
this.OS.register "SpotlightDialog", SpotlightDialog

class Spotlight extends this.OS.GUI.BaseService
    constructor: (args) ->
        super "Spotlight", args
        @iconclass = "fa fa-search"
        @show = false
    init: ->
        me = @
        @_gui.bindKey "CTRL- ", (e) ->
            me.awake(e)
        #@child = [
        #    {
        #        text: "#{@.name} (#{@.pid}): dummy notif",
        #        child: [ { text: "submenu" } ]
        #    }
        #]
        # do nothing
    main: ->
        
    awake: (e) ->
        me = @
        if not @show
            me.show = true
            @openDialog "SpotlightDialog", (d) ->
                me.show = false
                me.dialog = undefined
        else
            me.show = false
            @dialog.quit() if @dialog

    cleanup: (evt) ->
        # do nothing

this.OS.register "Spotlight",Spotlight