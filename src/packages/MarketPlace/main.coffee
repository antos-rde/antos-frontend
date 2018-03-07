self = this
class MarketPlace extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "MarketPlace", args
    
    main: () ->
        me = @
        @installdir = @systemsetting.system.pkgpaths.user
        # test repository
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
            me.install e
        @btremove.set "onbtclick", (e) ->
            me.uninstall e
        @bindKey "CTRL-R", () ->
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
    
    menu: () ->
        me = @
        return [
            { text: "Options", child: [
                { text: "Repositories", shortcut: "C-R" }
            ] , onmenuselect: (e) ->
                me.openDialog "RepositoryDialog"
            }
        ]
    
    install: (e) ->
        me = @
        app = @applist.get "selected"
        return unless app
        # get blob file
        @_api.blob app.download, (data) ->
            JSZip.loadAsync(data).then (zip) ->
                pth = "#{me.installdir}/#{app.className}"
                dir = [pth]
                files = []
                for name, file of zip.files
                    if file.dir
                        dir.push(pth + "/" + name)
                    else
                        files.push name
                idx = files.indexOf "package.json"
                return me.error "Invalid package: Meta data file not found" if idx < 0
                # create all directory
                me.mkdirs app.className, dir, () ->
                    me.installFile app.className, zip, files, () ->
                        zip.file("package.json").async("string").then (d) ->
                            v = JSON.parse d
                            console.log v
                            v.text = v.name
                            v.filename = app.className
                            v.type = "app"
                            v.mime = "antos/app"
                            v.iconclass = "fa fa-adn" unless v.iconclass or v.icon
                            v.path = pth
                            me.systemsetting.system.packages[app.className] = v
                            me.notify "Application installed"
                            me._gui.refreshSystemMenu()
                            me.appDetail app
                        .catch (err) ->
                            me.error "Error reading package meta data: " + err
                   
        , (err, s) ->
            return me.error "Cannot down load the app #{err}" if err
    uninstall: (e) ->
        me = @
        app = @applist.get "selected"
        name = app.className
        return unless app
        app = @systemsetting.system.packages[app.className]
        return unless app
        @openDialog "YesNoDialog",
            (d) ->
                return unless d
                app.path.asFileHandler().remove (r) ->
                    return me.error "Cannot uninstall package: #{r.error}" if r.error
                    me.notify "Package uninstalled"
                    me.systemsetting.system.packages[name] = undefined
                    me._gui.refreshSystemMenu()
                    me.appDetail app
        , "Uninstall" ,
        { text: "Uninstall : #{app.name} ?" }
    mkdirs: (n, list, f) ->
        me = @
        if list.length is 0
            f() if f
            return
        dir = (list.splice 0, 1)[0].asFileHandler()
        path = dir.parent()
        dname = dir.basename
        path.asFileHandler().mk dname, (r) ->
            return me.mkdirs n, list, f if r.result
            me.error "Cannot create #{path}/#{dir}"

    installFile: (n, zip, files, f) ->
        me = @
        if files.length is 0
            f() if f
            return
        file = (files.splice 0, 1)[0]
        path = "#{me.installdir}/#{n}/#{file}"
        zip.file(file).async("uint8array").then (d) ->
            fp = path.asFileHandler()
            fp.cache = new Blob [d], { type: "octet/stream" }
            fp.write "text/plain", (r) ->
                return me.installFile n, zip, files, f if r.result
                me.error "Cannot install #{path}"

MarketPlace.dependencies = [ "jszip.min" ]
this.OS.register "MarketPlace", MarketPlace