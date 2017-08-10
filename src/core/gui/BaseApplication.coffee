class BaseApplication  
    constructor: (@name) ->
        @observable = riot.observable()
    init: ->
        #first load the scheme
        path = "packages/#{@name}/scheme.html"
        @scheme = _GUI.loadScheme path,@observable
        #if(!scheme) bug repporter go here
        @event()
    event: ->
        #implement by subclasses
    on: (e,f) -> @observable.on e,f
    trigger:(e,d) -> @observable.trigger e,d
    open:->
        #implement by subclasses
    data:->
        #implement by subclasses
    update:->
        #implement by subclasses

this.OS.GUI.BaseApplication = BaseApplication        