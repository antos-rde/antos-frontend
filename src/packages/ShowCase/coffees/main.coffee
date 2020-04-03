Ant = this
class ShowCase extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "ShowCase", args
    
    main:() ->
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
            <afx-hbox>
               <afx-vbox data-width="150">
                    <div>box 2</div>
                    <div>box 2</div>
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
                        <afx-grid-view data-id="grid" multiselect="true" />
                    </afx-hbox>
                </afx-vbox>
                <afx-vbox data-width="150">
                    <div data-height="grow">box 3</div>
                    <div data-height="200">box 4
                </afx-vbox>
            </afx-hbox>
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
        list[0].set "onlistselect", (e) ->
            console.log(e.data.items)
        

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