self = this
_PM = self.OS.PM
_APP = self.OS.APP
_MAIL = self.OS.courrier
_GUI  = self.OS.GUI
class BaseModel
    constructor: (@name) ->
        @observable = riot.observable()
        @_api = self.OS.API
        me = @
        @on "exit", () -> me.quit()
        @parent = "#desktop"

    render: (p) ->
        _GUI.loadScheme p, @, @parent

    quit: () ->
        evt = new _GUI.BaseEvent("exit")
        @onexit(evt)
        if not evt.prevent
            delete @.observable
            _PM.kill @

    init: ->
        #implement by sub class
    onexit: (e) ->
        #implement by subclass
    on: (e, f) -> @observable.on e, f

    trigger: (e, d) -> @observable.trigger e, d

    subscribe: (e, f) -> _MAIL.on e, f, @

    publish: (t, m) ->
        mt = @meta()
        _MAIL.trigger t, { id: @pid, name: @name, data: { m: m, icon: mt.icon, iconclass: mt.iconclass } }

    notify: (m) ->
        @publish "notification", m

    warn: (m) ->
        @publish "warning", m

    error: (m) ->
        @publish "error", m
        
    fail: (m) ->
        @publish "fail", m

    
    find: (id) -> ($ "[data-id='#{id}']", @scheme)[0] if @scheme
    
this.OS.GUI.BaseModel = BaseModel