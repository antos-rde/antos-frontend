class BaseModel
    constructor: (@name, @args) ->
        @observable = riot.observable()
        @_api = self.OS.API
        me = @
        @on "exit", () -> me.quit()
        @host = "#desktop"
        @dialog = undefined

    render: (p) ->
        _GUI.loadScheme p, @, @host

    quit: () ->
        evt = new _GUI.BaseEvent("exit")
        @onexit(evt)
        if not evt.prevent
            delete @.observable
            @dialog.quit() if @dialog
            _PM.kill @

    init: ->
        #implement by sub class
    onexit: (e) ->
        #implement by subclass
   
    one: (e, f) -> @observable.one e, f
    on: (e, f) -> @observable.on e, f

    trigger: (e, d) -> @observable.trigger e, d

    subscribe: (e, f) -> 
        _courrier.on e, f, @

    openDialog: (d, f, title, data) ->
        if @dialog
            @dialog.show()
            return
        if not _GUI.dialog[d]
            @error "Dialog #{d} not found"
            return
        @dialog = new _GUI.dialog[d]()
        @dialog.parent = @
        @dialog.handler = f
        @dialog.pid = @pid
        @dialog.data = data
        @dialog.title = title
        @dialog.init()

    publish: (t, m) ->
        mt = @meta()
        _courrier.trigger t, { id: @pid, name: @name, data: { m: m, icon: mt.icon, iconclass: mt.iconclass } }

    notify: (m) ->
        @publish "notification", m

    warn: (m) ->
        @publish "warning", m

    error: (m) ->
        @publish "error", m + (@_api.throwe @name)
        
    fail: (m) ->
        @publish "fail", m

    throwe: () ->
        @_api.throwe @name
    
    find: (id) -> ($ "[data-id='#{id}']", @scheme)[0] if @scheme
    
this.OS.GUI.BaseModel = BaseModel