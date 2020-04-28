Ant = this
class ShowCase extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "ShowCase", args
    
    main: () ->
        me = @
        @announcer = new Ant.OS.API.Announcer()
        @announcer.on "evt1", (data) ->
            console.log "evt1", data
        @announcer.on "evt1", (data) ->
            console.log "evt1 fn1: ", data
        fn = (data) ->
            console.log "evt1 fn2: ", data
        @announcer.on "evt1", fn
        @announcer.on "evt2", (data) ->
            console.log "evt2", data
        @announcer.one "evt1", (data) ->
            console.log "evt1 only one", data
        @announcer.one "*", (data) ->
            console.log "evt1 only one*", data
        @announcer.on "*", fn

        console.log me.announcer
        @on "btclick", (e) ->
            me.openwin()
            ###
            me.announcer.trigger("evt1", "Hello 1")
            me.announcer.off("*")
            me.announcer.trigger("evt2", "Hello 2")
            console.log me.announcer
            me.notify "Hello"
            console.log tag
            ###
    openwin: () ->
        me = @
        scheme =  $.parseHTML """
        <afx-app-window data-id="example-show-case" apptitle="Preview" width="650" height="500">
            <afx-vbox>
                <afx-menu data-height="30" data-id="menu" />
                <afx-tab-container data-id="tabctn" tabbarheight= "30">

                    <afx-hbox title="Widgets">
                        <afx-vbox data-width="150">
                            <afx-tree-view data-id="tree" />
                            <afx-slider data-id="slider" data-height="30" value="50"/>
                        </afx-vbox>
                        <afx-resizer data-width="5" />
                        <afx-vbox data-width="grow">
                            <afx-hbox min-height="50">
                            <afx-switch data-id="switch" />
                            <afx-button text="__(This is the label)"
                                data-id="bttest"
                                iconclass="fa fa-camera-retro fa-lg"
                                icon="os://packages/DummyApp/icon.png"/>
                            <afx-nspinner data-id="spin" value="10" step="2" />
                            </afx-hbox>
                            <afx-resizer data-height="5" />
                            <afx-hbox>
                                <afx-list-view data-id="list" dropdown="false" multiselect="true" />
                            </afx-hbox>
                            <afx-hbox data-height="150">
                                <afx-grid-view data-id="grid" multiselect="false" />
                            </afx-hbox>
                        </afx-vbox>
                    </afx-hbox>
                    <afx-hbox title="Virtual desktop">
                        <afx-float-list1 data-id = "flist"/>
                    </afx-hbox>
                    <afx-hbox title="Calendar">
                        <afx-calendar-view data-id = "cal"/>
                    </afx-hbox>
                    <afx-hbox title="Color picker">
                        <afx-color-picker data-id = "cpk"/>
                    </afx-hbox>
                </afx-tab-container>
            </afx-vbox>
        </afx-app-window>
        """
        ctmenu = $.parseHTML """<afx-menu data-id="mn-context" context="true" style="display:none;" /></div>"""
        ($ "#desktop").append scheme[0]
        ($ "#wrapper").append ctmenu[0]
        me.subwin = scheme[0].uify()
        bt = $ "[data-id='bttest']", scheme[0]
        bt[0].set "onbtclick", (e) ->
            console.log "btclicked"
        me.subwin.set "resizable", true
        me.subwin.set "minimizable", false
        me.subwin.observable.on "exit", () ->
            me.subwin.observable.off "*"
            $(me.subwin).remove()
            me.quit()

        me.subwin.observable.on "btclick", (e) ->
            console.log "button clicked"

        me.subwin.observable.on "menuselect", (e) ->
            console.log e.id

        list = $ "[data-id='list']", scheme[0]

        list[0].set "data", [
            { text: "some thing with avery long text" },
            { text: "some thing 1", closable: true },
            { text: "some thing 2", iconclass: "fa fa-camera-retro fa-lg" },
            { text: "some thing 3" },
            { text: "some thing 4" },
            { text: "some thing 5" }
        ]
        list[0].unshift { text: "shifted el" }
        console.log "after shift", list[0].get("data")
        list[0].set "onlistselect", (e) ->
            console.log(e.data.items)
         me.subwin.observable.on "itemclose", (e) ->
            console.log "remove", list[0].get("data")
            console.log list[0].get "selectedItem"
            console.log list[0].get "selectedItems"

        sw = $ "[data-id='switch']", scheme[0]
        sw[0].set "onchange", (e) ->
            console.log e.data
        
        spin = $ "[data-id='spin']", scheme[0]
        spin[0].set "onchange", (e) ->
            console.log e.data

        menu = $ "[data-id='menu']", scheme[0]
        menu[0].set "items", @menu()
        ctmenu = ctmenu[0].uify(me.subwin.observable)
        ctmenu.set "items", @menu()
        ctmenu.set "onmenuselect", (e) ->
            console.log "root event", e
        list[0].contextmenuHandle = (e) ->
            console.log e
            ctmenu.show e
        
        grid = $ "[data-id='grid']", scheme[0]
        grid[0].set "oncelldbclick", (e) ->
            console.log  "on dbclick", e
        grid[0].set "onrowselect", (e) ->
            console.log  "on rowselect", e.data.items
        me.subwin.observable.on "cellselect", (e) ->
            console.log "observable", e
        grid[0].set "header", [{ text: "header1", width: 80 }, { text: "header2" }, { text: "header3" }]
        grid[0].set "rows", [
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

        tree = $ "[data-id='tree']", scheme[0]
        tree[0].set "data", tdata
        tree[0].set "ontreeselect", (e) ->
            console.log e.data.item.get "treepath"
        tree[0].set "ontreedbclick", (e) ->
            console.log "treedbclick", e
        me.subwin.observable.on "treedbclick", (e) ->
            console.log "observable treedbclick", e
        
        slider = $ "[data-id='slider']", scheme[0]
        slider[0].set "onchanging", (v) ->
            console.log v


        list = $ "[data-id='flist']", scheme[0]
        list[0].set "data", [
            { text: "File.txt" },
            { text: "FileB.doc" },
            { text: "Data.doc", iconclass: "fa fa-camera-retro fa-lg" }
        ]

        cal = $ "[data-id='cal']", scheme[0]
        cal[0].set "ondateselect", (e) ->
            console.log e
        
        pk = $ "[data-id='cpk']", scheme[0]
        pk[0].set "oncolorselect", (e) ->
            console.log e

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
    cleanup: () ->
        return unless @subwin
        $(@subwin).remove()
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