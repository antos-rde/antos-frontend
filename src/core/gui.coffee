self.OS.GUI =
    subwindows: new Object()
    dialog: undefined
    htmlToScheme: (html, app, parent) ->
        scheme =  $.parseHTML html
        ($ parent).append scheme
        riot.mount ($ scheme), { observable: app.observable }
        app.scheme = scheme[0]
        app.main()
        app.show()
    loadScheme: (path, app, parent) ->
        path.asFileHandler().read (x) ->
            return null unless x
            _GUI.htmlToScheme x, app, parent
        #, (e, s) ->
        #    _courrier.osfail "Cannot load scheme file: #{path} for #{app.name} (#{app.pid})", e, s

    clearTheme: () ->
         $ "head link#ostheme"
            .attr "href", ""

    loadTheme: (name, force) ->
        _GUI.clearTheme() if force
        path = "resources/themes/#{name}/#{name}.css"
        $ "head link#ostheme"
            .attr "href", path

    pushServices: (srvs) ->
        return unless srvs.length > 0
        _courrier.observable.one "srvroutineready", () ->
            srvs.splice 0, 1
            _GUI.pushServices srvs
        _GUI.pushService srvs[0]
    
    openDialog: (d, f, title, data) ->
        if _GUI.dialog
            _GUI.dialog.show()
            return
        if not _GUI.subwindows[d]
            ex = _API.throwe "Dialog"
            return _courrier.oserror "Dialog #{d} not found", ex, null
        _GUI.dialog = new _GUI.subwindows[d]()
        _GUI.dialog.parent = _GUI
        _GUI.dialog.handler = f
        _GUI.dialog.pid = -1
        _GUI.dialog.data = data
        _GUI.dialog.title = title
        _GUI.dialog.init()

    pushService: (ph) ->
        arr = ph.split "/"
        srv = arr[1]
        app = arr[0]
        return _PM.createProcess srv, _OS.APP[srv] if _OS.APP[srv]
        _GUI.loadApp app,
            (a) ->
                return _PM.createProcess srv, _OS.APP[srv] if _OS.APP[srv]
            (e, s) ->
                _courrier.trigger "srvroutineready", srv
                _courrier.osfail "Cannot read service script: #{srv} ", e, s

    appsByMime: (mime) ->
        metas = ( v for k, v of _OS.setting.system.packages when v.app )
        mimes = ( m.mimes for m in metas when m)
        apps = []
        # search app by mimes
        f = ( arr, idx ) ->
            try
                arr.filter (m, i) ->
                    if mime.match (new RegExp m, "g")
                        apps.push metas[idx]
                        return false
                    return false
            catch e
                _courrier.osfail "Find app by mimes #{mime}", e, mime

        ( f m, i if m ) for m, i in mimes
        return apps
    
    appsWithServices: () ->
        o = {}
        o[k] = v for k, v of _OS.setting.system.packages when v.services and v.services.length > 0
        o

    openWith: (it) ->
        return unless it
        return _GUI.launch it.app if it.type is "app" and it.app
        return _courrier.osinfo "Application#{it.text} is not executable" if it.type is "app"
        apps = _GUI.appsByMime ( if it.type is "dir" then "dir" else it.mime )
        return _courrier.osinfo "No application available to open #{it.filename}" if apps.length is 0
        return _GUI.launch apps[0].app, [it.path] if apps.length is 1
        list = ( { text: e.app, icon: e.icon, iconclass: e.iconclass } for e in apps )
        _GUI.openDialog "SelectionDialog", ( d ) ->
            _GUI.launch d.text, [it.path]
        , "Open width", list

    forceLaunch: (app, args) ->
        console.log "This method is used for developing only, please use the launch method instead"
        _PM.killAll app
        ($ _OS.APP[app].style).remove() if _OS.APP[app] and _OS.APP[app].style
        _OS.APP[app] = undefined
        _GUI.launch app, args

    loadApp: (app, ok, err) ->
        path = "os:///packages/#{app}"
        path = _OS.setting.system.packages[app].path if _OS.setting.system.packages[app].path
        js = path + "/main.js"
        
        js.asFileHandler().read (d) ->
                # load app meta data
                "#{path}/package.json".asFileHandler().read (data) ->
                    data.path = path
                    _OS.APP[app].meta = data if _OS.APP[app]
                    _OS.APP[v].meta = data for v in data.services if data.services
                    #load css file
                    css =  "#{path}/main.css"
                    css.asFileHandler().onready (d) ->
                        el = $ '<link>', { rel: 'stylesheet', type: 'text/css', 'href': "#{_API.handler.get}/#{css}" }
                            .appendTo 'head'
                        _OS.APP[app].style = el[0] if _OS.APP[app]
                        ok app
                    , () ->
                        #launch
                        ok app
                , "json"
                #ok app
            , "script"
    launch: (app, args) ->
        if not _OS.APP[app]
            # first load it
            _GUI.loadApp app,
                (a)->
                    _PM.createProcess a, _OS.APP[a], args
                , (e, s) ->
        else
            # now launch it
            if _OS.APP[app]
                _PM.createProcess app, _OS.APP[app], args
    dock: (app, meta) ->
        # dock an application to a dock
        # create a data object
        data =
            icon: null
            iconclass: meta.iconclass || ""
            app: app
            onbtclick: () -> app.toggle()
        # TODO: this path is not good, need to create a blob of it
        data.icon = "#{_API.handler.get}/#{meta.path}/#{meta.icon}" if meta.icon
        # TODO: add default app icon class in system setting
        # so that it can be themed
        data.iconclass = "fa fa-cogs" if (not meta.icon) and (not meta.iconclass)
        dock = $ "#sysdock"
        app.one "rendered", () ->
            dock.get(0).newapp data
            app.sysdock = dock.get(0)
            app.appmenu = ($ "[data-id = 'appmenu']", "#syspanel")[0]
        app.init()

    undock: (app) ->
        ($ "#sysdock").get(0).removeapp app

    attachservice: (srv) ->
        ($ "#syspanel")[0].attachservice srv
        srv.init()
    detachservice: (srv) ->
        ($ "#syspanel")[0].detachservice srv
    bindContextMenu: (event) ->
        handler  = (e) ->
            if e.contextmenuHandler
                e.contextmenuHandler event, ($ "#contextmenu")[0]
            else
                p = $(e).parent().get(0)
                handler p if p isnt ($ "#workspace").get(0)
        handler event.target
        event.preventDefault()

    initDM: ->
        # check login first
        _API.resource "schemes/dm.html", (x) ->
            return null unless x
            scheme =  $.parseHTML x
            ($ "#wrapper").append scheme
            
            # system menu and dock
            riot.mount ($ "#syspanel", $ "#wrapper")
            riot.mount ($ "#sysdock", $ "#wrapper"), { items: [] }

            # context menu
            riot.mount ($ "#contextmenu")
            ($ "#workspace").contextmenu (e) -> _GUI.bindContextMenu e
            
            # desktop default file manager
            desktop = $ "#desktop"
            fp = _OS.setting.desktop.path.asFileHandler()
            desktop[0].fetch = () ->
                fn = () ->
                    fp.read (d) ->
                        return _courrier.osfail d.error, (_API.throwe "OS.VFS"), d.error if d.error
                        items = []
                        $.each d.result,  (i, v) ->
                            return if v.filename[0] is '.' and  not _OS.setting.desktop.showhidden
                            v.text = v.filename
                            #v.text = v.text.substring(0,9) + "..." ifv.text.length > 10
                            v.iconclass = v.type
                            items.push(v)
                        desktop[0].set "items", items
                        desktop[0].refresh()

                fp.onready () ->
                        fn()
                    , ( e ) -> # try to create the path
                        console.log "#{fp.path} not found"
                        name = fp.basename
                        fp.parent().asFileHandler().mk name, (r) ->
                            ex = _API.throwe "OS.VFS"
                            if r.error then _courrier.osfail d.error, ex, d.error else fn()
                
            desktop[0].ready = (e) ->
                e.observable = _courrier
                window.onresize = () ->
                    _courrier.trigger "desktopresize"
                    e.refresh()

                desktop[0].set "onlistselect", (d) ->
                    ($ "#sysdock").get(0).set "selectedApp", null
            
                desktop[0].set "onlistdbclick", ( d ) ->
                    ($ "#sysdock").get(0).set "selectedApp", null
                    it = desktop[0].get "selected"
                    _GUI.openWith it

                #($ "#workingenv").on "click", (e) ->
                #     desktop[0].set "selected", -1

                desktop.on "click", (e) ->
                    return unless e.target is desktop[0]
                    desktop[0].set "selected", -1
                    ($ "#sysdock").get(0).set "selectedApp", null
                    console.log "desktop clicked"
            
                desktop[0].contextmenuHandler = (e, m) ->
                    desktop[0].set "selected", -1 if e.target is desktop[0]
                    ($ "#sysdock").get(0).set "selectedApp", null
                    menu = [
                        { text: "Open", dataid: "desktop-open" },
                        { text: "Refresh", dataid: "desktop-refresh" }
                    ]
                    menu = menu.concat ( v for k, v of _OS.setting.desktop.menu)
                    m.set "items", menu
                    m.set "onmenuselect", (evt) ->
                        switch evt.item.data.dataid
                            when "desktop-open"
                                it = desktop[0].get "selected"
                                return _GUI.openWith it if it
                                it = _OS.setting.desktop.path.asFileHandler()
                                it.mime = "dir"
                                _GUI.openWith it
                            when "desktop-refresh"
                                desktop[0].fetch()
                            else
                                _GUI.launch evt.item.data.app, evt.item.data.args if evt.item.data.app
                    m.show(e)
                
                desktop[0].fetch()
                _courrier.observable.on "VFS", (d) ->
                    desktop[0].fetch() if d.data.file.hash() is fp.hash() or d.data.file.parent().hash() is fp.hash()
                _courrier.ostrigger "desktoploaded"
            # mount it
            riot.mount desktop
        , (e, s) ->
            alert "System fall: Cannot init desktop manager"
            console.log s, e


    buildSystemMenu: () ->
        
        menu =
            text: ""
            iconclass: "fa fa-eercast"
            dataid: "sys-menu-root"
            child: [
                {
                    text: "Application",
                    child: ( v for k, v of _OS.setting.system.packages when v.app ),
                    dataid: "sys-apps"
                    iconclass: "fa fa-adn",
                    onmenuselect: (d) ->
                        _GUI.launch d.item.data.app
                }
            ]
        menu.child = menu.child.concat (v for k, v of _OS.setting.system.menu)
        menu.child.push
            text: "Log out",
            dataid: "sys-logout",
            iconclass: "fa fa-user-times"
        menu.onmenuselect = (d) ->
            return _API.handler.logout() if d.item.data.dataid is "sys-logout"
            _GUI.launch d.item.data.app unless d.item.data.dataid
        
        ($ "[data-id = 'os_menu']", "#syspanel")[0].set "items", [menu]
        #console.log menu
        
        
    login: () ->
        _OS.cleanup()
        _API.resource "schemes/login.html", (x) ->
            return null unless x
            scheme = $.parseHTML x
            ($ "#wrapper").append scheme
            ($ "#btlogin").click () ->
                data =
                    username: ($ "#txtuser").val(),
                    password: ($ "#txtpass").val()
                _API.handler.login data, (d) ->
                    if d.error then ($ "#login_error").html d.error else _GUI.startAntOS d.result
            ($ "#txtpass").keyup (e) ->
                ($ "#btlogin").click() if e.which is 13
        , (e, s) ->
            alert "System fall: Cannot init login screen"
    
    startAntOS: (conf) ->
        # clean up things
        _OS.cleanup()
        # get setting from conf
        _OS.setting.desktop = conf.desktop if conf.desktop
        _OS.setting.applications = conf.applications if conf.applications
        _OS.setting.appearance = conf.appearance if conf.appearance
        _OS.setting.user = conf.user
        _OS.setting.VFS = conf.VFS if conf.VFS
        _OS.setting.desktop.path = "home:///.desktop" unless _OS.setting.desktop.path
        _OS.setting.desktop.menu = {} unless _OS.setting.desktop.menu
        _OS.setting.VFS.mountpoints = [
            #TODO: multi app try to write to this object, it neet to be cloned
            { text: "Applications", path: 'app:///', iconclass: "fa  fa-adn", type: "app" },
            { text: "Home", path: 'home:///', iconclass: "fa fa-home", type: "fs" },
            { text: "OS", path: 'os:///', iconclass: "fa fa-inbox", type: "fs" },
            { text: "Desktop", path: _OS.setting.desktop.path , iconclass: "fa fa-desktop", type: "fs" },
            { text: "Shared", path: 'shared:///' , iconclass: "fa fa-share-square", type: "fs" }
        ] if not _OS.setting.VFS.mountpoints

        _OS.setting.system = conf.system if conf.system
        _OS.setting.system.pkgpaths = [
            "home:///.packages",
            "os:///packages"
        ] unless _OS.setting.system.pkgpaths
        _OS.setting.system.menu = {} unless _OS.setting.system.menu
        _OS.setting.system.repositories = [] unless _OS.setting.system.repositories
        _OS.setting.appearance.theme = "antos" unless _OS.setting.appearance.theme
        # load theme
        _GUI.loadTheme _OS.setting.appearance.theme
        # initDM
        _GUI.initDM()
        _courrier.observable.one "syspanelloaded", () ->
            # TODO load packages list then build system menu
            _API.packages.cache (ret) ->
                if ret.result
                    _API.packages.fetch (r) ->
                        if r.result
                            for k, v of r.result
                                v.text = v.name
                                v.filename = k
                                v.type = "app"
                                v.mime = "antos/app"
                                v.iconclass = "fa fa-adn" unless v.iconclass or v.icon
                        _OS.setting.system.packages = if r.result then r.result else
                        _GUI.buildSystemMenu()
                        # push startup services
                        # TODO: get services list from user setting
                        _GUI.pushServices [
                            "CoreServices/PushNotification",
                            "CoreServices/Spotlight",
                            "CoreServices/Calendar"
                        ]
                #_GUI.launch "DummyApp"

        # startup application here
        _courrier.observable.one "desktoploaded", () ->
            #_GUI.launch "DummyApp"
            #_GUI.launch "NotePad"