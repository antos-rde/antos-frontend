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

'use strict'
#define the OS object
self = this
self.OS or=

    API: {}
    GUI: {}
    APP: {}
    setting:
        user: {}
        applications: {}
        desktop: {}
        appearance: {}
        VFS: {}
        system: {}
    courrier:
        observable: riot.observable()
        quota: 0
        listeners: {}
        on: (e, f, a) ->
            _courrier.listeners[a.pid] = [] unless _courrier.listeners[a.pid]
            _courrier.listeners[a.pid].push { e: e, f: f }
            _courrier.observable.on e, f
        trigger: (e, d) -> _courrier.observable.trigger e, d
        osfail: (m, e, s) ->
            _courrier.ostrigger "fail", { m: m,  e: e, s: s }
        oserror: (m, e, s) ->
            _courrier.ostrigger "error", { m: m,  e: e, s: s }
        osinfo: (m) ->
            _courrier.ostrigger "info", { m: m,  e: null, s: null }
        ostrigger: (e, d) ->
            _courrier.trigger e, { id: 0, data: d, name: "OS" }
        unregister: (app) ->
            return unless _courrier.listeners[app.pid] and _courrier.listeners[app.pid].length > 0
            _courrier.observable.off i.e, i.f for i in _courrier.listeners[app.pid]
            delete _courrier.listeners[app.pid]
            _courrier.listeners[app.pid] = []
        getMID: () ->
            _courrier.quota += 1
            _courrier.quota
    register: (name, x) ->
        if x.type is 3 then self.OS.GUI.subwindows[name] = x else _OS.APP[name] = x
    
    PM:
        pidalloc: 0
        processes: {}
        createProcess: (app, cls, args) ->
            f = () ->
                #if it is single ton
                # and a process is existing
                # just return it
                if cls.singleton and _PM.processes[app] and _PM.processes[app].length == 1
                    _PM.processes[app][0].show()
                else
                    _PM.processes[app] = [] if not _PM.processes[app]
                    obj = new cls(args)
                    obj.birth = (new Date).getTime()
                    _PM.pidalloc++
                    obj.pid = _PM.pidalloc
                    _PM.processes[app].push obj
                    if cls.type is 1 then _GUI.dock obj, cls.meta else _GUI.attachservice obj
                if cls.type is 2
                    _courrier.trigger "srvroutineready", app
            if cls.dependencies
                libs = (v for v in cls.dependencies)
                _API.requires libs, f
            else
                f()
        appByPid: (pid) ->
            app = undefined
            find = (l) ->
                return a for a in l when a.pid is pid
            for k, v of _PM.processes
                app = find v
                break if app
            app
            
        kill: (app) ->
            return if not app.name or not _PM.processes[app.name]

            i = _PM.processes[app.name].indexOf app
            if i >= 0
                if _OS.APP[app.name].type == 1 then _GUI.undock app else _GUI.detachservice app
                _courrier.unregister app
                delete _PM.processes[app.name][i]
                _PM.processes[app.name].splice i, 1
        
        killAll: (app, force) ->
            return unless _PM.processes[app]
            a.quit(force) for a in  _PM.processes[app]

    cleanup: ->
        console.log "Clean up system"
        _PM.killAll a, true for a, v of _PM.processes
        _courrier.observable.off("*") if _courrier.observable
        $(window).off('keydown')
        delete _courrier.observable
        ($ "#wrapper").empty()
        _GUI.clearTheme()
        _courrier.observable = riot.observable()
        _courrier.quota = 0
        _OS.APP = {}
        _OS.setting =
            user: {}
            applications: {}
            desktop: {}
            appearance: {}
            VFS: {}
            system: {}
        _PM.processes = {}
        _PM.pidalloc = 0
        
    boot: ->
        #first login
        console.log "Booting sytem"
        _API.handler.auth (d) ->
            # in case someone call it more than once :)
            if d.error
                # show login screen
                _GUI.login()
            else
                # startX :)
                _GUI.startAntOS d.result
    
    cleanupHandlers: {}
    exit: ->
        #do clean up first
        f() for n, f of _OS.cleanupHandlers
        _API.handler.setting (r) ->
            _OS.cleanup()
            _API.handler.logout()
    onexit: (n, f) ->
        self.OS.cleanupHandlers[n] = f unless self.OS.cleanupHandlers[n]