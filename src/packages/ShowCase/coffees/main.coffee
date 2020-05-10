Ant = this
class ShowCase extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "ShowCase", args
    
    main: () ->
        me = @
        
        bt = @find 'bttest'
        bt.set "onbtclick", (e) ->
            console.log "btclicked"
        
        @observable.on "btclick", (e) ->
            console.log "button clicked"

        @observable.on "menuselect", (e) ->
            console.log e.id

        list = @find 'list'

        list.set "data", [
            { text: "some thing with avery long text" },
            { text: "some thing 1", closable: true },
            { text: "some thing 2", iconclass: "fa fa-camera-retro fa-lg" },
            { text: "some thing 3" },
            { text: "some thing 4" },
            { text: "some thing 5" }
        ]
        list.unshift { text: "shifted el" }
        list.set "onlistselect", (e) -> console.log(e.data.items)
        @observable.on "itemclose", (e) ->
            console.log "remove", list.get("data")
            console.log list[0].get "selectedItem"
            console.log list[0].get "selectedItems"

        sw = @find 'switch'
        sw.set "onchange", (e) ->
            console.log e.data
        
        spin = @find 'spin'
        spin.set "onchange", (e) ->
            console.log e.data

        menu = @find 'menu'
        menu.set "items", @menu()

        list.contextmenuHandle = (e, m) ->
            m.set "items", me.menu()
            m.show e
        
        grid = @find 'grid'
        grid.set "oncelldbclick", (e) ->
            console.log  "on dbclick", e
        grid.set "onrowselect", (e) ->
            console.log  "on rowselect", e.data.items
        
        @observable.on "cellselect", (e) ->
            console.log "observable", e
        
        grid.set "header", [{ text: "header1", width: 80 }, { text: "header2" }, { text: "header3" }]
        grid.set "rows", [
            [{ text: "text 1" }, { text: "text 2" }, { text: "text 3" }],
            [{ text: "text 4" }, { text: "text 5" }, { text: "text 6" }],
            [{ text: "text 7" }, { text: "text 8" }, { text: "text 9" }],
            [{ text: "text 7" }, { text: "Subgrid on columns and rows. Subgrid on columns, implicit grid rows. Subgrid on rows, defined column tracks" }, { text: "text 9" }],
            [{ text: "text 7" }, { text: "text 8" }, { text: "text 9" }],
            [{ text: "text 7" }, { text: "text 8" }, { text: "text 9" }],
            [{ text: "text 7" }, { text: "text 8" }, { text: "text 9" }],
            [{ text: "text 7" }, { text: "text 8" }, { text: "text 9" }],
            [{ text: "text 7" }, { text: "text 8" }, { text: "text 9" }],
            [{ text: "text 7" }, { text: "text 8" }, { text: "text 9" }],
            [{ text: "text 7" }, { text: "text 8" }, { text: "text 9" }]
        ]

        tdata = {
            name: 'My Tree',
            nodes: [
                { name: 'hello', iconclass:'fa fa-car'},
                { name: 'wat' },
                {
                    name: 'child folder',
                    nodes: [
                        {
                            name: 'child folder',
                            nodes: [
                                { name: 'hello' },
                                { name: 'wat' }
                            ]
                        },
                        { name: 'hello' },
                        { name: 'wat' },
                        {
                            name: 'child folder',
                            nodes: [
                                { name: 'hello' },
                                { name: 'wat' }
                            ]
                        }
                    ]
                }
            ]
        }

        tree = @find 'tree'
        tree.set "data", tdata
        tree.set "ontreeselect", (e) ->
            console.log e.data.item.get "treepath"
        tree.set "ontreedbclick", (e) ->
            console.log "treedbclick", e
        @observable.on "treedbclick", (e) ->
            console.log "observable treedbclick", e
        
        slider = @find 'slider'
        slider.set "onchanging", (v) ->
            console.log v


        flist = @find 'flist'
        flist.set "data", [
            { text: "File.txt" },
            { text: "FileB.doc" },
            { text: "Data.doc", iconclass: "fa fa-camera-retro fa-lg" }
        ]

        cal = @find 'cal'
        cal.set "ondateselect", (e) ->
            console.log e
        
        pk = @find 'cpk'
        pk.set "oncolorselect", (e) ->
            console.log e
        pk.set "oncolorselect", (e) ->
            console.log e

        fileview = @find 'fileview'
        fileview.set "fetch", (path) ->
            new Promise (resolve, reject) ->
                dir = path.asFileHandle()
                dir.read().then (d) ->
                    p = dir.parent().asFileHandle()
                    p.filename = "[..]"
                    p.type = "dir"
                    return reject d.error if d.error
                    d.result.unshift p
                    resolve d.result
        fileview.set "path", "home:///"

        viewoption =  @find 'viewoption'
        viewoption.set "data", [
            { text: "icon" },
            { text: "list" },
            { text: "tree" }
        ]
        viewoption.set "onlistselect", (e) ->
            console.log e.data.item.get("data").text
            fileview.set "view", e.data.item.get("data").text

        dllist = @find "dialoglist"
        btrun = @find "btrundia"

        dllist.set "data", [
            { text: "Prompt dialog", id: "prompt" },
            { text: "Calendar dialog", id: "calendar" },
            { text: "Color picker dialog", id: "colorpicker" },
            { text: "Info dialog", id: "info" },
            { text: "YesNo dialog", id: "yesno" },
            { text: "Selection dialog", id: "selection" },
            { text: "About dialog", id: "about" },
            { text: "File dialog", id: "file" }
        ]

        btrun.set "onbtclick", (e) ->
            item = dllist.get "selectedItem"
            return unless item
            switch item.get("data").id
                when "prompt"
                    me.openDialog("PromptDialog", {
                            title: "Prompt review",
                            value: "txt data",
                            label: "enter value"
                        })
                        .then (d) ->
                            console.log d
                when "calendar"
                    me.openDialog("CalendarDialog", {
                            title: "Calendar"
                    })
                        .then (d) ->
                            console.log d
                when "colorpicker"
                    me.openDialog("ColorPickerDialog")
                        .then (d) ->
                            console.log d
                when "info"
                    me.openDialog("InfoDialog", {
                        title: "Info application",
                        name: "Show case",
                        date: "10/12/2014",
                        description: "the brown fox jumps over the lazy dog"
                    })
                        .then (d) ->
                when "yesno"
                    me.openDialog("YesNoDialog", {
                            title: "Question ?",
                            label: "Do you realy want to delete file ?"
                        })
                        .then (d) ->
                            console.log d
                when "selection"
                    me.openDialog("SelectionDialog", {
                            title: "Select data ?",
                            data: [
                                { text: "Option 1" },
                                { text: "Option 2" },
                                { text: "Option 3", iconclass: "fa fa-camera-retro fa-lg" }
                            ]
                        })
                        .then (d) ->
                            console.log d
                when "about"
                    me.openDialog("AboutDialog" )
                        .then (d) ->
                else return
                    


    mnFile: () ->
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
            ], onchildselect: (e) -> console.log "child", e
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
            ], onchildselect: (e) -> console.log "child", e
        }

    menu: () ->
        me = @
        menu = [
            @mnFile(),
            @mnEdit(),
            {
                text: "__(View)",
                child: [
                    { text: "__(Refresh)", dataid: "#{@name}-refresh", onmenuselect: (e) -> console.log "select", e },
                    { text: "__(Sidebar)", switch: true, checked: true },
                    { text: "__(Navigation bar)", switch: true, checked: false },
                    { text: "__(Hidden files)", switch: true, checked: true, dataid: "#{@name}-hidden" },
                    { text: "__(Type)", child: [
                        { text: "__(Icon view)", radio: true, checked: true, dataid: "#{@name}-icon", type: 'icon' },
                        { text: "__(List view)", radio:true, checked: false, dataid: "#{@name}-list", type: 'list' },
                        { text: "__(Tree view)", radio:true, checked: false, dataid: "#{@name}-tree", type: 'tree' }
                     ], onchildselect: (e) -> console.log "child", e
                    },
                ], onchildselect: (e) -> console.log "child", e
            },
        ]
        menu
ShowCase.singleton = true
this.OS.register "ShowCase", ShowCase