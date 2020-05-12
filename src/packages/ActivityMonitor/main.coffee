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
_PM = this.OS.PM
_APP = this.OS.APP
class ActivityMonitor extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "ActivityMonitor", args
    main: () ->
        me = @
        @scheme.set "apptitle", "Activity Monitor"
        @grid = @find "mygrid"
        @on "btclick", (e) ->
            return unless e.id == "btkill"
            item = me.grid.get "selectedRow"
            return unless item
            data = item.get("data")[0]
            app = _PM.appByPid data.text
            app.quit(true) if app

        header = [
            {
                width: 50,
                text: "__(Pid)"
            },
            {
                text: "__(Name)"
            },
            {
                text: "__(Type)",
                width: 80
            },
            {
                width: 80,
                text: "__(Alive (ms))"
            }
        ]
        @gdata = {
            processes: {}
            alive: []
        }
        @grid.set "header", header
        @monitor()
    
    monitor: () ->
        me = @
        #get all current running process
        me.gdata.alive = []
        now = (new Date).getTime()
        $.each _PM.processes, (i, d) ->
            $.each d , (j, a) ->
                if me.gdata.processes[a.pid] #update it
                    me.gdata.processes[a.pid][3].text = now - a.birth
                    me.gdata.processes[a.pid][3].domel.update()
                else #add it
                    me.gdata.processes[a.pid] = [
                        { text: a.pid },
                        {
                            icon: if _APP[a.name].type == 1 then _APP[a.name].meta.icon else a.icon,
                            iconclass: if _APP[a.name].type == 1 then _APP[a.name].meta.iconclass else a.iconclass,
                            text: a.name
                        },
                        {
                            text: if _APP[a.name].type == 1 then "__(Application)" else "__(Service)"
                        },
                        {
                            text: now - a.birth
                        }
                    ]
                    me.grid.push me.gdata.processes[a.pid]
                me.gdata.alive.push a.pid
        
        $.each @gdata.processes, (i, e) ->
            if ($.inArray (Number i), me.gdata.alive) < 0
                me.grid.remove me.gdata.processes[i].domel
                me.gdata.processes[i] = undefined
                delete me.gdata.processes[i]

        @timer = setTimeout (() -> me.monitor()), 500

    cleanup: (e) ->
        clearTimeout @timer if @timer

ActivityMonitor.singleton = true
this.OS.register "ActivityMonitor", ActivityMonitor