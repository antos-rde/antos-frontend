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
Ant = this
Ant.OS or=

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
    announcer:
        observable: riot.observable()
        quota: 0
        listeners: {}
        on: (e, f, a) ->
            Ant.OS.announcer.listeners[a.pid] = [] unless Ant.OS.announcer.listeners[a.pid]
            Ant.OS.announcer.listeners[a.pid].push { e: e, f: f }
            Ant.OS.announcer.observable.on e, f
        trigger: (e, d) -> Ant.OS.announcer.observable.trigger e, d
        osfail: (m, e, s) ->
            Ant.OS.announcer.ostrigger "fail", { m: m,  e: e, s: s }
        oserror: (m, e, s) ->
            Ant.OS.announcer.ostrigger "error", { m: m,  e: e, s: s }
        osinfo: (m) ->
            Ant.OS.announcer.ostrigger "info", { m: m,  e: null, s: null }
        ostrigger: (e, d) ->
            Ant.OS.announcer.trigger e, { id: 0, data: d, name: "OS" }
        unregister: (app) ->
            return unless Ant.OS.announcer.listeners[app.pid] and Ant.OS.announcer.listeners[app.pid].length > 0
            Ant.OS.announcer.observable.off i.e, i.f for i in Ant.OS.announcer.listeners[app.pid]
            delete Ant.OS.announcer.listeners[app.pid]
            # Ant.OS.announcer.listeners[app.pid]
        getMID: () ->
            Ant.OS.announcer.quota += 1
            Ant.OS.announcer.quota
    register: (name, x) ->
        if x.type is 3 then Ant.OS.GUI.subwindows[name] = x else Ant.OS.APP[name] = x
    
    PM:
        pidalloc: 0
        processes: {}
        createProcess: (app, cls, args) ->
            f = () ->
                #if it is single ton
                # and a process is existing
                # just return it
                if cls.singleton and Ant.OS.PM.processes[app] and Ant.OS.PM.processes[app].length == 1
                    Ant.OS.PM.processes[app][0].show()
                else
                    Ant.OS.PM.processes[app] = [] if not Ant.OS.PM.processes[app]
                    obj = new cls(args)
                    obj.birth = (new Date).getTime()
                    Ant.OS.PM.pidalloc++
                    obj.pid = Ant.OS.PM.pidalloc
                    Ant.OS.PM.processes[app].push obj
                    if cls.type is 1 then Ant.OS.GUI.dock obj, cls.meta else Ant.OS.GUI.attachservice obj
                if cls.type is 2
                    Ant.OS.announcer.trigger "srvroutineready", app
            if cls.dependencies
                libs = (v for v in cls.dependencies)
                Ant.OS.API.requires libs, f
            else
                f()
        appByPid: (pid) ->
            app = undefined
            find = (l) ->
                return a for a in l when a.pid is pid
            for k, v of Ant.OS.PM.processes
                app = find v
                break if app
            app
            
        kill: (app) ->
            return if not app.name or not Ant.OS.PM.processes[app.name]

            i = Ant.OS.PM.processes[app.name].indexOf app
            if i >= 0
                if Ant.OS.APP[app.name].type == 1 then Ant.OS.GUI.undock app else Ant.OS.GUI.detachservice app
                Ant.OS.announcer.unregister app
                delete Ant.OS.PM.processes[app.name][i]
                Ant.OS.PM.processes[app.name].splice i, 1
        
        killAll: (app, force) ->
            return unless Ant.OS.PM.processes[app]
            a.quit(force) for a in  Ant.OS.PM.processes[app]

    cleanup: ->
        console.log "Clean up system"
        Ant.OS.PM.killAll a, true for a, v of Ant.OS.PM.processes
        Ant.OS.announcer.observable.off("*") if Ant.OS.announcer.observable
        $(window).off('keydown')
        ($ "#workspace").off("mouseover")
        delete Ant.OS.announcer.observable
        ($ "#wrapper").empty()
        Ant.OS.GUI.clearTheme()
        Ant.OS.announcer.observable = riot.observable()
        Ant.OS.announcer.quota = 0
        Ant.OS.APP = {}
        Ant.OS.setting =
            user: {}
            applications: {}
            desktop: {}
            appearance: {}
            VFS: {}
            system: {}
        Ant.OS.PM.processes = {}
        Ant.OS.PM.pidalloc = 0
        
    boot: ->
        #first login
        console.log "Booting sytem"
        Ant.OS.API.handle.auth (d) ->
            # in case someone call it more than once :)
            if d.error
                # show login screen
                Ant.OS.GUI.login()
            else
                # startX :)
                Ant.OS.GUI.startAntOS d.result
    
    cleanupHandles: {}
    exit: ->
        #do clean up first
        f() for n, f of Ant.OS.cleanupHandles
        Ant.OS.API.handle.setting (r) ->
            Ant.OS.cleanup()
            Ant.OS.API.handle.logout()
    onexit: (n, f) ->
        Ant.OS.cleanupHandles[n] = f unless Ant.OS.cleanupHandles[n]