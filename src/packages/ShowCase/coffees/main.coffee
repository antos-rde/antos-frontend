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
        scheme =  $.parseHTML """
        <afx-app-window apptitle="Preview" width="650" height="500">
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
                        <afx-list-view data-id="list" dropdown="true" multiselect="false" />
                    </afx-hbox>
                     <afx-hbox data-height="150">
                        <div>box center 3</div>
                        <div>box center 4</div>
                    </afx-hbox>
                </afx-vbox>
                <afx-vbox data-width="150">
                    <div data-height="grow">box 3</div>
                    <div data-height="200">box 4</div>
                </afx-vbox>
            </afx-hbox>
            </afx-vbox>
        </afx-app-window>
        """
        ($ "#desktop").append scheme[0]
        obj = scheme[0].uify()
        bt = $ "[data-id='bttest']", scheme[0]
        bt[0].set "onbtclick", (e) ->
            console.log "btclicked"
        obj.set "resizable", true
        obj.set "minimizable", false
        obj.observable.on "exit", () ->
            console.log "exit"
            obj.observable.off "*"
            $(obj).remove()

        obj.observable.on "btclick", (e) ->
            console.log "button clicked"

        
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
        console.log menu[0]
        menudata = [
            { text: "__(Refresh)", dataid: "refresh" },
            { text: "__(Sidebar)", dataid: "side" },
            { text: "__(Navigation bar)",  dataid: "nav" },
            { text: "__(Hidden files)",  dataid: "hidden" },
            { text: "__(Type)", children: [
                    { text: "__(Icon view)", dataid: "icon", type: 'icon' },
                    { text: "__(List view)", dataid: "list", type: 'list', children: [
                        { text: "__(Refresh)" },
                        { text: "__(Sidebar)" }
                    ] },
                    { text: "__(Tree view)", dataid: "tree", type: 'tree' }
                ]
            }
        ]
        menu[0].set "items", menudata
ShowCase.singleton = true
this.OS.register "ShowCase", ShowCase