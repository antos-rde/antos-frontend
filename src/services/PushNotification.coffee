class PushNotification extends this.OS.GUI.BaseService
    constructor: (args) ->
        super "PushNotification", args
        @iconclass = "fa fa-bars"
        @onmenuselect = (e) -> console.log e
        @cb = undefined
        @pending = []
    init: ->
        @view = false
        path = "resources/schemes/notifications.html"
        @render path

    spin: (b) ->
        if b and @iconclass is "fa fa-bars"
            @iconclass = "fa fa-spinner fa-spin"
            @color = "#f90e00"
            @update()
        else if not b and @iconclass is "fa fa-spinner fa-spin"
            @iconclass = "fa fa-bars"
            @color = "#414339"
            @update()

    main: ->
        me = @
        @mlist = @find "notifylist"
        @mfeed = @find "notifeed"
        @nzone = @find "notifyzone"
        @fzone = @find "feedzone"
        (@find "btclear").set "onbtclick", (e) -> me.mlist.set "items", []
        #mlist.set "onlistselect", (e) -> console.log e
        @subscribe "notification", (o) -> me.pushout 'INFO', o
        @subscribe "fail", (o) -> me.pushout 'FAIL', o
        @subscribe "error", (o) -> me.pushout 'ERROR', o
        
        @subscribe "loading", (o) ->
            me.pending.push o.id
            me.spin true

        @subscribe "loaded", (o) ->
            i = me.pending.indexOf o.id
            me.pending.splice i, 1 if i >= 0
            me.spin false if me.pending.length is 0
            
        ($ @nzone).css "right", 0
            .css "top", "-3px"
            .css "height", ""
            .css "bottom", "0"
            .css "z-index", 1000000
            .hide()
        ($ @fzone)
            #.css("z-index", 99999)
            .css("bottom", "0")
            .css("height", "")
            .hide()

    pushout: (s, o, mfeed) ->
        d = {
            text: "[#{s}] #{o.name} (#{o.id}): #{o.data.m}",
            icon: o.data.icon,
            iconclass: o.data.iconclass,
            closable: true }
        @mlist.unshift d, true
        @notifeed d

    notifeed: (d) ->
        me = @
        @mfeed.unshift d, true
        ($ @fzone).show()
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
                return if e.originalEvent.item and e.originalEvent.item.i isnt undefined
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