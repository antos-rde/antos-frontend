# Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

# AnTOS Web desktop is is licensed under the GNU General Public
# License v3.0, see the LICENCE file for more information

# This program is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of 
# the License, or (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.

# You should have received a copy of the GNU General Public License
#along with this program. If not, see https://www.gnu.org/licenses/.

self.OS.GUI =
    subwindows: new Object()
    dialog: undefined
    fullscreen: false
    shortcut:
        ALT: {}
        CTRL: {}
        SHIFT: {}
        META: {}
    SYS_MENU: [
        {
            text: "__(Applications)",
            child: [],
            dataid: "sys-apps"
            iconclass: "fa fa-adn",
            onmenuselect: (d) ->
                _GUI.launch d.item.data.app
        }
    ]
    htmlToScheme: (html, app, parent) ->
        scheme =  $.parseHTML html
        $(app.scheme).remove() if app.scheme
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
            return _courrier.oserror __("Dialog {0} not found", d), ex, null
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
                _courrier.osfail __("Cannot read service script: {0}", srv), e, s

    appsByMime: (mime) ->
        metas = ( v for k, v of _OS.setting.system.packages when v and v.app )
        mimes = ( m.mimes for m in metas when m)
        apps = []
        # search app by mimes
        f = ( arr, idx ) ->
            try
                arr.filter (m, i) ->
                    if mime.match (new RegExp m, "g")
                        return false if (apps.indexOf metas[idx]) >= 0
                        apps.push metas[idx]
                        return false
                    return false
            catch e
                _courrier.osfail __("Error find app by mimes {0}", mime), e, mime

        ( f m, i if m ) for m, i in mimes
        return apps
    
    appsWithServices: () ->
        o = {}
        o[k] = v for k, v of _OS.setting.system.packages when v and v.services and v.services.length > 0
        o

    openWith: (it) ->
        return unless it
        return _GUI.launch it.app if it.type is "app" and it.app
        return _courrier.osinfo __("Application {0} is not executable", it.text) if it.type is "app"
        apps = _GUI.appsByMime ( if it.type is "dir" then "dir" else it.mime )
        return _courrier.osinfo __("No application available to open {0}", it.filename) if apps.length is 0
        return _GUI.launch apps[0].app, [it.path] if apps.length is 1
        list = ( { text: e.app, icon: e.icon, iconclass: e.iconclass } for e in apps )
        _GUI.openDialog "SelectionDialog", ( d ) ->
            _GUI.launch d.text, [it.path]
        , __("Open with"), list

    forceLaunch: (app, args) ->
        console.log "This method is used for developing only, please use the launch method instead"
        _PM.killAll app
        ($ _OS.APP[app].style).remove() if _OS.APP[app] and _OS.APP[app].style
        _OS.APP[app] = undefined
        _GUI.launch app, args

    loadApp: (app, ok, err) ->
        path = "os://packages/#{app}"
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
        data.icon = "#{meta.path}/#{meta.icon}" if meta.icon
        # TODO: add default app icon class in system setting
        # so that it can be themed
        data.iconclass = "fa fa-cogs" if (not meta.icon) and (not meta.iconclass)
        dock = $ "#sysdock"
        app.one "rendered", () ->
            dock.get(0).newapp data
            app.sysdock = dock.get(0)
            app.appmenu = ($ "[data-id = 'appmenu']", "#syspanel")[0]
        app.init()

    toggleFullscreen: () ->
        el = ($ "body")[0]
        if _GUI.fullscreen
            return document.exitFullscreen() if document.exitFullscreen
            return document.mozCancelFullScreen() if document.mozCancelFullScreen
            return document.webkitExitFullscreen() if document.webkitExitFullscreen
            return document.cancelFullScreen() if document.cancelFullScreen
        else
            return el.requestFullscreen() if el.requestFullscreen
            return el.mozRequestFullScreen() if el.mozRequestFullScreen
            return el.webkitRequestFullscreen() if el.webkitRequestFullscreen
            return el.msRequestFullscreen() if el.msRequestFullscreen

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

    bindKey: (k, f) ->
        arr = k.split "-"
        return unless arr.length is 2
        fnk = arr[0].toUpperCase()
        c = arr[1].toUpperCase()
        return unless _GUI.shortcut[fnk]
        _GUI.shortcut[fnk][c] = f

    wallpaper: (obj) ->
        if obj
            _OS.setting.appearance.wp = obj
        wp = _OS.setting.appearance.wp
        $("body").css("background-image", "url(#{_API.handler.get}/#{wp.url})" )
            .css("background-size", wp.size)
            .css("background-repeat", wp.repeat)

    initDM: ->
        ($ document).on 'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', ()->
            _GUI.fullscreen = not _GUI.fullscreen
        # check login first
        _API.resource "schemes/dm.html", (x) ->
            return null unless x
            scheme =  $.parseHTML x
            ($ "#wrapper").append scheme
            
            _courrier.observable.one "sysdockloaded", () ->
                ($ window).bind 'keydown', (event) ->
                    dock = ($ "#sysdock")[0]
                    return unless dock
                    app = dock.get "selectedApp"
                    #return true unless app
                    c = String.fromCharCode(event.which).toUpperCase()
                    fnk = undefined
                    if event.ctrlKey
                        fnk = "CTRL"
                    else if event.metaKey
                        fnk = "META"
                    else if event.shiftKey
                        fnk = "SHIFT"
                    else if event.altKey
                        fnk = "ALT"
                    
                    return  unless fnk
                    r = if app then  app.shortcut fnk, c, event else true
                    return  event.preventDefault() if not r
                    return  unless _GUI.shortcut[fnk]
                    return  unless _GUI.shortcut[fnk][c]
                    _GUI.shortcut[fnk][c](event)
                    event.preventDefault()
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
                    fp = _OS.setting.desktop.path.asFileHandler()
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
                    #console.log "desktop clicked"
            
                desktop[0].contextmenuHandler = (e, m) ->
                    desktop[0].set "selected", -1 if e.target is desktop[0]
                    ($ "#sysdock").get(0).set "selectedApp", null
                    menu = [
                        { text: __("Open"), dataid: "desktop-open" },
                        { text: __("Refresh"), dataid: "desktop-refresh" }
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
            alert __("System fail: Cannot init desktop manager")
            console.log s, e
    refreshDesktop: () ->
        ($ "#desktop")[0].fetch()
    refreshSystemMenu: () ->
        _GUI.SYS_MENU.length = 1
        _GUI.SYS_MENU[0].child.length = 0
        _GUI.SYS_MENU[0].child.push v for k, v of _OS.setting.system.packages when (v and v.app)
        _GUI.SYS_MENU.push v for k, v of _OS.setting.system.menu
        _GUI.SYS_MENU.push
            text: "__(Toggle Full screen)",
            dataid: "os-fullsize",
            iconclass: "fa fa-tv"
        _GUI.SYS_MENU.push
            text: "__(Log out)",
            dataid: "sys-logout",
            iconclass: "fa fa-user-times"
    buildSystemMenu: () ->
        menu =
            text: ""
            iconclass: "fa fa-eercast"
            dataid: "sys-menu-root"
            child: _GUI.SYS_MENU
        menu.onmenuselect = (d) ->
            return _OS.exit() if d.item.data.dataid is "sys-logout"
            return _GUI.toggleFullscreen() if d.item.data.dataid is "os-fullsize"
            _GUI.launch d.item.data.app unless d.item.data.dataid
        menu = [menu]
        ($ "[data-id = 'os_menu']", "#syspanel")[0].set "items", menu

        #console.log menu
    
    mkdialog: (conf) ->
        return new _GUI.BasicDialog conf.name, conf.layout
        
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
            alert __("System fail: Cannot init login screen")
    
    startAntOS: (conf) ->
        # clean up things
        _OS.cleanup()
        # get setting from conf
        _OS.systemSetting conf
        #console.log _OS.setting
        # load theme
        _GUI.loadTheme _OS.setting.appearance.theme
        _GUI.wallpaper()
        _courrier.observable.one "syspanelloaded", () ->
            # TODO load packages list then build system menu
            _courrier.observable.on "systemlocalechange", (name) ->
                ($ "#syspanel")[0].update()

            _API.packages.cache (ret) ->
                if ret.result
                    _API.packages.fetch (r) ->
                        if r.result
                            for k, v of r.result
                                v.text = v.name
                                v.filename = k
                                v.type = "app"
                                v.mime = "antos/app"
                                v.icon = "#{v.path}/#{v.icon}" if v.icon
                                v.iconclass = "fa fa-adn" unless v.iconclass or v.icon
                        _OS.setting.system.packages = if r.result then r.result else
                        _GUI.refreshSystemMenu()
                        _GUI.buildSystemMenu()
                        # push startup services
                        # TODO: get services list from user setting
                        _GUI.pushServices (v for v in _OS.setting.system.startup.services)
                        (_GUI.launch a) for a in _OS.setting.system.startup.apps
                #_GUI.launch "DummyApp"
        # initDM
        _API.setLocale _OS.setting.system.locale, () ->
            _GUI.initDM()