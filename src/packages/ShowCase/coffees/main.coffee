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
            <div>
                <p>hello</p>
            </div>
        </afx-app-window>
        """
        obj = scheme[0].uify()
        ($ "#desktop").append obj
        obj.set "resizable", false
        obj.set "minimizable", false
        obj.observable.on "exit", () ->
            console.log "exit"
            obj.observable.off "*"
            $(obj).remove()

ShowCase.singleton = false
this.OS.register "ShowCase", ShowCase