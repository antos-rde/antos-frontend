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
        me = @
        @scheme.set "apptitle", "Files manager"
        @view = @find "fileview"
        @navinput = @find "navinput"
        @navbar = @find "nav-bar"
        @currdir = if @args and @args.length > 0 then @args[0].asFileHandler() else "home://".asFileHandler()
        @favo = @find "favouri"
        @clipboard = undefined
        @viewType = @_api.switcher "icon", "list", "tree"
        @viewType.list = true
        @apps = []

        @view.contextmenuHandler = (e, m) ->
            m.set "items", [ me.mnFile(), me.mnEdit() ]
            m.set "onmenuselect", (evt) ->
                me._gui.launch evt.item.data.app, evt.item.data.args if evt.item.data.app
            m.show e
        #@on "fileselect", (d) -> console.log d
        @view.set "onfileopen", (e) ->
            return unless e
            return if e.type is "dir"
            me._gui.openWith e

        @favo.set "onlistselect", (e) ->
            me.chdir e.data.path
        
        ($ @find "btback").click () ->
            return if me.currdir.isRoot()
            p = me.currdir.parent()
            me.favo.set "selected", -1
            me.chdir p

        ($ @navinput).keyup (e) ->
            me.chdir ($ me.navinput).val() if e.keyCode is 13 #enter
        
        @view.set "chdir", (p) -> me.chdir p
        @view.set "fetch", (e, f) ->
            return unless e.child
            return if e.child.filename is "[..]"
            e.child.path.asFileHandler().read (d) ->
                return me.error __("Resource not found {0}", e.child.path) if d.error
                f d.result
        
        @view.set "onfileselect", (e) ->
            file = me.view.get "selectedFile"
            return  unless file and file.mime
            file.mime = "dir" if file.type is "dir"
            me.apps.length = 0
            for v in me._gui.appsByMime file.mime
                v.args = [ file.path ]
                me.apps.push v
        @setting.sidebar = true if @setting.sidebar is undefined
        @setting.nav = true if @setting.nav is undefined
        @setting.showhidden = false if @setting.showhidden is undefined
        
        mntpoints = @systemsetting.VFS.mountpoints
        el.selected = false for el, i in mntpoints

        @favo.set "items", mntpoints
        #@favo.set "selected", -1
        @applySetting()
        @subscribe "VFS", (d) ->
            me.chdir null if d.data.file.hash() is me.currdir.hash() or d.data.file.parent().hash() is me.currdir.hash()
        @bindKey "CTRL-F", () -> me.actionFile "#{me.name}-mkf"
        @bindKey "CTRL-D", () -> me.actionFile "#{me.name}-mkdir"
        @bindKey "CTRL-U", () -> me.actionFile "#{me.name}-upload"
        @bindKey "CTRL-S", () -> me.actionFile "#{me.name}-share"
        @bindKey "CTRL-I", () -> me.actionFile "#{me.name}-info"

        @bindKey "CTRL-R", () -> me.actionEdit "#{me.name}-mv"
        @bindKey "CTRL-M", () -> me.actionEdit "#{me.name}-rm"
        @bindKey "CTRL-X", () -> me.actionEdit "#{me.name}-cut"
        @bindKey "CTRL-C", () -> me.actionEdit "#{me.name}-copy"
        @bindKey "CTRL-P", () -> me.actionEdit "#{me.name}-paste"

        (@find "btgrid").set "onbtclick", (e) ->
            me.view.set 'view', "icon"
            me.viewType.icon = true
        (@find "btlist").set "onbtclick", (e) ->
            me.view.set 'view', "list"
            me.viewType.list = true
        @chdir null

    applySetting: (k) ->
        # view setting
        @view.set "view", @setting.view if @setting.view
        @view.set "showhidden", @setting.showhidden
        @toggleSidebar @setting.sidebar
        @toggleNav @setting.nav

    chdir: (p) ->
        me = @
        #console.log "ch"
        dir = if p then p.asFileHandler() else me.currdir
        dir.read (d) ->
                if(d.error)
                    return me.error __("Resource not found {0}", p)
                
                me.currdir = dir
                if not dir.isRoot()
                    p = dir.parent().asFileHandler()
                    p.filename = "[..]"
                    p.type = "dir"
                    #p.size = 0
                    d.result.unshift p
                ($ me.navinput).val dir.path
                me.view.set "path", dir.path
                #console.log d.result
                me.view.set "data", d.result

    mnFile:() ->
        #console.log file
        me = @
        arr = {
            text: "__(File)",
            child: [
                { text: "__(New file)", dataid: "#{@name}-mkf", shortcut: 'C-F' },
                { text: "__(New folder)", dataid: "#{@name}-mkdir", shortcut: 'C-D' },
                { text: "__(Open with)", dataid: "#{@name}-open", child: @apps },
                { text: "__(Upload)", dataid: "#{@name}-upload", shortcut: 'C-U' },
                { text: "__(Download)", dataid: "#{@name}-download" },
                { text: "__(Share file)", dataid: "#{@name}-share", shortcut: 'C-S' },
                { text: "__(Properties)", dataid: "#{@name}-info", shortcut: 'C-I' }
            ], onmenuselect: (e) -> me.actionFile e.item.data.dataid
        }
        return arr
    mnEdit: () ->
        me = @
        {
            text: "__(Edit)",
            child: [
                { text: "__(Rename)", dataid: "#{@name}-mv", shortcut: 'C-R' },
                { text: "__(Delete)", dataid: "#{@name}-rm", shortcut: 'C-M' },
                { text: "__(Cut)", dataid: "#{@name}-cut", shortcut: 'C-X' },
                { text: "__(Copy)", dataid: "#{@name}-copy", shortcut: 'C-C' },
                { text: "__(Paste)", dataid: "#{@name}-paste", shortcut: 'C-P' }
            ], onmenuselect: (e) -> me.actionEdit e.item.data.dataid
        }
    menu: () ->
        me = @
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
                        { text: "__(Icon view)", radio: true, checked: (() -> me.viewType.icon), dataid: "#{@name}-icon", type: 'icon' },
                        { text: "__(List view)", radio:true, checked: (() -> me.viewType.list), dataid: "#{@name}-list", type: 'list' },
                        { text: "__(Tree view)", radio:true, checked: (() -> me.viewType.tree), dataid: "#{@name}-tree", type: 'tree' }
                     ], onmenuselect: (e) ->
                        me.view.set 'view', e.item.data.type
                        me.viewType[e.item.data.type] = true
                    },
                ], onmenuselect: (e) -> me.actionView e
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
        switch e.item.data.dataid
            when "#{@name}-hidden"
                #@.view.set "showhidden", e.item.data.checked
                @registry "showhidden", e.item.data.checked
                #@.setting.showhidden = e.item.data.checked
            when "#{@name}-refresh"
                @.chdir null
            when "#{@name}-side"
                @registry "sidebar", e.item.data.checked
                #@setting.sidebar = e.item.data.checked
                #@toggleSidebar e.item.data.checked
            when "#{@name}-nav"
                @registry "nav", e.item.data.checked
                #@setting.nav = e.item.data.checked
                #@toggleNav e.item.data.checked

    actionEdit: (e) ->
        me = @
        file = @view.get "selectedFile"
        switch e
            when "#{@name}-mv"
                return unless file
                @openDialog "PromptDialog",
                    (d) ->
                        return if d is file.filename
                        file.path.asFileHandler()
                            .move "#{me.currdir.path}/#{d}", (r) ->
                                me.error __("Fail to rename to {0}: {1}", d, r.error) if r.error
                    , "__(Rename)", { label: "__(File name)", value: file.filename }
            
            when "#{@name}-rm"
                return unless file
                @openDialog "YesNoDialog",
                    (d) ->
                        return unless d
                        file.path.asFileHandler()
                            .remove (r) ->
                                me.error __("Fail to delete {0}: {1}", file.filename, r.error) if r.error
                ,"__(Delete)" ,
                { iconclass: "fa fa-question-circle", text: __("Do you really want to delete: {0}?", file.filename) }
            
            when "#{@name}-cut"
                return unless file
                @clipboard =
                    cut: true
                    file: file.path.asFileHandler()
                @notify __("File {0} cut", file.filename)
            
            when "#{@name}-copy"
                return unless file
                @clipboard =
                    cut: false
                    file: file.path.asFileHandler()
                @notify __("File {0} copied", file.filename)

            when "#{@name}-paste"
                me = @
                return unless @clipboard
                if @clipboard.cut
                    @clipboard.file # duplicate file check
                            .move "#{me.currdir.path}/#{@clipboard.file.basename}", (r) ->
                                me.clipboard = undefined
                                me.error __("Fail to paste: {0}", r.error) if r.error
                else
                    @notify __("Copy not yet implemented")
                    @clipboard = undefined
            else
                @_api.handler.setting()
    
    actionFile: (e) ->
        me = @
        file = @view.get "selectedFile"
        switch e

            when "#{@name}-mkdir"
                @openDialog "PromptDialog",
                    (d) ->
                        me.currdir.mk d, (r) ->
                             me.error __("Fail to create {0}: {1}", d, r.error) if r.error
                    , "__(New folder)", { label: "__(Folder name)" }
            
            when "#{@name}-mkf"
                @openDialog "PromptDialog",
                    (d) ->
                        fp = "#{me.currdir.path}/#{d}".asFileHandler()
                        fp.write "text/plain", (r) ->
                            me.error __("Fail to create {0}: {1}", d, r.error) if r.error
                    , "__(New file)",  { label: "__(File name)" }
            
            when "#{@name}-info"
                return unless file
                @openDialog "InfoDialog", null, file.filename, file
            
            when "#{@name}-upload"
                me = @
                @currdir.upload (r) ->
                    me.error __("Fail to upload to {0}: {1}", d, r.error) if r.error

            when "#{@name}-share"
                me = @
                return unless file and file.type is "file"
                file.path.asFileHandler().publish (r) ->
                    return me.error __("Cannot share file: {0}", r.error) if r.error
                    return me.notify __("Shared url: {0}", r.result)

            when "#{@name}-download"
                return unless file
                file.path.asFileHandler().download ()->
            else
                console.log e

this.OS.register "Files", Files