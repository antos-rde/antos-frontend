class PushNotification extends this.OS.GUI.BaseService
    constructor: () ->
        super "PushNotification"
        @iconclass = "fa fa-commenting"
        @onmenuselect = (e) -> console.log e
        @cb = undefined
        
    init: ->
        @view = false
        path = "resources/schemes/notifications.html"
        @render path

    main: ->
        me = @
        mfeed = @find "notifeed"
        @nzone = @find "notifyzone"
        mlist = @find "notifylist"
        (@find "btclear").set "onbtclick", (e) -> mlist.set "items", []
        #mlist.set "onlistselect", (e) -> console.log e
        @subscribe "notification", (o) ->
            d = {
                header: "#{o.name} (#{o.id})"
                text: "INFO: #{o.name} (#{o.id}): #{o.data.m}",
                lite: o.data.m
                icon: o.data.icon,
                iconclass: o.data.iconclass,
                closable: true }
            mlist.push d, true
            me.notifeed d, mfeed
        
        @subscribe "fail", (o) ->
            d = {
                header: "#{o.name} (#{o.id})"
                text: "FAIL: #{o.name} (#{o.id}): #{o.data.m}",
                lite: o.data.m
                icon: o.data.icon,
                iconclass: o.data.iconclass,
                closable: true }
            mlist.push d, true
            me.notifeed d, mfeed

        ($ @nzone).css "right", 0
            .css "top", "-3px"
            .css "height", ""
            .css "bottom", "0"
            .hide()
        ($ mfeed).css "right", "5px"
            .css "top", "0"

    notifeed: (d, mfeed) ->
        mfeed.push d, true
        ($ mfeed).show()
        timer = setTimeout () ->
                mfeed.remove d, true
                clearTimeout timer
        , 3000

    awake: (e) ->
        if  @view then ($ @nzone).hide() else ($ @nzone).show()
        @view = not @view
        me = @
        if not @cb
            @cb = (e) ->
                return if e.originalEvent.item and e.originalEvent.item.closable
                if not ($ e.target).closest($ me.nzone).length and not ($ e.target).closest($ me.holder.root).length
                    ($ me.nzone).hide()
                    $(document).unbind "click", me.cb
                    me.view = not me.view
        if @view
            $(document).on "click", @cb
        else
            $(document).unbind "click", @cb
        
    cleanup: (evt) ->
        # do nothing

this.OS.register "PushNotification",PushNotification