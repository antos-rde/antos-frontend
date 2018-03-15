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

class AppearanceHandler extends SettingHandler
    constructor:(scheme, parent) ->
        super(scheme, parent)
        me = @
        @wplist = @find "wplist"
        @wpreview = @find "wp-preview"
        @wpsize = @find "wpsize"
        @wprepeat = @find "wprepeat"
        @themelist = @find "theme-list"
        @syswp = undefined
        @wplist.set "onlistselect", (e) ->
            $(me.wpreview).css("background-image", "url(#{me.parent._api.handler.get}/#{e.data.path})" )
            .css("background-size", "cover")
            me.parent.systemsetting.appearance.wp.url = e.data.path
            me.parent._gui.wallpaper()

        @wplist.set "buttons", [
            { 
                text: "+", onbtclick: (e) ->
                    me.parent.openDialog "FileDiaLog", (d, n, p) ->
                        me.parent.systemsetting.appearance.wps.push p
                        me.render()
                    , __("Select image file"), { mimes: ["image/.*"] }
            }
        ]
        
        @wpsize.set "onlistselect", (e) ->
            me.parent.systemsetting.appearance.wp.size = e.data.text
            me.parent._gui.wallpaper()

        sizes = [
            { text: "cover", selected: me.parent.systemsetting.appearance.wp.size is "cover" },
            { text: "auto", selected: me.parent.systemsetting.appearance.wp.size is "auto" },
            { text: "contain", selected: me.parent.systemsetting.appearance.wp.size is "contain" }
        ]
        @wpsize.set "items", sizes
        

        repeats = [
            { text: "repeat", selected: me.parent.systemsetting.appearance.wp.repeat is "repeat" },
            { text: "repeat-x", selected: me.parent.systemsetting.appearance.wp.repeat is "repeat-x" },
            { text: "repeat-y", selected: me.parent.systemsetting.appearance.wp.repeat is "repeat-y" },
            { text: "no-repeat", selected: me.parent.systemsetting.appearance.wp.repeat is "no-repeat" }
        ]
        @wprepeat.set "items", repeats
        @wprepeat.set "onlistselect", (e) ->
            me.parent.systemsetting.appearance.wp.repeat = e.data.text
            me.parent._gui.wallpaper()

        @themelist.set "items" , [{ text: "antos", selected: true }]
        
    render: () ->
        me = @
        if not @syswp
            path = "os://resources/themes/system/wp"
            path.asFileHandler().read (d) ->
                me.parent.error __("Cannot read wallpaper list from {0}", path) if d.error
                for v in d.result
                    v.text = v.filename
                    v.selected = true if v.path is me.parent.systemsetting.appearance.wp.url
                    v.iconclass = "fa fa-file-image-o"
                me.syswp = d.result
                me.wplist.set "items", me.getwplist()
        else
            
            me.wplist.set "items", me.getwplist()
    
    getwplist: () ->
        list = []
        for v in @parent.systemsetting.appearance.wps
            file = v.asFileHandler()
            list.push
                text: file.basename,
                path: file.path
                selected: file.path is @parent.systemsetting.appearance.wp.url,
                iconclass: "fa fa-file-image-o"
        list = list.concat @syswp
        return list