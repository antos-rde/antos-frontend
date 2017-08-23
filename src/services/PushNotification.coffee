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
        @mlist = @find "notifylist"
        @mfeed = @find "notifeed"
        @nzone = @find "notifyzone"
        (@find "btclear").set "onbtclick", (e) -> me.mlist.set "items", []
        #mlist.set "onlistselect", (e) -> console.log e
        @subscribe "notification", (o) -> me.pushout 'INFO', o
        @subscribe "fail", (o) -> me.pushout 'FAIL', o
        @subscribe "error", (o) -> me.pushout 'ERROR', o

        ($ @nzone).css "right", 0
            .css "top", "-3px"
            .css "height", ""
            .css "bottom", "0"
            .hide()
        ($ @mfeed).css "right", "5px"
            .css "top", "0"

    pushout: (s, o, mfeed) ->
        d = {
            text: "#{o.name} (#{o.id}) - #{s}: #{o.data.m}",
            icon: o.data.icon,
            iconclass: o.data.iconclass,
            closable: true }
        d1 = {
            header: "#{o.name} (#{o.id})"
            text: "#{s}: #{o.data.m}",
            icon: o.data.icon,
            iconclass: o.data.iconclass,
            closable: true }
        @mlist.push d, true
        @notifeed d1

    notifeed: (d) ->
        me = @
        @mfeed.push d, true
        ($ @mfeed).show()
        timer = setTimeout () ->
                me.mfeed.remove d, true
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