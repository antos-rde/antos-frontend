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
        if (not Ant.OS.setting.applications[@name]) or (Array.isArray OS.setting.applications[@name])
            Ant.OS.setting.applications[@name] = {}
        @setting = Ant.OS.setting.applications[@name]
        @keycomb =
            ALT: {}
            CTRL: {}
            SHIFT: {}
            META: {}
    init: ->
        @off "*"
        @on "exit", () => @quit()
        # first register some base event to the app
        @on "focus", () =>
            @sysdock.set "selectedApp", @
            @appmenu.pid = @pid
            @appmenu.set "items", (@baseMenu() || [])
            @appmenu.set "onmenuselect", (d) =>
                @trigger("menuselect", d)
            @dialog.show() if @dialog
        @on "hide", () =>
            @sysdock.set "selectedApp", null
            @appmenu.set "items", []
            @dialog.hide() if @dialog
        @on "menuselect", (d) =>
            switch d.data.item.get("data").dataid
                when "#{@name}-about" then @openDialog "AboutDialog"
                when  "#{@name}-exit" then @trigger "exit"
        @on "apptitlechange", () => @sysdock.update()
        @updateLocale @systemsetting.system.locale
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

    updateLocale: (name) ->
        meta = @meta()
        return unless meta and meta.locales
        return unless meta.locales[name]
        for k, v of meta.locales[name]
            @_api.lang[k] = v

    shortcut: (fnk, c, e) ->
        return true unless @keycomb[fnk]
        return true unless @keycomb[fnk][c]
        @keycomb[fnk][c](e)
        return false
    
    applySetting: (k) ->
    applyAllSetting: () ->
         @applySetting k for k, v of @setting
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
    meta: () -> Ant.OS.APP[@name].meta
    baseMenu: ->
        mn =
            [{
                text: Ant.OS.APP[@name].meta.name,
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
    open: () ->
        #implement by subclasses
    data: ->
        #implement by subclasses
        # to return app data
    
    cleanup: (e) ->
        #implement by subclasses
        # to handle the exit event
        # use e.preventDefault() to
        # discard the quit command
BaseApplication.type = 1
this.OS.GUI.BaseApplication = BaseApplication