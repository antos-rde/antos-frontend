class AppearanceHandler extends SettingHandler
    constructor:(scheme, parent) ->
        super(scheme, parent)
        me = @
        @wplist = @find "wplist"
        @wpreview = @find "wp-preview"
        @wpsize = @find "wpsize"
        @wprepeat = @find "wprepeat"
        @themelist = @find "theme-list"
        @wpsize.set "onlistselect", (e)->
            me.parent.systemsetting.appearance.wp.size = e.data.text
            me.parent._gui.wallpaper()

        sizes = [
            { text: "cover", selected: me.parent.systemsetting.appearance.wp.size is "cover" },
            { text: "auto", selected: me.parent.systemsetting.appearance.wp.size is "auto" },
            { text: "contain", selected: me.parent.systemsetting.appearance.wp.size is "contain" }
        ]
        @wpsize.set "items", sizes
        @wplist.set "onlistselect", (e) ->
            $(me.wpreview).css("background-image", "url(#{me.parent._api.handler.get}/#{e.data.path})" )
            .css("background-size", "cover")
            me.parent.systemsetting.appearance.wp.url = e.data.path
            me.parent._gui.wallpaper()
        

        repeats = [
            { text: "repeat", selected: me.parent.systemsetting.appearance.wp.repeat is "repeat" },
            { text: "repeat-x", selected: me.parent.systemsetting.appearance.wp.repeat is "repeat-x" },
            { text: "repeat-y", selected: me.parent.systemsetting.appearance.wp.repeat is "repeat-y" },
            { text: "no-repeat", selected: me.parent.systemsetting.appearance.wp.repeat is "no-repeat" }
        ]
        @wprepeat.set "items", repeats
        @wprepeat.set "onlistselect", (e) ->
            me.parent.systemsetting.appearance.wp.repeat = e.data.text
            me.parent._gui.wallpaper()

        @themelist.set "items" , [{ text: "antos", selected: true }]
    render: () ->
        me = @
        path = "os://resources/themes/system/wp"
        path.asFileHandler().read (d) ->
            me.parent.error __("Cannot read wallpaper list from {0}", path) if d.error
            for v in d.result
                v.text = v.filename
                v.selected = true if v.path is me.parent.systemsetting.appearance.wp.url
                v.iconclass = "fa fa-file-image-o"
            me.wplist.set "items", d.result