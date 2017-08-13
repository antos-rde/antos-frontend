self.OS.PM =
    pidalloc:0
    processes: new Object
    createProcess: (app,cls) ->
        #if it is single ton
        # and a process is existing
        # just return it
        if cls.singleton and _PM.processes[app] and _PM.processes[app].length == 1
            _PM.processes[app][0].show()
            return _PM.processes[app][0]
        else
            _PM.processes[app] = [] if not _PM.processes[app] 
            obj = new cls
            obj.birth = (new Date).getTime()
            _PM.pidalloc++
            obj.pid = _PM.pidalloc
            _PM.processes[app].push obj
            _GUI.dock obj,cls.meta
    appByPid:(pid)->
        app = undefined
        find = (l) ->
            return a for a in l when a.pid is pid
        for k,v of _PM.processes
            app = find v
            break if app
        app           
        
    kill: (app) ->
        return if not _PM.processes[app.name]

        i = _PM.processes[app.name].indexOf app
        if i >= 0
            _GUI.undock _PM.processes[app.name][i]
            delete _PM.processes[app.name][i]
            _PM.processes[app.name].splice i,1
