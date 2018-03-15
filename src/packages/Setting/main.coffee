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

class SettingHandler
    constructor:(@scheme, @parent) ->

    find: (id) -> ($ "[data-id='#{id}']", @scheme)[0] if @scheme

    render: () ->



class Setting extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "Setting", args
    
    main: () ->
        me = @
        @container = @find "container"
        @container.setTabs [ 
            {
                text: "__(Appearance)",
                iconclass: "fa fa-paint-brush",
                url: "#{@path()}/schemes/appearance.html",
                handler: (sch) ->
                    new AppearanceHandler sch, me
            },
            {
                text: "__(VFS)",
                iconclass: "fa fa-inbox" ,
                url: "#{@path()}/schemes/vfs.html" ,
                handler: (sch) ->
                    new VFSHandler sch, me
            },
            {
                text: "__(Languages)",
                iconclass: "fa fa-globe",
                url: "#{@path()}/schemes/locale.html",
                handler: (sch) ->
                    new LocaleHandler sch, me
            },
            {
                text: "__(Startup)",
                iconclass: "fa fa-cog",
                url: "#{@path()}/schemes/startup.html",
                handler: (sch) ->
                    new StartupHandler sch,me
            }
        ]
        (@find "btnsave").set "onbtclick", (e) ->
            me._api.setting  (d) ->
                return me.error __("Cannot save system setting: {0}", d.error) if d.error
                me.notify __("System setting saved")
Setting.singleton = true
this.OS.register "Setting", Setting