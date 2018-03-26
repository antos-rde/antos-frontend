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
class BaseApplication extends this.OS.GUI.BaseModel
    constructor: (name, args) ->
        super name, args
        _OS.setting.applications[@name] = {} if not _OS.setting.applications[@name]
        @setting = _OS.setting.applications[@name]
        @keycomb =
            ALT: {}
            CTRL: {}
            SHIFT: {}
            META: {}
        me = @
        @subscribe "appregistry", ( m ) ->
            me.applySetting m.data.m if (m.name is me.name)
    init: ->
        me = @
        @off "*"
        @on "exit", () -> me.quit()
        # first register some base event to the app
        @on "focus", () ->
            me.sysdock.update()
            me.sysdock.set "selectedApp", me
            me.appmenu.pid = me.pid
            me.appmenu.set "items", (me.baseMenu() || [])
            me.appmenu.set "onmenuselect", (d) ->
                me.trigger("menuselect", d)
            me.dialog.show() if me.dialog
        @on "hide", () ->
            me.sysdock.set "selectedApp", null
            me.appmenu.set "items", []
            me.dialog.hide() if me.dialog
        @on "menuselect", (d) ->
            switch d.e.item.data.dataid
                when "#{me.name}-about" then me.openDialog "AboutDialog", ()->
                when  "#{me.name}-exit" then me.trigger "exit"
        @on "apptitlechange", () -> me.sysdock.update()
        @loadScheme()

    loadScheme: () ->
        #now load the scheme
        path = "#{@meta().path}/scheme.html"
        @.render path

    bindKey: (k, f) ->
        arr = k.split "-"
        return unless arr.length is 2
        fnk = arr[0].toUpperCase()
        c = arr[1].toUpperCase()
        return unless @keycomb[fnk]
        @keycomb[fnk][c] = f

    shortcut: (fnk, c, e) ->
        return true unless @keycomb[fnk]
        return true unless @keycomb[fnk][c]
        @keycomb[fnk][c](e)
        return false
    
    applySetting: (k) ->
    registry: (k, v) ->
        @setting[k] = v
        @publish "appregistry", k

    show: () ->
        @trigger "focus"
    
    blur: () ->
        @.appmenu.set "items", [] if @.appmenu and @.pid == @.appmenu.pid
        @trigger "blur"
    
    hide: () ->
        @trigger "hide"
    
    toggle: () ->
        @trigger "toggle"

    title: () ->
        @scheme.get "apptitle"
        
    onexit: (evt) ->
        @cleanup(evt)
        if not evt.prevent
            @.appmenu.set "items", [] if @.pid == @.appmenu.pid
            ($ @scheme).remove()
    meta: () -> _OS.APP[@name].meta
    baseMenu: ->
        mn =
            [{
                text: _OS.APP[@name].meta.name,
                child: [
                    { text: "__(About)", dataid: "#{@name}-about" },
                    { text: "__(Exit)", dataid: "#{@name}-exit" }
                ]
            }]
        mn = mn.concat @menu() || []
        mn
            
    main: ->
        #main program
        # implement by subclasses
    menu: ->
        # implement by subclasses
        # to add menu to application
        []
    open:->
        #implement by subclasses
    data:->
        #implement by subclasses
        # to return app data
    update:->
        #implement by subclasses
    cleanup: (e) ->
        #implement by subclasses
        # to handle the exit event
        # use e.preventDefault() to
        # discard the quit command
BaseApplication.type = 1
this.OS.GUI.BaseApplication = BaseApplication