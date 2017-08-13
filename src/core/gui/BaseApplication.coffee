self = this
_PM = self.OS.PM
_APP = self.OS.APP
class BaseApplication  
    constructor: (@name) ->
        @observable = riot.observable()
        @pid = 0
        @_api = self.OS.API
    init: ->
        me = @
        # first register some base event to the app
        @on "exit", ()-> me.quit()
        @on "focus", () -> 
            me.sysdock.set "selectedApp", me 
            me.appmenu.pid = me.pid
            me.appmenu.set "items", (me.baseMenu() || [])
            me.appmenu.set "onmenuselect", (d)->
                me.trigger("menuselect",d)
        @on "hide", ()->
            me.sysdock.set "selectedApp", null
            me.appmenu.set "items",[]
        @on "menuselect", (item) ->
            switch item.data.dataid
                when "#{me.name}-about" then alert "About " + me.pid + me.name
                when  "#{me.name}-exit" then me.trigger "exit"
        #now load the scheme
        path = "packages/#{@name}/scheme.html"
        _GUI.loadScheme path ,this

    on: (e,f) -> @observable.on e,f

    trigger:(e,d) -> @observable.trigger e,d
    
    show: () ->
        @observable.trigger "focus"
    
    blur: () ->
        @.appmenu.set "items",[] if @.appmenu and @.pid == @.appmenu.pid
        @observable.trigger "blur"
    
    hide: () ->
        @observable.trigger "hide"
    
    toggle:() ->
        @observable.trigger "toggle"
    
    quit: () ->
        evt = new _GUI.BaseEvent("exit")
        @exit(evt)
        if not evt.prevent
            @.appmenu.set "items",[] if @.pid == @.appmenu.pid
            _PM.kill(@)
            ($ @scheme).remove()
    
    find: (id) -> ($ "[data-id='#{id}']",@scheme)[0]
    
    baseMenu:->
        menu =
            [{
                text:_APP[@name].meta.name, 
                child:[
                    {text:"About", dataid:"#{@name}-about"},
                    {text:"Exit", dataid:"#{@name}-exit"}
                ]
            }]
        menu = menu.concat @menu() || []
        menu
            
    main: ->
        #main program
        # implement by subclasses
    menu: ->
        # implement by subclasses
        # to add menu to application
        []
    open:->
        #implement by subclasses
    data:->
        #implement by subclasses
        # to return app data
    update:->
        #implement by subclasses
    exit: (e) ->
        #implement by subclasses
        # to handle the exit event
        # use e.preventDefault() to
        # discard the quit command
this.OS.GUI.BaseApplication = BaseApplication       