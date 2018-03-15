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

class LocaleHandler extends SettingHandler
    constructor:(scheme, parent) ->
        super(scheme, parent)
        me = @
        @lglist = @find "lglist"
        @localelist = undefined
        @lglist.set "onlistselect", (e) ->
            me.parent._api.setLocale e.data.text
    render: () ->
        me = @
        if not @localelist
            path = "os://resources/languages"
            path.asFileHandler().read (d) ->
                return me.parent.error __("Cannot fetch system locales: {0}", d.error) if d.derror
                for v in d.result
                    v.text = v.filename.replace /\.json$/g, ""
                    v.selected = v.text is me.parent.systemsetting.system.locale
                me.localelist = d.result
                me.lglist.set "items", me.localelist
        else
            me.lglist.set "items", me.localelist
