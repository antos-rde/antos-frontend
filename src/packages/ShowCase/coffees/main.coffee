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
            me.announcer.trigger("evt1", "Hello 1")
            me.announcer.off("*")
            me.announcer.trigger("evt2", "Hello 2")
            console.log me.announcer
            me.notify "Hello"
            tag = new Ant.OS.GUI.tags["afx-window"]()
            console.log tag


ShowCase.singleton = false
this.OS.register "ShowCase", ShowCase