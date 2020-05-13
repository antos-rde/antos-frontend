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
class Announcer
    constructor: () ->
        @observable = {}
        @enable = true
    
    disable: () ->
        @off("*")
        @enable = false

    on: (evtName, callback) ->
        return unless @enable
        @observable[evtName] = { one: new Set(), many: new Set() } unless @observable[evtName]
        @observable[evtName].many.add callback

    one: (evtName, callback) ->
        return unless @enable
        @observable[evtName] = { one: new Set(), many: new Set() } unless @observable[evtName]
        @observable[evtName].one.add callback

    off: (evtName, callback) ->
        me = @
        fn = (evt, cb) ->
            return unless me.observable[evt]
            if cb
                me.observable[evt].one.delete(cb)
                me.observable[evt].many.delete(cb)
            else
                delete me.observable[evt] if me.observable[evt]
        if evtName is "*" then fn k, callback for k, v of me.observable else fn evtName, callback
   
    trigger: (evtName, data) ->
        me = @
        trig = (name, d) ->
            names = [name, "*"]
            for evt in names
                continue unless me.observable[evt]
                me.observable[evt].one.forEach (f) ->
                    f d
                me.observable[evt].one = new Set()
                me.observable[evt].many.forEach (f) ->
                    f d
        
        if evtName is "*"
            trig k, data for k, v of me.observable when k isnt "*"
        else
            trig evtName, data

Ant.OS.API.Announcer = Announcer
Ant.OS.announcer =
        observable: new Ant.OS.API.Announcer()
        quota: 0
        listeners: {}
        on: (e, f, a) ->
            Ant.OS.announcer.listeners[a.pid] = [] unless Ant.OS.announcer.listeners[a.pid]
            Ant.OS.announcer.listeners[a.pid].push { e: e, f: f }
            Ant.OS.announcer.observable.on e, f
        trigger: (e, d) -> Ant.OS.announcer.observable.trigger e, d
        osfail: (m, e) ->
            Ant.OS.announcer.ostrigger "fail", { m: m,  e: e }
        oserror: (m, e) ->
            Ant.OS.announcer.ostrigger "error", { m: m,  e: e }
        osinfo: (m) ->
            Ant.OS.announcer.ostrigger "info", { m: m,  e: null }
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