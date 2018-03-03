class SpotlightDialog extends this.OS.GUI.BaseDialog
    constructor: () ->
        super "SpotlightDialog"

    init: () ->
        @render "#{@path()}/spotlight.html"

    main: () ->
        me = @
        @height = ($ @scheme).css("height")
        @container = @find "container"
        ($ @scheme).css("height", "45px")
        #fn = (e) ->
         #   if e.keyCode is 27
        #        ($ document).unbind "keyup", fn
        #        me.handler(e) if me.handler
        #($ document).keyup fn

        fn1 = (e) ->
            if not $(e.target).closest(me.scheme).length
                ($ document).unbind "click", fn1
                me.handler(e) if me.handler
        
        ($ document).click fn1
        @searchbox = @find "searchbox"
        ($ @searchbox).focus()
        ($ @searchbox).keyup (e) ->
            me.search e
        @container.set "onlistdbclick", (e)->
            return if e.data.dataid and e.data.dataid is "header"
            me.handler(e) if me.handler
            me._gui.openWith e.data
    


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
            else
                text = @searchbox.value
                ($ @scheme).css("height", "45px")
                return unless text.length > 3
                result = @_api.search text
                return if result.length is 0
                @container.set "items", result
                ($ @scheme).css("height", @height)

            
this.OS.register "SpotlightDialog", SpotlightDialog

class Spotlight extends this.OS.GUI.BaseService
    constructor: (args) ->
        super "Spotlight", args
        @iconclass = "fa fa-search"
        @show = false
    init: ->
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
        @show = not @show
        if @show
            @openDialog "SpotlightDialog", (d) ->
                me.show = false
                me.dialog.quit() if me.dialog
                me.dialog = undefined
        else
            @dialog.quit() if @dialog

    cleanup: (evt) ->
        # do nothing

this.OS.register "Spotlight",Spotlight