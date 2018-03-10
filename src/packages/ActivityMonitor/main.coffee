_PM = this.OS.PM
_APP = this.OS.APP
class ActivityMonitor extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "ActivityMonitor", args
    main: () ->
        me = @
        @scheme.set "apptitle", "Activity Monitor"
        @grid = @find "mygrid"
        @on "btclick", (e)->
            return unless e.id == "btkill"
            item = me.grid.get "selected"
            return unless item
            app = _PM.appByPid item[0].value
            app.quit() if app

        header = [{width:50,value: "__(Pid)"},{value:"__(Name)"}, {value:"__(Type)", width:80},{width:75,value: "__(Alive (ms))"}]
        @gdata = 
            processes:{}
            alive:[]
        @grid.set "header",header
        @monitor()
    
    monitor: () ->
        me = @
        #get all current running process
        me.gdata.alive = []
        now = (new Date).getTime()
        $.each _PM.processes, (i,d)->
            $.each d , (j,a)->
                if me.gdata.processes[a.pid] #update it
                    me.gdata.processes[a.pid][3].value = now - a.birth
                else #add it
                    me.gdata.processes[a.pid] = [
                        {value:a.pid},
                        {icon:if _APP[a.name].type == 1 then _APP[a.name].meta.icon else a.icon,
                        iconclass:if _APP[a.name].type == 1 then _APP[a.name].meta.iconclass else a.iconclass,
                        value:a.name},
                        {value: if _APP[a.name].type == 1 then "__(Application)" else "__(Service)"}
                        {value: now - a.birth}
                    ]
                me.gdata.alive.push a.pid
        @refreshGrid()
        @timer = setTimeout (()-> me.monitor()),500#one second
    
    refreshGrid: ()->
        activeList = []
        me = @
        $.each @gdata.processes, (i,e) ->
            if ($.inArray (Number i),me.gdata.alive) >= 0
                activeList.push e
            else 
                me.gdata.processes[i] = undefined
        @grid.set "rows",activeList
    cleanup: (e) ->
        clearTimeout @timer if @timer

ActivityMonitor.singleton = true
this.OS.register "ActivityMonitor",ActivityMonitor