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
            me.CVSectionByCID Number(d.id)
        @bloglist = @find "blog-list"
        @userdb = new @_api.DB("user")
        @cvcatdb = new @_api.DB("cv_cat")
        @cvsecdb = new @_api.DB("cv_sections")
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
                    return me.error "Cannot Edit category" if r.error
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
    
        (@find "cv-sec-add").set "onbtclick", (e) ->
            cat = me.cvlist.get "selectedItem"
            return me.notify "Please select a category" unless cat and cat.id isnt 0
            me.openDialog "BloggerCVSectionDiaglog", (d) ->
                d.cid = Number cat.id
                d.start = Number d.start
                d.end = Number d.end
                me.cvsecdb.save d, (r) ->
                    return me.error "Cannot save section: #{r.error}" if r.error
                    me.CVSectionByCID Number(cat.id)

            , "New section entry for #{cat.name}", null

        (@find "cv-sec-edit").set "onbtclick", (e) ->
            sec = (me.find "cv-sec-list").get "selected"
            return me.notify "Please select a section to edit" unless sec
            
            me.openDialog "BloggerCVSectionDiaglog", (d) ->
                d.cid = Number sec.cid
                d.start = Number d.start
                d.end = Number d.end
                me.cvsecdb.save d, (r) ->
                    return me.error "Cannot save section: #{r.error}" if r.error
                    console.log d.cid
                    me.CVSectionByCID Number(sec.cid)

            , "Modify section entry", sec
    # USER TAB
    fetchData: (idx) ->
        me = @
        switch idx
            when 0 #user info
                
                @userdb.get null, (d) ->
                    return me.error "Cannot fetch user data" if d.error
                    me.user = d.result[0]
                    inputs = me.select "[input-class='user-input']"
                    ($ v).val me.user[v.name] for v in inputs
            when 1 # category
                @refreshCVCat()
            else 
                console.log "Not implemented yet"
    
    saveUser:() ->
        me = @
        inputs = @select "[input-class='user-input']"
        @user[v.name] = ($ v).val() for v in inputs
        return @notify "Full name must be entered" if not @user.fullname or @user.fullname is ""
        #console.log @user
        @userdb.save @user, (r) ->
            return me.error "Cannot save user data" if r.error
            return me.notify "User data updated"


    # PORFOLIO TAB
    refreshCVCat: () ->
        me = @
        data =
            name: "Porfolio",
            id:0,
            nodes: []
        @cvcatdb.get null, (d) ->
            if d.error
                me.cvlist.set "data", data
                return me.notify "Cannot fetch CV categories"
            me.fetchCVCat d.result, data, "0"
            me.cvlist.set "data", data
            #it = (me.cvlist.find "pid", "2")[0]
            #me.cvlist.set "selectedItem", it

    fetchCVCat: (table, data, id) ->
        result = (v for v in table when v.pid is id)
        return data.nodes = null if result.length is 0
        for v in result
            v.nodes = []
            @fetchCVCat table, v, v.id
            #v.nodes = null if v.nodes.length is 0
            data.nodes.push v

    CVSectionByCID: (cid) ->
        me = @
        @cvsecdb.find "cid=#{cid} ORDER BY start DESC", (d) ->
            return me.notify "Section list is empty, please add one" if d.error
            v.text = v.title for v in d.result
            items = []
            $(me.find "cv-sec-status").html "Found #{d.result.length} sections"
            for  v in d.result
                v.text = v.title
                v.complex = true
                v.start = Number(v.start)
                v.end = Number(v.end)
                v.detail = []
                v.detail.push { text: v.subtitle, class: "cv-subtitle" } if v.subtitle isnt ""
                v.detail.push { text: "#{v.start} - #{v.end}", class: "cv-period" } if v.start isnt 0 and v.end isnt 0
                v.detail.push { text: v.location, class: "cv-loc" } if v.location isnt ""
                #v.detail.push { text: v.end } if v.end isnt 0
                v.closable = true
                v.detail.push { text: v.content, class: "cv-content" }
                items.push v
            el = me.find "cv-sec-list"
            el.set "onitemclose", (e) ->
                d = me.openDialog "YesNoDialog", (b) ->
                    return unless b
                    me.cvsecdb.delete e.item.item.id, (r) ->
                        return me.error "Cannot delete the section: #{r.error}" if r.error
                        el.remove e.item.item, true
                ,  "Delete section" ,
                { iconclass: "fa fa-question-circle", text: "Do you really want to delete: #{e.item.item.text} ?" }
                return false
            el.set "items", items

Blogger.singleton = true
Blogger.dependencies = [ "mde/simplemde.min" ]
this.OS.register "Blogger", Blogger