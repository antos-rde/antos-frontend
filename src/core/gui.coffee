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

Ant.OS.GUI =
    subwindows: new Object()
    dialog: undefined
    fullscreen: false
    workspace: "#desktop"
    shortcut:
        ALT: {}
        CTRL: {}
        SHIFT: {}
        META: {}
    htmlToScheme: (html, app, parent) ->
        scheme =  $.parseHTML html
            
        $(app.scheme).remove() if app.scheme
        ($ parent).append scheme
        app.scheme = scheme[0]
        scheme[0].uify app.observable
        app.main()
        app.show()
    loadScheme: (path, app, parent) ->
        path.asFileHandle().read()
            .then (x) ->
                return null unless x
                Ant.OS.GUI.htmlToScheme x, app, parent
            .catch (e) ->
                Ant.OS.announcer.oserror __("Cannot load scheme: {0}", path), e
    clearTheme: () ->
         $ "head link#ostheme"
            .attr "href", ""

    loadTheme: (name, force) ->
        Ant.OS.GUI.clearTheme() if force
        path = "resources/themes/#{name}/#{name}.css"
        $ "head link#ostheme"
            .attr "href", path

    pushServices: (srvs) ->
        new Promise (resolve, reject) ->
            return resolve() unless srvs.length > 0
            srv = srvs.splice(0, 1)[0]
            Ant.OS.GUI.pushService srv
                .then (d) ->
                    Ant.OS.GUI.pushServices srvs
                        .then () -> resolve()
                        .catch (e) -> reject e
                .catch (e) ->
                    Ant.OS.announcer.osfail __("Unable to load: {0}", srv), e
                    Ant.OS.GUI.pushServices srvs
                        .then () -> resolve()
                        .catch (e) -> reject e
    
    openDialog: (d, data) ->
        new Promise (resolve, reject) ->
            if Ant.OS.GUI.dialog
                Ant.OS.GUI.dialog.show()
                return resolve()
            if not Ant.OS.GUI.subwindows[d]
                ex = Ant.OS.API.throwe "Dialog"
                return reject(ex)
            Ant.OS.GUI.dialog = new Ant.OS.GUI.subwindows[d]()
            Ant.OS.GUI.dialog.parent = Ant.OS.GUI
            Ant.OS.GUI.dialog.handle = resolve
            Ant.OS.GUI.dialog.reject = reject
            Ant.OS.GUI.dialog.pid = -1
            Ant.OS.GUI.dialog.data = data
            Ant.OS.GUI.dialog.init()

    pushService: (ph) ->
        new Promise (resolve, reject) ->
            arr = ph.split "/"
            srv = arr[1]
            app = arr[0]
            if Ant.OS.APP[srv]
                Ant.OS.PM.createProcess srv, Ant.OS.APP[srv]
                    .then (d) -> resolve d
                    .catch (e) -> reject e
            else
                Ant.OS.GUI.loadApp app
                    .then (a) ->
                        if not Ant.OS.APP[srv]
                            return reject Ant.OS.API.throwe __("Service not found: {0}", ph)
                        Ant.OS.PM.createProcess srv, Ant.OS.APP[srv]
                            .then (d) -> resolve d
                            .catch (e) -> reject e
                    .catch (e) -> reject e

    appsByMime: (mime) ->
        metas = ( v for k, v of Ant.OS.setting.system.packages when v and v.app )
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
                Ant.OS.announcer.osfail __("Error find app by mimes {0}", mime), e

        ( f m, i if m ) for m, i in mimes
        return apps
    
    appsWithServices: () ->
        o = {}
        o[k] = v for k, v of Ant.OS.setting.system.packages when v and v.services and v.services.length > 0
        o

    openWith: (it) ->
        return unless it
        return Ant.OS.GUI.launch it.app if it.type is "app" and it.app
        return Ant.OS.announcer.osinfo __("Application {0} is not executable", it.text) if it.type is "app"
        apps = Ant.OS.GUI.appsByMime ( if it.type is "dir" then "dir" else it.mime )
        return Ant.OS.announcer.osinfo __("No application available to open {0}", it.filename) if apps.length is 0
        return Ant.OS.GUI.launch apps[0].app, [it] if apps.length is 1
        list = ( { text: e.app, icon: e.icon, iconclass: e.iconclass } for e in apps )
        Ant.OS.GUI.openDialog("SelectionDialog", {
            title: __("Open with"),
            data: list
        }).then ( d ) ->
            Ant.OS.GUI.launch d.text, [ { path: it.path, type: it.type }]

    forceLaunch: (app, args) ->
        console.warn "This method is used for developing only, please use the launch method instead"
        Ant.OS.GUI.unloadApp app
        Ant.OS.GUI.launch app, args

    unloadApp: (app) ->
        Ant.OS.PM.killAll app, true
        ($ Ant.OS.APP[app].style).remove() if Ant.OS.APP[app] and Ant.OS.APP[app].style
        delete Ant.OS.APP[app]
    
    loadApp: (app) ->
        new Promise (resolve, reject) ->
            path = Ant.OS.setting.system.packages[app].path if Ant.OS.setting.system.packages[app].path
            js = path + "/main.js"
            
            js.asFileHandle().read("script")
                .then (d) ->
                    # load app meta data
                    "#{path}/package.json".asFileHandle().read("json")
                        .then (data) ->
                            data.path = path
                            Ant.OS.APP[app].meta = data if Ant.OS.APP[app]
                            Ant.OS.APP[v].meta = data for v in data.services if data.services
                            #load css file
                            css =  "#{path}/main.css"
                            css.asFileHandle().onready()
                                .then (d) ->
                                    stamp = (new Date).timestamp()
                                    el = $ '<link>', { rel: 'stylesheet', type: 'text/css', 'href': "#{Ant.OS.API.handle.get}/#{css}?stamp=#{stamp}" }
                                        .appendTo 'head'
                                    Ant.OS.APP[app].style = el[0] if Ant.OS.APP[app]
                                    resolve app
                                .catch (e) -> resolve app
                        .catch (e) -> reject e
                    #ok app
                .catch (e) -> reject e
    launch: (app, args) ->
        if not Ant.OS.APP[app]
            # first load it
            Ant.OS.GUI.loadApp(app).then (a) ->
                Ant.OS.PM.createProcess a, Ant.OS.APP[a], args
            .catch (e) ->
                Ant.OS.announcer.osfail __("Unable to launch: {0}", app), e
        else
            # now launch it
            if Ant.OS.APP[app]
                Ant.OS.PM.createProcess app, Ant.OS.APP[app], args
                    .catch (e) ->
                        Ant.OS.announcer.osfail __("Unable to launch: {0}", app), e
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
        app.init()
        app.one "rendered", () ->
            dock.get(0).newapp data
            app.sysdock = dock.get(0)
            app.appmenu = ($ "[data-id = 'appmenu']", "#syspanel")[0]
            app.subscribe "systemlocalechange", (name) ->
                app.updateLocale(name)
                app.update()
            app.subscribe "appregistry", ( m ) ->
                app.applySetting m.data.m if (m.name is app.name)

    toggleFullscreen: () ->
        el = document.documentElement
        if Ant.OS.GUI.fullscreen
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
        srv.subscribe "systemlocalechange", (name) -> srv.update()
    detachservice: (srv) ->
        ($ "#syspanel")[0].detachservice srv
    bindContextMenu: (event) ->
        handle  = (e) ->
            if e.contextmenuHandle
                e.contextmenuHandle event, ($ "#contextmenu")[0]
            else
                p = $(e).parent().get(0)
                handle p if p isnt ($ "#workspace").get(0)
        handle event.target
        event.preventDefault()

    bindKey: (k, f) ->
        arr = k.split "-"
        return unless arr.length is 2
        fnk = arr[0].toUpperCase()
        c = arr[1].toUpperCase()
        return unless Ant.OS.GUI.shortcut[fnk]
        Ant.OS.GUI.shortcut[fnk][c] = f

    wallpaper: (obj) ->
        if obj
            Ant.OS.setting.appearance.wp = obj
        wp = Ant.OS.setting.appearance.wp
        $("body").css("background-image", "url(#{Ant.OS.API.handle.get}/#{wp.url})" )
            .css("background-size", wp.size)
            .css("background-repeat", wp.repeat)

    showTooltip: (el, text, e) ->
        el = el[0]
        label = ($ "#systooltip")[0]
        cb = (ev) ->
            if $(ev.target).closest(el).length is 0
                $(label).hide()
                $(document).off "mousemove", cb
        $(document).on "mousemove", cb
        arr = text.split /:(.+)/
        tip = text
        tip = arr[1] if arr.length > 1
        offset = $(el).offset()
        w = $(el).width()
        h = $(el).height()
        label.set "text", tip
        $(label).show()
        switch arr[0]
            when "cr" # center right of the element
                left = offset.left + w + 5
                top = offset.top + h / 2 - $(label).height() / 2
            when "ct" #ceter top
                left = offset.left + w / 2 - $(label).width() / 2
                top = offset.top - $(label).height() - 5
            else
                return unless e
                top = e.clientY + 5
                left = e.clientX + 5
        $(label).css "top", top + "px"
                .css "left", left + "px"

    initDM: ->
        scheme =  $.parseHTML Ant.OS.GUI.schemes.ws
        ($ "#wrapper").append scheme
        
        Ant.OS.announcer.observable.one "sysdockloaded", () ->
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
                return  unless Ant.OS.GUI.shortcut[fnk]
                return  unless Ant.OS.GUI.shortcut[fnk][c]
                Ant.OS.GUI.shortcut[fnk][c](event)
                event.preventDefault()
        # system menu and dock
        $("#syspanel")[0].uify()
        $("#sysdock")[0].uify()
        $("#systooltip")[0].uify()
        $("#contextmenu")[0].uify()
       
        ($ "#workspace").contextmenu (e) -> Ant.OS.GUI.bindContextMenu e
        # tooltip
        ($ document).mouseover (e) ->
            el = $(e.target).closest "[tooltip]"
            return unless el.length > 0
            Ant.OS.GUI.showTooltip el, ($(el).attr "tooltip"), e
        
        fp = Ant.OS.setting.desktop.path.asFileHandle()
        # desktop default file manager
        desktop = $ Ant.OS.GUI.workspace
        desktop[0].fetch = () ->
            file = Ant.OS.setting.desktop.path.asFileHandle()
            fn = () ->
                file.read().then (d) ->
                    return Ant.OS.announcer.osfail d.error, (Ant.OS.API.throwe "OS.VFS"), d.error if d.error
                    items = []
                    $.each d.result,  (i, v) ->
                        return if v.filename[0] is '.' and  not Ant.OS.setting.desktop.showhidden
                        v.text = v.filename
                        #v.text = v.text.substring(0,9) + "..." ifv.text.length > 10
                        v.iconclass = v.type
                        items.push(v)
                    desktop[0].set "data", items
                    desktop[0].refresh()

            file.onready()
                .then () -> fn()
                .catch ( e ) -> # try to create the path
                    console.log "#{file.path} not found"
                    name = file.basename
                    file.parent().asFileHandle().mk(name).then (r) ->
                        ex = Ant.OS.API.throwe "OS.VFS"
                        if r.error then Ant.OS.announcer.osfail d.error, ex, d.error else fn()
            
        desktop[0].ready = (e) ->
            e.observable = Ant.OS.announcer
            window.onresize = () ->
                Ant.OS.announcer.trigger "desktopresize"
                e.refresh()

            desktop[0].set "onlistselect", (d) ->
                ($ "#sysdock").get(0).set "selectedApp", null
        
            desktop[0].set "onlistdbclick", ( d ) ->
                ($ "#sysdock").get(0).set "selectedApp", null
                it = desktop[0].get "selectedItem"
                Ant.OS.GUI.openWith it.get("data")

            #($ "#workingenv").on "click", (e) ->
            #     desktop[0].set "selected", -1

            desktop.on "click", (e) ->
                el = $(e.target).parent()
                return unless el.length > 0
                el = el.parent()
                return unless el.length > 0
                return unless el[0] is desktop[0]
                desktop[0].unselect()
                ($ "#sysdock").get(0).set "selectedApp", null
        
            desktop[0].contextmenuHandle = (e, m) ->
                desktop[0].unselect() if e.target.tagName.toUpperCase() is "UL"
                ($ "#sysdock").get(0).set "selectedApp", null
                menu = [
                    { text: __("Open"), dataid: "desktop-open" },
                    { text: __("Refresh"), dataid: "desktop-refresh" }
                ]
                menu = menu.concat ( v for k, v of Ant.OS.setting.desktop.menu)
                m.set "items", menu
                m.set "onmenuselect", (evt) ->
                    item = evt.data.item.get("data")
                    switch item.dataid
                        when "desktop-open"
                            it = desktop[0].get "selectedItem"
                            return Ant.OS.GUI.openWith it.get("data") if it
                            it = Ant.OS.setting.desktop.path.asFileHandle()
                            it.mime = "dir"
                            it.type = "dir"
                            Ant.OS.GUI.openWith it
                        when "desktop-refresh"
                            desktop[0].fetch()
                        else
                            Ant.OS.GUI.launch item.app, item.args if item.app
                m.show(e)
            
            desktop[0].fetch()
            Ant.OS.announcer.observable.on "VFS", (d) ->
                return if  ["read", "publish", "download"].includes d.data.m
                desktop[0].fetch() if d.data.file.hash() is fp.hash() or d.data.file.parent().hash() is fp.hash()
            Ant.OS.announcer.ostrigger "desktoploaded"
        # mount it
        desktop[0].uify()
            
    refreshDesktop: () ->
        ($ Ant.OS.GUI.workspace)[0].fetch()
    
    mkdialog: (conf) ->
        return new Ant.OS.GUI.BasicDialog conf.name, conf.layout
        
    login: () ->
        scheme = $.parseHTML Ant.OS.GUI.schemes.login
        ($ "#wrapper").append scheme
        ($ "#btlogin").click () ->
            data =
                username: ($ "#txtuser").val(),
                password: ($ "#txtpass").val()
            Ant.OS.API.handle.login data
                .then (d) ->
                    return ($ "#login_error").html d.error if d.error
                    Ant.OS.GUI.startAntOS d.result
                .catch (e) ->
                    ($ "#login_error").html "Login: server error"
        ($ "#txtpass").keyup (e) ->
            ($ "#btlogin").click() if e.which is 13
        ($ "#txtuser").keyup (e) ->
            ($ "#btlogin").click() if e.which is 13
    
    startAntOS: (conf) ->
        # clean up things
        Ant.OS.cleanup()
        # get setting from conf
        Ant.OS.systemSetting conf
        #console.log Ant.OS.setting
        # load theme
        Ant.OS.GUI.loadTheme Ant.OS.setting.appearance.theme
        Ant.OS.GUI.wallpaper()
        Ant.OS.announcer.observable.one "syspanelloaded", () ->
            # TODO load packages list then build system menu
            Ant.OS.announcer.observable.on "systemlocalechange", (name) ->
                ($ "#syspanel")[0].update()

            Ant.OS.API.packages.cache().then (ret) ->
                if ret.result
                    Ant.OS.API.packages.fetch().then (r) ->
                        if r.result
                            for k, v of r.result
                                v.text = v.name
                                v.filename = k
                                v.type = "app"
                                v.mime = "antos/app"
                                v.icon = "#{v.path}/#{v.icon}" if v.icon
                                v.iconclass = "fa fa-adn" unless v.iconclass or v.icon
                        Ant.OS.setting.system.packages = if r.result then r.result else
                        # Ant.OS.GUI.refreshSystemMenu()
                        # Ant.OS.GUI.buildSystemMenu()
                        # push startup services
                        # TODO: get services list from user setting
                        Ant.OS.GUI.pushServices (v for v in Ant.OS.setting.system.startup.services)
                        (Ant.OS.GUI.launch a) for a in Ant.OS.setting.system.startup.apps
                #Ant.OS.GUI.launch "DummyApp"
        # initDM
        Ant.OS.API.setLocale Ant.OS.setting.system.locale
            .then () ->
                Ant.OS.GUI.initDM()
    

Ant.OS.GUI.schemes = {}
Ant.OS.GUI.schemes.ws = """
<afx-sys-panel id = "syspanel"></afx-sys-panel>
<div id = "workspace">
    <afx-apps-dock id="sysdock"></afx-apps-dock>
    <afx-float-list id = "desktop" dir="vertical" ></afx-float-list>
</div>
<afx-menu id="contextmenu" data-id="contextmenu" context="true" style="display:none;"></afx-menu>
<afx-label id="systooltip" data-id="systooltip" style="display:none;position:absolute;"></afx-label>
<textarea id="clipboard"></textarea>
"""

Ant.OS.GUI.schemes.login = """
<div id = "login_form">
    <p>Welcome to AntOS, please login</p>
    <input id = "txtuser" type = "text" value = "demo" />
    <input id = "txtpass" type = "password" value = "demo" />
    <button id = "btlogin">Login</button>
    <div id = "login_error"></div>
</div>
"""