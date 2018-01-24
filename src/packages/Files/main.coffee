class Files extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "Files", args
    
    main: () ->
        me = @
        @scheme.set "apptitle", "Files manager"
        @view = @find "fileview"
        @navinput = @find "navinput"
        @navbar = @find "nav-bar"
        @currdir = undefined
        @favo = @find "favouri"

        @view.contextmenuHandler = (e, m) ->
            m.set "items", [ me.mnFile(), me.mnEdit() ]
            m.show(e)
        #@on "fileselect", (d) -> console.log d
        @on "filedbclick", (e) ->
            #if e.data.type is 'dir' then me.chdir e.data.path, true
        @favo.set "onlistselect", (e) -> me.chdir e.data.path
        
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
            me._api.handler.scandir e.child.path,
                (d) -> f d.result
                , (e, s) -> me.error "Cannot fetch child dir #{e.child.path}"
        
        @setting.favorite = [
            { text: "Applications", path: 'app:///', iconclass: "fa  fa-adn" },
            { text: "Home", path: 'home:///', iconclass: "fa fa-home", selected: true },
            { text: "OS", path: 'os:///', iconclass: "fa fa-inbox" },
            { text: "Desktop", path: 'home:///.desktop', iconclass: "fa fa-desktop" },
        ] if not @setting.favorite
        @setting.sidebar = true if @setting.sidebar is undefined
        @setting.nav = true if @setting.nav is undefined
        @setting.showhidden = false if @setting.showhidden is undefined
        @favo.set "items", @setting.favorite
        @applySetting()

    applySetting: (k) ->
        # view setting
        @view.set "view", @setting.view if @setting.view
        @view.set "showhidden", @setting.showhidden
        @toggleSidebar @setting.sidebar
        @toggleNav @setting.nav

    chdir: (p, push) ->
        me = @
        dir = if p then p.asFileHandler() else me.currdir
        dir.read (d) ->
                if(d.error)
                    return me.error "Resource not found #{p}"
                me.currdir = dir
                ($ me.navinput).val p
                me.view.set "path", p
                me.view.set "data", d.result

    mnFile:() ->
        me = @
        {
            text: "File",
            child: [
                { text: "New file", dataid: "#{@name}-mkf" },
                { text: "New folder", dataid: "#{@name}-mkdir" },
                { text: "Upload", dataid: "#{@name}-upload" }
            ], onmenuselect: (e) -> me.actionFile e
        }
    mnEdit: () ->
        me = @
        {
            text: "Edit",
            child: [
                { text: "Rename", dataid: "#{@name}-mv" },
                { text: "Delete", dataid: "#{@name}-rm" },
                { text: "Information", dataid: "#{@name}-info" },
                { text: "Open with", dataid: "#{@name}-open" },
                { text: "Download", dataid: "#{@name}-download" },
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
        switch e.item.data.dataid
            when "#{@name}-info"
                file = @view.get "selectedFile"
                return unless file
                @openDialog "InfoDialog", null, file
            when "#{@name}-mkdir"
                console.log "mkdir"
                @openDialog "PromptDialog", (d) -> console.log d
            else
                @_api.handler.setting()
    
    actionFile: (e) ->
        me = @
        switch e.item.data.dataid
            when "#{@name}-mkdir"
                @openDialog "PromptDialog",
                    (d) ->
                        me.currdir.mk d, (r) ->
                            if r.result then me.chdir null else me.error "Fail to create #{d}"
                    , "New folder"
            when "#{@name}-mkf"
                @openDialog "PromptDialog",
                    (d) ->
                        fp = "#{me.currdir.path}/#{d}".asFileHandler()
                        fp.write "", (r) ->
                            if r.result then me.chdir null else me.error "Fail to create #{d}"
                    , "New file"
            else
                console.log e

this.OS.register "Files", Files