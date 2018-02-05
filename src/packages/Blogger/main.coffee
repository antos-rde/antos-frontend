class Blogger extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "Blogger", args
    
    main: () ->
        me = @
        @tabbar = @find "tabbar"
        @containers = [
            @find("user-container"),
            @find("cv-container"),
            @find("blog-container")
        ]
        @cvlist = @find "cv-list"
        @bloglist = @find "blog-list"
        @tabbar.set "onlistselect", (e) ->
            ($ el).hide() for el in me.containers
            ($ me.containers[e.idx]).show()

        @tabbar.set "items", [
            { iconclass: "fa fa-user-circle", selected: true },
            { iconclass: "fa fa-info-circle" },
            { iconclass: "fa fa-book" }
        ]
        (@find "bt-user-save").set "onbtclick", (e) ->
            me.saveUser()
    
    saveUser:() ->
        me = @
        inputs = @select "[imput-class='user-input']"
        data = {}
        data[v.name] = ($ v).val() for v in inputs
        return @notify "Full name must be entered" if not data.fullname or data.fullname is ""
        db = new @_api.DB("user")
        db.save data, (r) ->
            return me.error "Cannot save user data" if r.error
            return me.notify "User data updated"

Blogger.singleton = true
this.OS.register "Blogger", Blogger