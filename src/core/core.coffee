#define the OS object
self = this
self.OS or=

    API: new Object()
    GUI: new Object()
    APP: new Object()

    courrier:
        observable: riot.observable()
        quota: 0
        listeners: new Object
        on: (e, f, a) ->
            _courrier.listeners[a.pid] = [] unless _courrier.listeners[a.pid]
            _courrier.listeners[a.pid].push { e: e, f: f }
            _courrier.observable.on e, f
        trigger: (e, d) -> _courrier.observable.trigger e, d
        unregister: (app) ->
            return unless _courrier.listeners[app.pid] and _courrier.listeners[app.pid].length > 0
            _courrier.observable.off i.e, i.f for i in _courrier.listeners[app.pid]
            delete _courrier.listeners[app.pid]
            _courrier.listeners[app.pid] = []
        getMID: () -> 
            _courrier.quota += 1
            _courrier.quota
    register: (name, x) ->
        if x.type is 3 then self.OS.GUI.dialog[name] = x else _APP[name] = x
    
    PM:
        pidalloc: 0
        processes: new Object
        createProcess: (app, cls) ->
            #if it is single ton
            # and a process is existing
            # just return it
            if cls.singleton and _PM.processes[app] and _PM.processes[app].length == 1
                _PM.processes[app][0].show()
            else
                _PM.processes[app] = [] if not _PM.processes[app]
                obj = new cls
                obj.birth = (new Date).getTime()
                _PM.pidalloc++
                obj.pid = _PM.pidalloc
                _PM.processes[app].push obj
                if cls.type is 1 then _GUI.dock obj, cls.meta else _GUI.attachservice obj
            if cls.type is 2
                _courrier.trigger "srvroutineready", app
        appByPid: (pid) ->
            app = undefined
            find = (l) ->
                return a for a in l when a.pid is pid
            for k, v of _PM.processes
                app = find v
                break if app
            app
            
        kill: (app) ->
            return if not _PM.processes[app.name]

            i = _PM.processes[app.name].indexOf app
            if i >= 0
                if _APP[app.name].type == 1 then _GUI.undock app else _GUI.detachservice app
                _courrier.unregister app
                delete _PM.processes[app.name][i]
                _PM.processes[app.name].splice i, 1

    boot: ->
        #first load the configuration
        #then load the theme
        _GUI = self.OS.GUI
        _GUI.loadTheme "antos"
        _GUI.initDM()
        _courrier.observable.one "syspanelloaded", () ->
             _GUI.pushServices ["PushNotification", "Spotlight", "Calendar"]