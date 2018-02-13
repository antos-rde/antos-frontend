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
        @cvlist.set "ontreeselect", (d) ->
            #console.log d
        @bloglist = @find "blog-list"
        @userdb = new @_api.DB("user")
        @cvcatdb = new @_api.DB("cv_cat")
        @tabbar.set "onlistselect", (e) ->
            ($ el).hide() for el in me.containers
            me.fetchData e.idx
            ($ me.containers[e.idx]).show()
            me.trigger "calibrate"

        @tabbar.set "items", [
            { iconclass: "fa fa-user-circle", selected: true },
            { iconclass: "fa fa-info-circle" },
            { iconclass: "fa fa-book" }
        ]
        (@find "bt-user-save").set "onbtclick", (e) ->
            me.saveUser()

        (@find "cv-cat-add").set "onbtclick", (e) ->
            me.openDialog "BloggerCategoryDialog",
            (d) ->
                c =
                    name: d.value,
                    pid: d.p.id,
                    publish: 1
                me.cvcatdb.save c, (r) ->
                    me.error "Cannot add new category" if r.error
                    me.refreshCVCat()
                    #update the list

            , "Add category", { tree: me.cvlist.get "data" }
        
        (@find "cv-cat-edit").set "onbtclick", (e) ->
            cat = me.cvlist.get "selectedItem"
            return unless cat
            me.openDialog "BloggerCategoryDialog", (d) ->
                c =
                    id: cat.id,
                    publish: cat.publish,
                    pid: d.p.id,
                    name: d.value
                
                me.cvcatdb.save c, (r) ->
                    me.error "Cannot Edit category" if r.error
                    me.refreshCVCat()  
            , "Edit category", { tree: (me.cvlist.get "data"), cat: cat }

        (@find "cv-cat-del").set "onbtclick", (e) ->
            cat = me.cvlist.get "selectedItem"
            return unless cat
            me.openDialog "YesNoDialog",
                (d) ->
                    return unless d
                    console.log "delete all child + theirs content"
            , "Delete cagegory" ,
            { iconclass: "fa fa-question-circle", text: "Do you really want to delete: #{cat.name} ?" }
    fetchData: (idx) ->
        me = @
        switch idx
            when 0 #user info
                
                @userdb.get null, (d) ->
                    return me.error "Cannot fetch user data" if d.error
                    me.user = d.result[0]
                    inputs = me.select "[imput-class='user-input']"
                    ($ v).val me.user[v.name] for v in inputs
            when 1 # category
                @refreshCVCat()
            else 
                console.log "Not implemented yet"

    refreshCVCat: () ->
        me = @
        data =
            name: "Porfolio",
            id:0,
            nodes: []
        @cvcatdb.get null, (d) ->
            return me.notify "Cannot fetch CV categories" if d.error
            me.fetchCVCat d.result, data, "0"
            me.cvlist.set "data", data
            it = (me.cvlist.find "pid", "2")[0]
            me.cvlist.set "selectedItem", it

    fetchCVCat: (table, data, id) ->
        result = (v for v in table when v.pid is id)
        return data.nodes = null if result.length is 0
        for v in result
            v.nodes = []
            @fetchCVCat table, v, v.id
            #v.nodes = null if v.nodes.length is 0
            data.nodes.push v
            

    saveUser:() ->
        me = @
        inputs = @select "[imput-class='user-input']"
        @user[v.name] = ($ v).val() for v in inputs
        return @notify "Full name must be entered" if not @user.fullname or @user.fullname is ""
        #console.log @user
        @userdb.save @user, (r) ->
            return me.error "Cannot save user data" if r.error
            return me.notify "User data updated"

Blogger.singleton = true
this.OS.register "Blogger", Blogger