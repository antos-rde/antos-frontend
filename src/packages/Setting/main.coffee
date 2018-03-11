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
                f: () ->
                    console.log "finish init appearance"
            },
            {
                text: "VFS",
                iconclass: "fa fa-inbox" ,
                url: "#{@path()}/schemes/vfs.html" ,
                f: () ->
                    console.log "finish init VFS"
            }
        ]
Setting.singleton = true
this.OS.register "Setting", Setting