self.OS.GUI =
    dialog: new Object()
    htmlToScheme: (html, app, parent) ->
        scheme =  $.parseHTML html
        ($ parent).append scheme
        riot.mount ($ scheme), { observable: app.observable }
        app.scheme = scheme[0]
        app.main()
        app.show()
    loadScheme: (path, app, parent) ->
        _API.get path,
        (x) ->
            return null unless x
            _GUI.htmlToScheme x, app, parent
        , (e, s) ->
            _courrier.osfail "Cannot load scheme file: #{path} for #{app.name} (#{app.pid})",e,s

    clearTheme: () ->
         $ "head link#ostheme"
            .attr "href", ""

    loadTheme: (name) ->
        path = "resources/themes/#{name}/#{name}.css"
        $ "head link#ostheme"
            .attr "href", path

    pushServices: (srvs) ->
        f = (v) ->
            _courrier.observable.one "srvroutineready", () -> _GUI.pushService v
        _GUI.pushService srvs[0]
        srvs.splice 0, 1
        f i for i in srvs

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

    forceLaunch: (app, args) ->
        console.log "This method is used for developing only, please use the launch method instead"
        _PM.killAll app
        _OS.APP[app] = undefined
        _GUI.launch app, args

    loadApp: (app, ok, err) ->
        path = "packages/#{app}/"
        _API.script path + "main.js",
            (d) ->
                #load css file
                _API.get "#{path}main.css",
                    () ->
                        $ '<link>', { rel: 'stylesheet', type: 'text/css', 'href': "#{path}main.css" }
                            .appendTo 'head'
                    , () ->
                #launch
                if _OS.APP[app]
                    # load app meta data
                    _API.get "#{path}package.json",
                        (data) ->
                            _OS.APP[app].meta = data
                            ok app
                        , (e, s) ->
                            _courrier.osfail "Cannot read application metadata: #{app}", e, s
                            err e, s
                else
                    ok app
            , (e, s) ->
                #BUG report here
                _courrier.osfail "Cannot load application script: #{app}", e, s
                console.log "bug report", e, s, path
                err e,s
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
        data.icon = "packages/#{meta.app}/#{meta.icon}" if meta.icon
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
            # context menu
            riot.mount ($ "#contextmenu")
            ($ "#workspace").contextmenu (e) -> _GUI.bindContextMenu e
            #desktop
            desktop = ($ "#desktop")
            desktop.on "click", (e) ->
                return if e.target isnt desktop.get(0)
                ($ "#sysdock").get(0).set "selectedApp", null
            desktop.get(0).contextmenuHandler = (e, m) ->
                console.log "context menu handler for desktop"
            # system menu
            riot.mount ($ "#syspanel", $ "#wrapper")
            riot.mount ($ "#sysdock", $ "#wrapper"), { items: [] }
        , (e, s) ->
            alert "System fall: Cannot init desktop manager"
    
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
        , (e, s) ->
            alert "System fall: Cannot init login screen"
    
    startAntOS: (conf) ->
        _OS.cleanup()
        _OS.setting.applications = conf.applications if conf.applications
        _OS.setting.appearance = conf.appearance if conf.appearance
        _OS.setting.user = conf.user
        # get setting from conf
        # load packages list
        # load theme
        # initDM
        _GUI.loadTheme "antos"
        _GUI.initDM()
        _courrier.observable.one "syspanelloaded", () ->
            #_GUI.loadApp "CoreServices", (a) ->
            _GUI.pushServices ["CoreServices/PushNotification", "CoreServices/Spotlight", "CoreServices/Calendar"]