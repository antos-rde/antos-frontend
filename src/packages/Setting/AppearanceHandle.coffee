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

class AppearanceHandle extends SettingHandle
    constructor:(scheme, parent) ->
        super(scheme, parent)
        @wplist = @find "wplist"
        @wpreview = @find "wp-preview"
        @wpsize = @find "wpsize"
        @wprepeat = @find "wprepeat"
        @themelist = @find "theme-list"
        @syswp = undefined
        @wplist.set "onlistselect", (e) =>
            data = e.data.item.get("data")
            $(@wpreview)
                .css("background-image", "url(#{data.path.asFileHandle().getlink()})" )
                .css("background-size", "cover")
            @parent.systemsetting.appearance.wp.url = data.path
            @parent._gui.wallpaper()

        @wplist.set "buttons", [
            {
                text: "+", onbtclick: (e) =>
                    @parent.openDialog("FileDialog", {
                        title: __("Select image file"),
                        mimes: ["image/.*"]
                    }).then (d) =>
                        @parent.systemsetting.appearance.wps.push d.file.path
                        @wplist.set "data", @getwplist()
            }
        ]
        
        @wpsize.set "onlistselect", (e) =>
            @parent.systemsetting.appearance.wp.size = e.data.item.get("data").text
            @parent._gui.wallpaper()

        sizes = [
            { text: "cover", selected: @parent.systemsetting.appearance.wp.size is "cover" },
            { text: "auto", selected: @parent.systemsetting.appearance.wp.size is "auto" },
            { text: "contain", selected: @parent.systemsetting.appearance.wp.size is "contain" }
        ]
        @wpsize.set "data", sizes
        
        repeats = [
            { text: "repeat", selected: @parent.systemsetting.appearance.wp.repeat is "repeat" },
            { text: "repeat-x", selected: @parent.systemsetting.appearance.wp.repeat is "repeat-x" },
            { text: "repeat-y", selected: @parent.systemsetting.appearance.wp.repeat is "repeat-y" },
            { text: "no-repeat", selected: @parent.systemsetting.appearance.wp.repeat is "no-repeat" }
        ]
        @wprepeat.set "onlistselect", (e) =>
            @parent.systemsetting.appearance.wp.repeat = e.data.item.get("data").text
            @parent._gui.wallpaper()
        @wprepeat.set "data", repeats
        currtheme = @parent.systemsetting.appearance.theme
        v.selected = v.name is currtheme for v in @parent.systemsetting.appearance.themes
        @themelist.set "data" , @parent.systemsetting.appearance.themes
        @themelist.set "onlistselect", (e) =>
            data = e.data.item.get("data") if e and e.data
            return unless data
            return if data.name is @parent.systemsetting.appearance.theme
            @parent.systemsetting.appearance.theme = data.name
            @parent._gui.loadTheme data.name, true
        if not @syswp
            path = "os://resources/themes/system/wp"
            path.asFileHandle().read()
                .then (d) =>
                    return @parent.error __("Cannot read wallpaper list from {0}", path) if d.error
                    for v in d.result
                        v.text = v.filename
                        v.iconclass = "fa fa-file-image-o"
                    @syswp = d.result
                    @wplist.set "data", @getwplist()
                .catch (e) => @parent.error __("Unable to read: {0}", path), e
        else
            
            @wplist.set "data", @getwplist()
    
    getwplist: () ->
        list = []
        for v in @parent.systemsetting.appearance.wps
            file = v.asFileHandle()
            list.push
                text: file.basename,
                path: file.path
                selected: file.path is @parent.systemsetting.appearance.wp.url,
                iconclass: "fa fa-file-image-o"
        list = list.concat @syswp
        v.selected = v.path is @parent.systemsetting.appearance.wp.url for v in list
        return list