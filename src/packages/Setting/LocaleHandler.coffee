class LocaleHandler extends SettingHandler
    constructor:(scheme, parent) ->
        super(scheme, parent)
        me = @
        @lglist = @find "lglist"
        @localelist = undefined
        @lglist.set "onlistselect", (e) ->
            me.parent._api.setLocale e.data.text
    render: () ->
        me = @
        if not @localelist
            path = "os://resources/languages"
            path.asFileHandler().read (d) ->
                return me.parent.error __("Cannot fetch system locales: {0}", d.error) if d.derror
                for v in d.result
                    v.text = v.filename.replace /\.json$/g, ""
                    v.selected = v.text is me.parent.systemsetting.system.locale
                me.localelist = d.result
                me.lglist.set "items", me.localelist
        else
            me.lglist.set "items", me.localelist
