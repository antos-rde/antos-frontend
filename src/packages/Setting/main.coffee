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

class SettingHandle
    constructor: (@scheme, @parent) ->

    find: (id) -> ($ "[data-id='#{id}']", @scheme)[0] if @scheme

    render: () ->

class Setting extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "Setting", args
    
    main: () ->
        me = @
        @container = @find "container"

        new AppearanceHandle @find("appearance"), @
        new VFSHandle @find("vfs"), @
        new LocaleHandle @find("locale"), @
        new StartupHandle @find("startup"), @

        (@find "btnsave").set "onbtclick", (e) ->
            me._api.setting()
                .then (d) ->
                    return me.error __("Cannot save system setting: {0}", d.error) if d.error
                    me.notify __("System setting saved")
                .catch (e) ->
                    me.error __("Cannot save system setting: {0}", e.stack)
Setting.singleton = true
this.OS.register "Setting", Setting