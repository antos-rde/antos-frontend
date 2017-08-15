MAIL = this.OS.courrier
_API = this.OS.API
_PM = this.OS.PM
class BaseService
    constructor: (@name) ->
        @icon = undefined
        @iconclass = "fa-paper-plane-o"
        @text = ""
        @_api = _API
        @timer = undefined
        @holder = undefined

    init: ()->
        #implement by user
        # event registe, etc
        # scheme loader

    attach: (h) -> @holder = h
    update: () -> @holder.update() if @holder
    on: (e, f) -> MAIL.on e, f
    trigger: (e, d) -> MAIL.trigger e, d
    watch: ( t, f) ->
        me = @
        func = () ->
            f()
            me.timer = setTimeout (() -> func()), t
        func()
    quit: ()->
        console.log "clean timer" if @timer
        clearTimeout @timer if @timer
        @cleanup()
        _PM.kill @
    main: () ->
    show: () ->
    awake: () ->
        #implement by user to tart the service
    cleanup:() ->
        #implemeted by user
BaseService.type = 2
this.OS.GUI.BaseService = BaseService