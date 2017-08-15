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
        @scheme = @find "notifyzone"
        mlist = @find "notifylist"
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

        ($ @scheme).css "right", 0
            .css "top", "-3px"
            .css "height", ""
            .css "bottom", "0"
            .hide()
        ($ mfeed).css "right", "5px"
            .css "top", "0"

    notifeed: (d, mfeed) ->
        mfeed.set "*", d
        ($ mfeed).show()
        timer = setTimeout () ->
             ($ mfeed).hide()
             clearTimeout timer
        , 3000

    awake: (e) ->
        if  @view then ($ @scheme).hide() else ($ @scheme).show()
        @view = not @view
        me = @
        if not @cb
            @cb = (e) ->
                return if e.originalEvent.item and e.originalEvent.item.closable
                if not ($ e.target).closest($ me.scheme).length and not ($ e.target).closest($ me.holder.root).length
                    ($ me.scheme).hide()
                    $(document).unbind "click", me.cb
                    me.view = not me.view
        if @view
            $(document).on "click", @cb
        else
            $(document).unbind "click", @cb
        
    cleanup: (evt) ->
        # do nothing

this.OS.register "PushNotification",PushNotification