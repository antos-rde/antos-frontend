self.OS.GUI =
    dialog: new Object()
    init: () ->
        query =
            path: 'VFS/get'
            data: "#{_GUI.tagPath}/tags.json"
        self.OS.API.request query, ()->
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
        , (f) ->
            _courrier.trigger "fail",
                    {id: 0, data: {
                        m: "Cannot load scheme file: #{path} for #{app.name} (#{app.pid})",e: e, s: s },
                    name:"OS"
                    }
            alert "cannot load scheme"

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

    pushService: (srv) ->
        return _PM.createProcess srv, _APP[srv] if _APP[srv]
        path = "services/#{srv}.js"
        $.getScript path
            .done (e, s) ->
                _PM.createProcess srv, _APP[srv]
            .fail (e, s) ->
                _courrier.trigger "srvroutineready", srv
                _courrier.trigger "fail",
                    { id:0,data:{m: "Cannot read service script: #{srv} ", e: e, s: s },
                    name:"0S"}
    
    launch: (app) ->
        if not _APP[app]
            # first load it
            path = "packages/#{app}/"
            $.getScript path + "main.js"
                .done (e, s) ->
                    #load css file
                    $.get "#{path}main.css", () ->
                        $ '<link>', { rel: 'stylesheet', type: 'text/css', 'href': "#{path}main.css" }
                            .appendTo 'head'
                    #launch
                    if _APP[app]
                        # load app meta data
                        _API.get "#{path}package.json",
                            (data) ->
                                _APP[app].meta = data
                                _PM.createProcess app, _APP[app]
                                console.log "Fist time loading " + app
                            , (e, s) ->
                                _courrier.trigger "fail",
                                    {id:0, data:{ m: "Cannot read application metadata: #{app} ",e: e, s: s }, name:"OS"}
                                alert "cannot read application, meta-data"
                .fail (e,s) ->
                    #BUG report here
                    _courrier.trigger "fail",
                        {id :0, data:{m: "Cannot load application script: #{app}", 
                        e: e, s:s }, name:"OS"}
                    console.log "bug report", e, s, path
        else
            # now launch it
            if _APP[app]
                _PM.createProcess app, _APP[app]
    dock: (app,meta) ->
        # dock an application to a dock
        # create a data object
        data =
            icon: null
            iconclass: meta.iconclass || ""
            app:app
            onbtclick: () ->
                app.toggle()
        data.icon = "packages/#{meta.app}/#{meta.icon}" if meta.icon
        data.iconclass = "fa fa-cogs" if (not meta.icon) and (not meta.iconclass)
        dock = $ "#sysdock"
        dock.get(0).newapp data
        app.sysdock = dock.get(0)
        app.appmenu = ($ "[data-id = 'appmenu']", "#syspanel")[0]
        app.init()
        #app.show() -- notwork, sice the scheme is not loaded yet

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
                #console.log ($ "#workspace").get(0), ($ e).parent().get(0)
                p = $(e).parent().get(0)
                handler p if p isnt ($ "#workspace").get(0)
        handler event.target
        event.preventDefault()
    initDM: ->
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