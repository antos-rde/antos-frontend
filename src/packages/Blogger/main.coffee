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
        @user = {}
        @cvlist = @find "cv-list"
        @bloglist = @find "blog-list"
        @tabbar.set "onlistselect", (e) ->
            ($ el).hide() for el in me.containers
            me.fetchData e.idx
            ($ me.containers[e.idx]).show()

        @tabbar.set "items", [
            { iconclass: "fa fa-user-circle", selected: true },
            { iconclass: "fa fa-info-circle" },
            { iconclass: "fa fa-book" }
        ]
        (@find "bt-user-save").set "onbtclick", (e) ->
            me.saveUser()
    

    fetchData: (idx) ->
        me = @
        switch idx
            when 0 #user info
                db = new @_api.DB("user")
                db.get null, (d) ->
                    return me.error "Cannot fetch user data" if d.error
                    me.user = d.result[0]
                    inputs = me.select "[imput-class='user-input']"
                    ($ v).val me.user[v.name] for v in inputs
            else 
                console.log "Not implemented yet"

    saveUser:() ->
        me = @
        inputs = @select "[imput-class='user-input']"
        @user[v.name] = ($ v).val() for v in inputs
        return @notify "Full name must be entered" if not @user.fullname or @user.fullname is ""
        db = new @_api.DB("user")
        console.log @user
        db.save @user, (r) ->
            return me.error "Cannot save user data" if r.error
            return me.notify "User data updated"

Blogger.singleton = true
this.OS.register "Blogger", Blogger