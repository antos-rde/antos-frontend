class SpotlightDialog extends this.OS.GUI.BaseDialog
    constructor: () ->
        super "SpotlightDialog"

    init: () ->
        @render "#{@path()}/spotlight.html"

    main: () ->
        me = @
        @height = ($ @scheme).css("height")
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
    
    search: (e) ->
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
        else
            @dialog.quit() if @dialog

    cleanup: (evt) ->
        # do nothing

this.OS.register "Spotlight",Spotlight