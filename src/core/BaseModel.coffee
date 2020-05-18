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

class BaseModel
    constructor: (@name, @args) ->
        @observable = new Announcer()
        @_api = Ant.OS.API
        @_gui = Ant.OS.GUI
        @systemsetting = Ant.OS.setting
        @on "exit", () => @quit()
        @host = @_gui.workspace
        @dialog = undefined
    render: (p) ->
        Ant.OS.GUI.loadScheme p, @, @host

    quit: (force) ->
        evt = new Ant.OS.GUI.BaseEvent("exit", force)
        @onexit(evt)
        if not evt.prevent
            @observable.off "*"
            delete @.observable
            @dialog.quit() if @dialog
            Ant.OS.PM.kill @

    path: () ->
        mt = @meta()
        return mt.path if mt and mt.path
        return null
    
    # call a server side script
    call: (cmd, func) ->
        @_api.apigateway cmd, false, func
    
    # get a stream
    stream: () ->
        return @_api.apigateway null, true, null

    init: ->
        #implement by sub class
    onexit: (e) ->
        #implement by subclass
   
    one: (e, f) -> @observable.one e, f
    on: (e, f) -> @observable.on e, f
    off: (e, f) ->
        return @observable.off e unless f
        @observable.off e, f
    trigger: (e, d) -> @observable.trigger e, d

    subscribe: (e, f) ->
        Ant.OS.announcer.on e, f, @

    openDialog: (d, data) ->
        new Promise (resolve, reject) =>
            if @dialog
                @dialog.show()
                return
            if typeof d is "string"
                if not Ant.OS.GUI.subwindows[d]
                    @error __("Dialog {0} not found", d)
                    return
                @dialog = new Ant.OS.GUI.subwindows[d]()
            else
                @dialog = d
            #@dialog.observable = riot.observable() unless @dialog
            @dialog.parent = @
            @dialog.handle = resolve
            @dialog.reject = reject
            @dialog.pid = @pid
            @dialog.data = data
            @dialog.title = data.title if data and data.title
            @dialog.init()

    ask: (t, m, f) ->
        @._gui.openDialog "YesNoDialog", (d) ->
            f() if d
        , t, { text: m }
    
    publish: (t, m, e) ->
        mt = @meta()
        icon = undefined
        icon = "#{mt.path}/#{mt.icon}" if mt.icon
        Ant.OS.announcer.trigger t, {
            id: @pid,
            name: @name,
            data: {
                m: m,
                icon: icon,
                iconclass: mt.iconclass,
                e: e
            }
        }

    notify: (m) ->
        @publish "notification", m

    warn: (m) ->
        @publish "warning", m

    error: (m, e) ->
        @publish "error", m, if e then e else (@_api.throwe @name)
        
    fail: (m) ->
        @publish "fail", m

    throwe: () ->
        @_api.throwe @name
    
    update: () ->
        @scheme.update() if @scheme
        
    find: (id) -> ($ "[data-id='#{id}']", @scheme)[0] if @scheme
    
    select: (sel) -> $ sel, @scheme if @scheme
this.OS.GUI.BaseModel = BaseModel