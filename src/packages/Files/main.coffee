class Files extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "Files", args
    main: () ->
        me = @
        @scheme.set "apptitle", "Files manager"
        @view = @find "fileview"
        @navinput = @find "navinput"
        @navbar = @find "nav-bar"
        @prepaths = []
        @favo = @find "favouri"
        @loadSetting()

        @view.contextmenuHandler = (e, m) ->
            m.set "items", [ me.mnFile(), me.mnEdit() ]
            m.show(e)
        #@on "fileselect", (d) -> console.log d
        @on "filedbclick", (e) ->
            #if e.data.type is 'dir' then me.chdir e.data.path, true
        @favo.set "onlistselect", (e) -> me.chdir e.data.path, true
        
        ($ @find "btback").click () ->
            return if me.prepaths.length is 0
            p = me.prepaths.pop()
            me.favo.set "selected", -1
            me.chdir p, false

        ($ @navinput).keyup (e) ->
            me.chdir ($ me.navinput).val() if e.keyCode is 13 #enter
        
        @view.set "chdir", (p) -> me.chdir p, true
        @view.set "fetch", (e, f) ->
            return unless e.child
            me._api.handler.scandir e.child.path,
                (d) -> f d.result
                , (e, s) -> me.error "Cannot fetch child dir #{e.child.path}"

        @favo.set "items", @setting.favorite

    loadSetting: () ->
        # view setting
        @view.set "view", @setting.view if @setting.view
        @view.set "showhidden", @setting.showhidden if @setting.showhidden
        @setting.favorite = [
            { text: "Applications", path: 'apps:///', iconclass:"fa  fa-adn"},
            { text: "Home", path: 'home:///', iconclass:"fa fa-home", selected:true},
            { text: "OS", path: 'os:///', iconclass:"fa fa-inbox" },
            { text: "Desktop", path: 'home:///.desktop', iconclass: "fa fa-desktop" },
        ] if not @setting.favorite
        @setting.sidebar = true if @setting.sidebar is undefined
        @toggleSidebar @setting.sidebar
        @setting.nav = true if @setting.nav is undefined
        @toggleNav @setting.nav

    chdir: (p, push) ->
        me = @
        me._api.handler.scandir p,
            (d) ->
                if(d.error)
                    return me.error "Resource not found #{p}"
                v = ($ me.navinput).val()
                me.prepaths.push v if push and v isnt ""
                ($ me.navinput).val p
                me.view.set "path", p
                me.view.set "data", d.result
            , (e, s) ->
                me.error "Cannot chdir #{p}"

    mnFile:() ->
        {
            text: "File",
            child: [
                { text: "New file", dataid: "#{@name}-mkf" },
                { text: "New folder", dataid: "#{@name}-mkdir" },
                { text: "Upload", dataid: "#{@name}-upload" }
            ]
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
                @.view.set "showhidden", e.item.data.checked
                @.setting.showhidden = e.item.data.checked
            when "#{@name}-refresh"
                @.chdir ($ @.navinput).val(), false
            when "#{@name}-side"
                @setting.sidebar = e.item.data.checked
                @toggleSidebar e.item.data.checked
            when "#{@name}-nav"
                @setting.nav = e.item.data.checked
                @toggleNav e.item.data.checked

    actionEdit: (e) ->
        switch e.item.data.dataid
            when "#{@.name}-info"
                file = @view.get "selectedFile"
                return unless file
                @openDialog "InfoDialog", null, file
            else
                @_api.handler.setting()

this.OS.register "Files", Files