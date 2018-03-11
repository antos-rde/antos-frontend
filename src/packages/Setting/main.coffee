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
                text: "Appearance",
                iconclass: "fa fa-paint-brush",
                url: "#{@path()}/schemes/appearance.html",
                handler: (sch) ->
                    me.appearance = new AppearanceHandler(sch, me)
                    me.appearance
            },
            {
                text: "VFS",
                iconclass: "fa fa-inbox" ,
                url: "#{@path()}/schemes/vfs.html" ,
                handler: (sch) ->
                    render: () ->
                        console.log "finish init VFS"
                    
            }
        ]
Setting.singleton = true
this.OS.register "Setting", Setting