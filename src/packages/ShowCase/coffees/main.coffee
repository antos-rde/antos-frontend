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
            <afx-hbox>
               <afx-vbox data-width="150">
                    <div data-height="30%">box 1</div>
                    <div>box 2</div>
                </afx-vbox>
                <afx-resizer data-width="5" />
                <afx-vbox data-width="grow">
                    <afx-hbox min-height="50">
                    <afx-label text="__(This is the label)"
                        iconclass="fa fa-camera-retro fa-lg"
                        icon="os://packages/DummyApp/icon.png"/>
                    </afx-hbox>
                    <afx-resizer data-height="5" />
                    <afx-hbox>
                        <div>box center 3</div>
                        <div>box center 4</div>
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
        </afx-app-window>
        """
        ($ "#desktop").append scheme[0]
        obj = scheme[0].uify()
        obj.set "resizable", true
        obj.set "minimizable", false
        obj.observable.on "exit", () ->
            console.log "exit"
            obj.observable.off "*"
            $(obj).remove()

ShowCase.singleton = true
this.OS.register "ShowCase", ShowCase