class MarketPlace extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "MarketPlace", args
    
    main: () ->
        me = @
        # test repository
        @systemsetting.system.repositories.push {
            text: "Antos repository"
            url: "http://127.0.0.1:9191/repo/packages.json"
            name: "Antos repository"
            selected:true
        } if @systemsetting.system.repositories.length is 0
        @repo = @find "repo"
        @repo.set "onlistselect", (e) ->
            return unless e.data
            me.fetchApps e.data.url
        @repo.set "items", @systemsetting.system.repositories
        
        @applist = @find "applist"
        @applist.set "onlistselect", (e) ->
            return unless e.data
            me.appDetail e.data
        @container =  @find "container"
        @appname = @find "appname"
        @appdesc = @find "app-desc"
        @appdetail = @find "app-detail"
        @btinstall = @find "bt-install"
        @btremove = @find "bt-remove"
        @btexec = @find "bt-exec"
        ($ @container ).css "visibility", "hidden"
        @btexec.set "onbtclick", (e) ->
            app = me.applist.get "selected"
            return unless app
            me._gui.launch app.className if app.className
        @btinstall.set "onbtclick", (e) ->
            me.openDialog "RepositoryDialog"
    fetchApps: (url) ->
        me = @
        @_api.get url, ( d ) ->
            for v in d
                v.text = v.name
                v.iconclass = "fa fa-adn"
            me.applist.set "items", d
        , (e, s) ->
            me.error "Fail to fetch packages list from: #{url}"

    appDetail: (d) ->
        ($ @container).css "visibility", "visible"
        ( $ @appname ).html d.name
        ($ @appdesc).html d.description if d.description
        
        if @systemsetting.system.packages[d.className]
            ($ @btinstall).hide()
            ($ @btremove).show()
            ($ @btexec).show()
        else
            ($ @btinstall).show()
            ($ @btremove).hide()
            ($ @btexec).hide()
      
        ($ @appdetail).empty()
        for k, v of d when k isnt "name" and k isnt "description"
            ($ @appdetail).append $("<li>").append(($ "<span class= 'info-header'>").html k).append $("<span>").html v
        
this.OS.register "MarketPlace", MarketPlace