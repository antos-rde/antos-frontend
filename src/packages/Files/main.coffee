class Files extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "Files", args
    
    main: () ->
        me = @
        @scheme.set "apptitle", "Files manager"
        @view = @find "fileview"
        @navinput = @find "navinput"
        @navbar = @find "nav-bar"
        @currdir = if @args and @args.length > 0 then @args[0].asFileHandler() else "home:///".asFileHandler()
        @favo = @find "favouri"
        @clipboard = undefined

        @view.contextmenuHandler = (e, m) ->
            m.set "items", [ me.mnFile(), me.mnEdit() ]
            m.show(e)
        #@on "fileselect", (d) -> console.log d
        @view.set "onfileopen", (e) ->
            return unless e
            return if e.type is "dir"
            #console.log e
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
                return me.error "Resource not found #{e.child.path}" if d.error
                f d.result
        
        @setting.sidebar = true if @setting.sidebar is undefined
        @setting.nav = true if @setting.nav is undefined
        @setting.showhidden = false if @setting.showhidden is undefined
        
        mntpoints = @systemsetting.VFS.mountpoints
        el.selected = false for el, i in mntpoints

        @favo.set "items", mntpoints
        #@favo.set "selected", -1
        @applySetting()
        @chdir null

    applySetting: (k) ->
        # view setting
        @view.set "view", @setting.view if @setting.view
        @view.set "showhidden", @setting.showhidden
        @toggleSidebar @setting.sidebar
        @toggleNav @setting.nav

    chdir: (p) ->
        me = @
        dir = if p then p.asFileHandler() else me.currdir
        dir.read (d) ->
                if(d.error)
                    return me.error "Resource not found #{p}"
                    console.log "error"
                me.currdir = dir
                if not dir.isRoot()
                    p = dir.parent().asFileHandler()
                    p.filename = "[..]"
                    p.type = "dir"
                    #p.size = 0
                    d.result.unshift p
                ($ me.navinput).val dir.path
                me.view.set "path", dir.path
                me.view.set "data", d.result

    mnFile:() ->
        me = @
        {
            text: "File",
            child: [
                { text: "New file", dataid: "#{@name}-mkf" },
                { text: "New folder", dataid: "#{@name}-mkdir" },
                { text: "Open with", dataid: "#{@name}-open" },
                { text: "Upload", dataid: "#{@name}-upload" },
                { text: "Download", dataid: "#{@name}-download" },
                { text: "Properties", dataid: "#{@name}-info" }
            ], onmenuselect: (e) -> me.actionFile e
        }
    mnEdit: () ->
        me = @
        {
            text: "Edit",
            child: [
                { text: "Rename", dataid: "#{@name}-mv" },
                { text: "Delete", dataid: "#{@name}-rm" },
                { text: "Cut", dataid: "#{@name}-cut" },
                { text: "Copy", dataid: "#{@name}-copy" },
                { text: "Paste", dataid: "#{@name}-paste" }
            ], onmenuselect: (e) -> me.actionEdit e
        }
    menu: () ->
        me = @
        menu = [
            @mnFile(),
            @mnEdit(),
            {
                text: "View",
                child: [
                    { text: "Refresh", dataid: "#{@name}-refresh" },
                    { text: "Sidebar", switch: true, checked: @setting.sidebar, dataid: "#{@name}-side" },
                    { text: "Navigation bar", switch: true, checked: @setting.nav, dataid: "#{@name}-nav" },
                    { text: "Hidden files", switch: true, checked: @setting.showhidden, dataid: "#{@name}-hidden" },
                    { text: "Type", child: [
                        { text: "Icon view", radio: true, checked: @setting.view is 'icon', dataid: "#{@name}-icon", type: 'icon' },
                        { text: "List view", radio:true, checked: @setting.view is 'list' or not @setting.view, dataid: "#{@name}-list", type: 'list' },
                        { text: "Tree view", radio:true, checked: @setting.view is 'tree', dataid: "#{@name}-tree", type: 'tree' }
                     ], onmenuselect: (e) ->
                        me.view.set 'view', e.item.data.type
                        me.setting.view = e.item.data.type
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
                @registry "showhidden",e.item.data.checked
                #@.setting.showhidden = e.item.data.checked
            when "#{@name}-refresh"
                @.chdir null
            when "#{@name}-side"
                @registry "sidebar",e.item.data.checked
                #@setting.sidebar = e.item.data.checked
                #@toggleSidebar e.item.data.checked
            when "#{@name}-nav"
                @registry "nav", e.item.data.checked
                #@setting.nav = e.item.data.checked
                #@toggleNav e.item.data.checked

    actionEdit: (e) ->
        me = @
        file = @view.get "selectedFile"
        switch e.item.data.dataid
            when "#{@name}-mv"
                return unless file
                @openDialog "PromptDialog",
                    (d) ->
                        return if d is file.filename
                        file.path.asFileHandler()
                            .move "#{me.currdir.path}/#{d}", (r) ->
                                if r.result then me.chdir null else me.error "Fail to rename to #{d}: #{r.error}"
                    , "Rename", file.filename
            
            when "#{@name}-rm"
                return unless file
                @openDialog "YesNoDialog",
                    (d) ->
                        return unless d
                        file.path.asFileHandler()
                            .remove (r) ->
                                if r.result then me.chdir null else me.error "Fail to delete #{file.filename}: #{r.error}"
                , "Delete" ,
                { iconclass: "fa fa-question-circle", text: "Do you really want to delete: #{file.filename} ?" }
            
            when "#{@name}-cut"
                return unless file
                @clipboard =
                    cut: true
                    file: file.path.asFileHandler()
                @notify "File #{file.filename} cut"
            
            when "#{@name}-copy"
                return unless file
                @clipboard =
                    cut: false
                    file: file.path.asFileHandler()
                @notify "File #{file.filename} copied"

            when "#{@name}-paste"
                me = @
                return unless @clipboard
                if @clipboard.cut
                    @clipboard.file # duplicate file check
                            .move "#{me.currdir.path}/#{@clipboard.file.basename}", (r) ->
                                me.clipboard = undefined
                                if r.result then me.chdir null else me.error "Fail to paste: #{r.error}"
                else
                    @notify "Copy not yet implemented"
                    @clipboard = undefined
            else
                @_api.handler.setting()
    
    actionFile: (e) ->
        me = @
        file = @view.get "selectedFile"
        switch e.item.data.dataid

            when "#{@name}-mkdir"
                @openDialog "PromptDialog",
                    (d) ->
                        me.currdir.mk d, (r) ->
                            if r.result then me.chdir null else me.error "Fail to create #{d}: #{r.error}"
                    , "New folder"
            
            when "#{@name}-mkf"
                @openDialog "PromptDialog",
                    (d) ->
                        fp = "#{me.currdir.path}/#{d}".asFileHandler()
                        fp.write "", (r) ->
                            if r.result then me.chdir null else me.error "Fail to create #{d}: #{r.error}"
                    , "New file"
            
            when "#{@name}-info"
                return unless file
                @openDialog "InfoDialog", null, file.filename, file
            
            when "#{@name}-upload"
                me = @
                @currdir.upload (r) ->
                    if r.result then me.chdir null else me.error "Faile to upload to: #{d}: #{r.error}"

            when "#{@name}-download"
                return unless file
                file.path.asFileHandler().download ()->
            else
                console.log e

this.OS.register "Files", Files