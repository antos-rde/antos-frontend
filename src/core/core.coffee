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
    register: (name, x) ->
        if x.type is 3 then Ant.OS.GUI.subwindows[name] = x else Ant.OS.APP[name] = x
        
    # import proprety from an App
    

    PM:
        pidalloc: 0
        processes: {}
        createProcess: (app, cls, args) ->
            new Promise (resolve, reject) ->
                f = () ->
                    #if it is single ton
                    # and a process is existing
                    # just return it
                    if cls.singleton and Ant.OS.PM.processes[app] and Ant.OS.PM.processes[app].length == 1
                        obj = Ant.OS.PM.processes[app][0]
                        obj.show()
                    else
                        Ant.OS.PM.processes[app] = [] if not Ant.OS.PM.processes[app]
                        obj = new cls(args)
                        obj.birth = (new Date).getTime()
                        Ant.OS.PM.pidalloc++
                        obj.pid = Ant.OS.PM.pidalloc
                        Ant.OS.PM.processes[app].push obj
                        if cls.type is 1 then Ant.OS.GUI.dock obj, cls.meta else Ant.OS.GUI.attachservice obj
                    obj
                if cls.dependencies
                    libs = (v for v in cls.dependencies)
                    Ant.OS.API.require libs
                        .then () ->
                            resolve f()
                        .catch (e) ->
                            reject e
                else
                    resolve f()
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
        Ant.OS.announcer.observable = new Ant.OS.API.Announcer()
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
        Ant.OS.API.handle.auth()
            .then (d) ->
                # in case someone call it more than once :)
                if d.error
                    # show login screen
                    Ant.OS.GUI.login()
                else
                    # startX :)
                    Ant.OS.GUI.startAntOS d.result
            .catch (e) ->
                console.error e
    
    cleanupHandles: {}

    exit: ->
        #do clean up first
        f() for n, f of Ant.OS.cleanupHandles
        Ant.OS.API.handle.setting()
            .then (r) ->
                Ant.OS.cleanup()
                Ant.OS.API.handle.logout()
                    .then (d) -> Ant.OS.boot()
            .catch (e) ->
                console.error e

    onexit: (n, f) ->
        Ant.OS.cleanupHandles[n] = f unless Ant.OS.cleanupHandles[n]