class SettingHandler
    constructor:(@scheme, @parent) ->

    find: (id) -> ($ "[data-id='#{id}']", @scheme)[0] if @scheme

    render: () ->



class Setting extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "Setting", args
    
    main: () ->
        me = @
        @container = @find "container"
        @container.setTabs [ 
            {
                text: "__(Appearance)",
                iconclass: "fa fa-paint-brush",
                url: "#{@path()}/schemes/appearance.html",
                handler: (sch) ->
                    new AppearanceHandler sch, me
            },
            {
                text: "__(VFS)",
                iconclass: "fa fa-inbox" ,
                url: "#{@path()}/schemes/vfs.html" ,
                handler: (sch) ->
                    new VFSHandler sch, me
            },
            {
                text: "__(Languages)",
                iconclass: "fa fa-globe",
                url: "#{@path()}/schemes/locale.html",
                handler: (sch) ->
                    new LocaleHandler sch, me
            },
            {
                text: "__(Startup)",
                iconclass: "fa fa-cog",
                url: "#{@path()}/schemes/startup.html",
                handler: (sch) ->
                    new StartupHandler sch,me
            }
        ]
        (@find "btnsave").set "onbtclick", (e) ->
            me._api.setting  (d) ->
                return me.error __("Cannot save system setting: {0}", d.error) if d.error
                me.notify __("System setting saved")
Setting.singleton = true
this.OS.register "Setting", Setting