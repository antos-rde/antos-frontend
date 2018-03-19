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
        me = @
        @observable = riot.observable()
        @_api = self.OS.API
        @_gui = self.OS.GUI
        @systemsetting = self.OS.setting
        me = @
        @on "exit", () -> me.quit()
        @host = "#desktop"
        @dialog = undefined
        @subscribe "systemlocalechange", (name) ->
            me.scheme.update() if me.scheme
    render: (p) ->
        _GUI.loadScheme p, @, @host

    quit: () ->
        evt = new _GUI.BaseEvent("exit")
        @onexit(evt)
        if not evt.prevent
            delete @.observable
            @dialog.quit() if @dialog
            _PM.kill @

    path: () ->
        mt = @meta()
        return mt.path if mt and mt.path
        return null
        
    init: ->
        #implement by sub class
    onexit: (e) ->
        #implement by subclass
   
    one: (e, f) -> @observable.one e, f
    on: (e, f) -> @observable.on e, f

    trigger: (e, d) -> @observable.trigger e, d

    subscribe: (e, f) ->
        _courrier.on e, f, @

    openDialog: (d, f, title, data) ->
        if @dialog
            @dialog.show()
            return
        if typeof d is "string"
            if not _GUI.subwindows[d]
                @error __("Dialog {0} not found", d)
                return
            @dialog = new _GUI.subwindows[d]()
        else
            @dialog = d
        #@dialog.observable = riot.observable() unless @dialog
        @dialog.parent = @
        @dialog.handler = f
        @dialog.pid = @pid
        @dialog.data = data
        @dialog.title = title
        @dialog.init()

    ask: (t, m, f) ->
        @._gui.openDialog "YesNoDialog", (d) ->
            f() if d
        , t, { text: m }
    
    publish: (t, m, e) ->
        mt = @meta()
        _courrier.trigger t, { id: @pid, name: @name, data: { m: m, icon: mt.icon, iconclass: mt.iconclass }, error: e }

    notify: (m) ->
        @publish "notification", m

    warn: (m) ->
        @publish "warning", m

    error: (m) ->
        @publish "error", m, (@_api.throwe @name)
        
    fail: (m) ->
        @publish "fail", m

    throwe: () ->
        @_api.throwe @name
    
    find: (id) -> ($ "[data-id='#{id}']", @scheme)[0] if @scheme
    
    select: (sel) -> $ sel, @scheme if @scheme
this.OS.GUI.BaseModel = BaseModel