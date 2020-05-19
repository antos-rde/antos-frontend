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

class Files extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "Files", args
    
    main: () ->
        @scheme.set "apptitle", "Files manager"
        @view = @find "fileview"
        @navinput = @find "navinput"
        @navbar = @find "nav-bar"
        if @args and @args.length > 0
            @currdir = @args[0].path.asFileHandle()
        else
            @currdir = "home://".asFileHandle()
        @favo = @find "favouri"
        @clipboard = undefined
        @viewType = @_api.switcher "icon", "list", "tree"
        @viewType.list = true

        @view.contextmenuHandle = (e, m) =>
            file = @view.get "selectedFile"
            apps = []
            if file and file.mime
                file.mime = "dir" if file.type is "dir"
                
                for v in @_gui.appsByMime file.mime
                    v.args = [ file ]
                    apps.push v
            m.set "items", [
                { text: "__(Open with)", dataid: "#{@name}-open", child: apps },
                @mnFile(),
                @mnEdit()
            ]
            m.show e
        
        @view.set "onfileopen", (e) =>
            return unless e.data
            return if e.data.type is "dir"
            @_gui.openWith e.data

        @favo.set "onlistselect", (e) =>
            @view.set "path", e.data.item.get("data").path
        
        ($ @find "btback").click () =>
            return if @currdir.isRoot()
            p = @currdir.parent()
            @favo.set "selected", -1
            @view.set "path", p.path

        ($ @navinput).keyup (e) =>
            @view.set "path", ($ @navinput).val() if e.keyCode is 13 #enter
        
        @view.set "fetch", (path) =>
            new Promise (resolve, reject) =>
                dir = path
                dir = path.asFileHandle() if typeof path is "string"
                dir.read().then (d) =>
                    return reject d.error if d.error
                    if not dir.isRoot()
                        p = dir.parent()
                        p.filename = "[..]"
                        p.type = "dir"
                        d.result.unshift p
                    @currdir = dir
                    ($ @navinput).val dir.path
                    resolve d.result
                .catch (e) -> reject e
        
        @view.set "ondragndrop", (e) =>
            return unless e
            src = e.data.from.get("data")
            des = e.data.to.get("data")
            return if des.type is "file"
            file = src.path.asFileHandle()
            file.move "#{des.path}/#{file.basename}"
                .then () =>
                    @view.set "path", @view.get("path")
                    @view.update file.parent().path
                    @view.update des.path
                .catch (e) => @error __("Unable to move: {0} -> {1}", src.path, des.path), e

        @setting.sidebar = true if @setting.sidebar is undefined
        @setting.nav = true if @setting.nav is undefined
        @setting.showhidden = false if @setting.showhidden is undefined
        @applyAllSetting()

        mntpoints = @systemsetting.VFS.mountpoints
        el.selected = false for el, i in mntpoints
        @favo.set "data", mntpoints
        #@favo.set "selected", -1
        @view.set "view", @setting.view if @setting.view
        @subscribe "VFS", (d) =>
            return if  ["read", "publish", "download"].includes d.data.m
            if d.data.file.hash() is @currdir.hash() or d.data.file.parent().hash() is @currdir.hash()
                @view.set "path", @currdir
        @bindKey "CTRL-F", () => @actionFile "#{@name}-mkf"
        @bindKey "CTRL-D", () => @actionFile "#{@name}-mkdir"
        @bindKey "CTRL-U", () => @actionFile "#{@name}-upload"
        @bindKey "CTRL-S", () => @actionFile "#{@name}-share"
        @bindKey "CTRL-I", () => @actionFile "#{@name}-info"

        @bindKey "CTRL-R", () => @actionEdit "#{@name}-mv"
        @bindKey "CTRL-M", () => @actionEdit "#{@name}-rm"
        @bindKey "CTRL-X", () => @actionEdit "#{@name}-cut"
        @bindKey "CTRL-C", () => @actionEdit "#{@name}-copy"
        @bindKey "CTRL-P", () => @actionEdit "#{@name}-paste"

        (@find "btgrid").set "onbtclick", (e) =>
            @view.set 'view', "icon"
            @viewType.icon = true

        (@find "btlist").set "onbtclick", (e) =>
            @view.set 'view', "list"
            @viewType.list = true
        @view.set "path", @currdir

    applySetting: (k) ->
        # view setting
        switch k
            when "showhidden" then @view.set "showhidden", @setting.showhidden
            when "nav" then @toggleNav @setting.nav
            when "sidebar" then @toggleSidebar @setting.sidebar

    mnFile: () ->
        #console.log file
        arr = {
            text: "__(File)",
            child: [
                { text: "__(New file)", dataid: "#{@name}-mkf", shortcut: 'C-F' },
                { text: "__(New folder)", dataid: "#{@name}-mkdir", shortcut: 'C-D' },
                { text: "__(Upload)", dataid: "#{@name}-upload", shortcut: 'C-U' },
                { text: "__(Download)", dataid: "#{@name}-download" },
                { text: "__(Share file)", dataid: "#{@name}-share", shortcut: 'C-S' },
                { text: "__(Properties)", dataid: "#{@name}-info", shortcut: 'C-I' }
            ], onchildselect: (e) => @actionFile e.data.item.get("data").dataid
        }
        return arr
    mnEdit: () ->
        {
            text: "__(Edit)",
            child: [
                { text: "__(Rename)", dataid: "#{@name}-mv", shortcut: 'C-R' },
                { text: "__(Delete)", dataid: "#{@name}-rm", shortcut: 'C-M' },
                { text: "__(Cut)", dataid: "#{@name}-cut", shortcut: 'C-X' },
                { text: "__(Copy)", dataid: "#{@name}-copy", shortcut: 'C-C' },
                { text: "__(Paste)", dataid: "#{@name}-paste", shortcut: 'C-P' }
            ], onchildselect: (e) => @actionEdit e.data.item.get("data").dataid
        }
    menu: () ->

        menu = [
            @mnFile(),
            @mnEdit(),
            {
                text: "__(View)",
                child: [
                    { text: "__(Refresh)", dataid: "#{@name}-refresh" },
                    { text: "__(Sidebar)", switch: true, checked: @setting.sidebar, dataid: "#{@name}-side" },
                    { text: "__(Navigation bar)", switch: true, checked: @setting.nav, dataid: "#{@name}-nav" },
                    { text: "__(Hidden files)", switch: true, checked: @setting.showhidden, dataid: "#{@name}-hidden" },
                    { text: "__(Type)", child: [
                        { text: "__(Icon view)", radio: true, checked: @viewType.icon, dataid: "#{@name}-icon", type: 'icon' },
                        { text: "__(List view)", radio:true, checked: @viewType.list, dataid: "#{@name}-list", type: 'list' },
                        { text: "__(Tree view)", radio:true, checked: @viewType.tree, dataid: "#{@name}-tree", type: 'tree' }
                     ], onchildselect: (e) =>
                        type = e.data.item.get("data").type
                        @view.set 'view', type
                        @viewType[type] = true
                    },
                ], onchildselect: (e) => @actionView e
            },
        ]
        menu

    toggleSidebar: (b) ->
        if b then ($ @favo).show() else ($ @favo).hide()
        @trigger "resize"
    
    toggleNav: (b) ->
        if b then ($ @navbar).show() else ($ @navbar).hide()
        @trigger "resize"

    actionView: (e) ->
        data = e.data.item.get("data")
        switch data.dataid
            when "#{@name}-hidden"
                #@.view.set "showhidden", e.item.data.checked
                @registry "showhidden", data.checked
                #@.setting.showhidden = e.item.data.checked
            when "#{@name}-refresh"
                @.chdir null
            when "#{@name}-side"
                @registry "sidebar", data.checked
                #@setting.sidebar = e.item.data.checked
                #@toggleSidebar e.item.data.checked
            when "#{@name}-nav"
                @registry "nav", data.checked
                #@setting.nav = e.item.data.checked
                #@toggleNav e.item.data.checked

    actionEdit: (e) ->
        file = @view.get "selectedFile"
        switch e
            when "#{@name}-mv"
                return unless file
                @openDialog("PromptDialog", {
                    title: "__(Rename)",
                    label: "__(File name)",
                    value: file.filename
                })
                    .then (d) =>
                        return if d is file.filename
                        file.path.asFileHandle().move "#{@currdir.path}/#{d}"
                            .catch (e) =>
                                @error __("Fail to rename: {0}", file.path), e
            
            when "#{@name}-rm"
                return unless file
                @openDialog("YesNoDialog", {
                    title: "__(Delete)",
                    iconclass: "fa fa-question-circle",
                    text: __("Do you really want to delete: {0}?", file.filename)
                })
                    .then (d) =>
                        return unless d
                        file.path.asFileHandle().remove()
                            .catch (e) =>
                                @error __("Fail to delete: {0}", file.path), e
            
            when "#{@name}-cut"
                return unless file
                @clipboard =
                    cut: true
                    file: file.path.asFileHandle()
                @notify __("File {0} cut", file.filename)
            
            when "#{@name}-copy"
                return unless file or file.type is "dir"
                @clipboard =
                    cut: false
                    file: file.path.asFileHandle()
                @notify __("File {0} copied", file.filename)

            when "#{@name}-paste"
                return unless @clipboard
                if @clipboard.cut
                    @clipboard.file.move "#{@currdir.path}/#{@clipboard.file.basename}"
                        .then (r) =>
                            @clipboard = undefined
                        .catch (e) =>
                            @error __("Fail to paste: {0}", @clipboard.file.path), e
                else
                    @clipboard.file.read("binary")
                        .then  (d) =>
                            blob = new Blob [d], { type: @clipboard.file.info.mime }
                            fp = "#{@currdir.path}/#{@clipboard.file.basename}".asFileHandle()
                            fp.cache = blob
                            fp.write(@clipboard.file.info.mime)
                                .then (r) =>
                                    @clipboard = undefined
                                .catch (e) =>
                                    @error __("Fail to paste: {0}", @clipboard.file.path), e
                        .catch (e) =>
                            @error __("Fail to read: {0}", @clipboard.file.path), e
            else
                @_api.handle.setting()
    
    actionFile: (e) ->
        file = @view.get "selectedFile"
        switch e
            when "#{@name}-mkdir"
                @openDialog("PromptDialog", {
                    title: "__(New folder)",
                    label: "__(Folder name)"
                })
                    .then (d) =>
                        @currdir.mk(d)
                            .catch (e) =>
                                @error __("Fail to create: {0}", d), e
            
            when "#{@name}-mkf"
                @openDialog("PromptDialog", {
                    title: "__(New file)",
                    label: "__(File name)"
                })
                    .then (d) =>
                        fp = "#{@currdir.path}/#{d}".asFileHandle()
                        fp.write("text/plain")
                            .catch (e) =>
                                @error __("Fail to create: {0}", fp.path)
            
            when "#{@name}-info"
                return unless file
                @openDialog "InfoDialog", file
            
            when "#{@name}-upload"
                @currdir.upload()
                    .catch (e) =>
                        @error __("Fail to upload: {0}", e.toString()), e

            when "#{@name}-share"
                return unless file and file.type is "file"
                file.path.asFileHandle().publish()
                    .then (r) =>
                        @notify __("Shared url: {0}", r.result)
                    .catch (e) =>
                        @error __("Fail to publish: {0}", file.path), e

            when "#{@name}-download"
                return unless file.type is "file"
                file.path.asFileHandle().download()
                    .catch (e) =>
                        @error __("Fail to download: {0}", file.path), e
            else
                console.log e

this.OS.register "Files", Files