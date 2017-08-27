class BaseService extends this.OS.GUI.BaseModel
    constructor: (name, args) ->
        super name, args
        @icon = undefined
        @iconclass = "fa-paper-plane-o"
        @text = ""
        @timer = undefined
        @holder = undefined

    init: ()->
        #implement by user
        # event registe, etc
        # scheme loader
    meta: () ->
        @
    attach: (h) ->
        @holder = h

    update: () -> @holder.update() if @holder
    
    watch: ( t, f) ->
        me = @
        func = () ->
            f()
            me.timer = setTimeout (() -> func()), t
        func()
    onexit: (evt) ->
        console.log "clean timer" if @timer
        clearTimeout @timer if @timer
        @cleanup(evt)
        ($ @scheme).remove() if @scheme
        
    main: () ->
    show: () ->
    awake: (e) ->
        #implement by user to tart the service
    cleanup: (evt) ->
        #implemeted by user
BaseService.type = 2
BaseService.singleton = true
this.OS.GUI.BaseService = BaseService