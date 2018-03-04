class BaseApplication extends this.OS.GUI.BaseModel
    constructor: (name, args) ->
        super name, args
        _OS.setting.applications[@name] = {} if not _OS.setting.applications[@name]
        @setting = _OS.setting.applications[@name]
        @keycomb =
            ALT: {}
            CTRL: {}
            SHIFT: {}
            META: {}
    init: ->
        me = @
        # first register some base event to the app
        @subscribe "appregistry"
            , ( m ) ->
                me.applySetting m.data.m if (m.name is me.name)

        @on "focus", () ->
            me.sysdock.set "selectedApp", me
            me.appmenu.pid = me.pid
            me.appmenu.set "items", (me.baseMenu() || [])
            me.appmenu.set "onmenuselect", (d) ->
                me.trigger("menuselect", d)
            me.dialog.show() if me.dialog
        @on "hide", () ->
            me.sysdock.set "selectedApp", null
            me.appmenu.set "items", []
            me.dialog.hide() if me.dialog
        @on "menuselect", (d) ->
            switch d.e.item.data.dataid
                when "#{me.name}-about" then me.openDialog "AboutDialog", ()->
                when  "#{me.name}-exit" then me.trigger "exit"
        #now load the scheme
        path = "#{@meta().path}/scheme.html"
        @.render path

    bindKey: (k, f) ->
        arr = k.split "-"
        return unless arr.length is 2
        fnk = arr[0].toUpperCase()
        c = arr[1].toUpperCase()
        return unless @keycomb[fnk]
        @keycomb[fnk][c] = f

    shortcut: (fnk, c, e) ->
        return true unless @keycomb[fnk]
        return true unless @keycomb[fnk][c]
        @keycomb[fnk][c](e)
        return false
    
    applySetting: (k) ->
    registry: (k, v) ->
        @setting[k] = v
        @publish "appregistry", k

    show: () ->
        @trigger "focus"
    
    blur: () ->
        @.appmenu.set "items", [] if @.appmenu and @.pid == @.appmenu.pid
        @trigger "blur"
    
    hide: () ->
        @trigger "hide"
    
    toggle: () ->
        @trigger "toggle"
    
    onexit: (evt) ->
        @cleanup(evt)
        if not evt.prevent
            @.appmenu.set "items", [] if @.pid == @.appmenu.pid
            ($ @scheme).remove()
    meta: () -> _OS.APP[@name].meta
    baseMenu: ->
        mn =
            [{
                text: _OS.APP[@name].meta.name,
                child: [
                    { text: "About", dataid: "#{@name}-about" },
                    { text: "Exit", dataid: "#{@name}-exit" }
                ]
            }]
        mn = mn.concat @menu() || []
        mn
            
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
    cleanup: (e) ->
        #implement by subclasses
        # to handle the exit event
        # use e.preventDefault() to
        # discard the quit command
BaseApplication.type = 1
this.OS.GUI.BaseApplication = BaseApplication