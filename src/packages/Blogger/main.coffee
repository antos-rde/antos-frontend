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
        @inputtags = @.find "input-tags"
        @bloglist = @find "blog-list"
        @userdb = new @_api.DB("user")
        @cvcatdb = new @_api.DB("cv_cat")
        @cvsecdb = new @_api.DB("cv_sections")
        @blogdb = new @_api.DB("blogs")
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
                    me.deleteCVCat cat
            , "Delete cagegory" ,
            { iconclass: "fa fa-question-circle", text: "Do you really want to delete: #{cat.name} ?" }
    
        (@find "cv-sec-add").set "onbtclick", (e) ->
            cat = me.cvlist.get "selectedItem"
            return me.notify "Please select a category" unless cat and cat.id isnt 0
            me.openDialog "BloggerCVSectionDiaglog", (d) ->
                d.cid = Number cat.id
                d.start = Number d.start
                d.end = Number d.end
                d.publish = 1
                me.cvsecdb.save d, (r) ->
                    return me.error "Cannot save section: #{r.error}" if r.error
                    me.CVSectionByCID Number(cat.id)

            , "New section entry for #{cat.name}", null

        (@find "cv-sec-move").set "onbtclick", (e) ->
            sec = (me.find "cv-sec-list").get "selected"
            return me.notify "Please select a section to move" unless sec
            
            me.openDialog "BloggerCategoryDialog", (d) ->
                c =
                    id: sec.id,
                    cid: d.p.id
                
                me.cvsecdb.save c, (r) ->
                    return me.error "Cannot move section" if r.error
                    me.CVSectionByCID(sec.cid)
                    (me.find "cv-sec-list").set "selected", -1
            , "Move to", { tree: (me.cvlist.get "data"), selonly: true }

        (@find "cv-sec-edit").set "onbtclick", (e) ->
            sec = (me.find "cv-sec-list").get "selected"
            return me.notify "Please select a section to edit" unless sec
            
            me.openDialog "BloggerCVSectionDiaglog", (d) ->
                d.cid = Number sec.cid
                d.start = Number d.start
                d.end = Number d.end
                d.publish = Number sec.publish
                me.cvsecdb.save d, (r) ->
                    return me.error "Cannot save section: #{r.error}" if r.error
                    me.CVSectionByCID Number(sec.cid)

            , "Modify section entry", sec

        @editor = new SimpleMDE
            element: me.find "markarea"
            autofocus: true
            tabSize: 4
            indentWithTabs: true
            toolbar: [
                {
                    name: "new",
                    className: "fa fa-file",
                    action: (e) ->
                        me.bloglist.set "selected", -1
                        me.editor.value ""
                        me.inputtags.value = ""
                },
                {
                    name: "save",
                    className: "fa fa-save",
                    action: (e) ->
                        me.saveBlog()
                }
                , "|", "bold", "italic", "heading", "|", "quote", "code",
                "unordered-list", "ordered-list", "|", "link",
                "image", "table", "horizontal-rule",
                {
                    name: "image",
                    className: "fa fa-file-image-o",
                    action: (e) ->
                        me.openDialog "FileDiaLog", (d, n, p) ->
                            p.asFileHandler().publish (r) ->
                                return me.error "Cannot export file for embeding to text" if r.error
                                doc = me.editor.codemirror.getDoc()
                                doc.replaceSelection "![](#{me._api.handler.shared}/#{r.result})"
                        , "Select image file", { mimes: ["image/.*"] }
                },
                "|",
                {
                    name: "preview",
                    className: "fa fa-eye no-disable",
                    action: (e) ->
                        me.previewOn = !me.previewOn
                        SimpleMDE.togglePreview e
                }
            ]
        @bloglist.set "onlistselect", (e) ->
            sel = me.bloglist.get "selected"
            return unless sel
            me.editor.value atob(sel.content)
            me.inputtags.value = sel.tags

        @on "vboxchange", () ->
            me.resizeContent()
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
                @loadBlogs()
    
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
        cnd =
            order:
                name: "ASC"
        @cvcatdb.find cnd, (d) ->
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

    deleteCVCat: (cat) ->
        me = @
        ids = []
        func = (c) ->
            ids.push c.id
            func(v) for v in c.nodes if c.nodes
        func(cat)
        
        cond = ({ "=": { cid: v } } for v in ids)
        # delete all content
        @cvsecdb.delete { "or": cond }, (r) ->
            return me.error "Cannot delete all content of: #{cat.name} [#{r.error}]" if r.error
            cond = ({ "=": { id: v } } for v in ids)
            me.cvcatdb.delete { "or": cond }, (re) ->
                return me.error "Cannot delete the category: #{cat.name} [#{re.error}]" if re.error
                me.refreshCVCat()

    CVSectionByCID: (cid) ->
        me = @
        cond =
            exp:
                "=":
                    cid: cid
            order:
                start: "DESC"
        @cvsecdb.find cond, (d) ->
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
                if v.start isnt 0 and v.end isnt 0
                    v.detail.push { text: "#{v.start} - #{v.end}", class: "cv-period" } 
                else
                    v.detail.push { text: "", class: "cv-period" }
                v.detail.push { text: v.location, class: "cv-loc" } if v.location isnt ""
                #v.detail.push { text: v.end } if v.end isnt 0
                v.closable = true
                v.detail.push { text: v.content, class: "cv-content" }
                items.push v
            el = me.find "cv-sec-list"
            el.set "onitemclose", (e) ->
                me.openDialog "YesNoDialog", (b) ->
                    return unless b
                    me.cvsecdb.delete e.item.item.id, (r) ->
                        return me.error "Cannot delete the section: #{r.error}" if r.error
                        el.remove e.item.item, true
                ,  "Delete section" ,
                { iconclass: "fa fa-question-circle", text: "Do you really want to delete: #{e.item.item.text} ?" }
                return false
            el.set "items", items

    # blog
    saveBlog: () ->
        me = @
        sel = @bloglist.get "selected"
        tags = @inputtags.value
        content = @editor.value()
        title = (new RegExp "^#+(.*)\n", "g").exec content
        return @notify "Please insert a title in the text: beginning with heading" unless title and title.length is 2
        return @notify "Please enter tags" if tags is ""
        d = new Date()
        data =
            content: content.asBase64()
            title: title[1].trim()
            tags: tags
            ctime: if sel then sel.ctime else d.timestamp()
            ctimestr: if sel then sel.ctimestr else d.toString()
            utime: d.timestamp()
            utimestr: d.toString()
            rendered: me.editor.options.previewRender(content).asBase64()
        data.id = sel.id if sel
        
        #save the data
        @blogdb.save data, (r) ->
            return me.error "Cannot save blog: #{r.error}" if r.error
            me.loadBlogs()

    # load blog
    loadBlogs: () ->
        me = @
        cond =
            order:
                ctime: "DESC"
        @blogdb.find cond, (r) ->
            return me.notify "No post found: #{r.error}" if r.error
            for v in r.result
                v.text = v.title
                v.complex = true
                v.closable = true
                v.content = v.content.unescape()
                v.detail = [
                    { text: "Created: #{v.ctimestr}", class: "blog-dates" },
                    { text: "Updated: #{v.utimestr}", class: "blog-dates" }]
            me.bloglist.set "onitemclose", (e) ->
                me.openDialog "YesNoDialog", (b) ->
                    return unless b
                    me.blogdb.delete e.item.item.id, (r) ->
                        return me.error "Cannot delete: #{r.error}" if r.error
                        me.bloglist.remove e.item.item, true
                        me.bloglist.set "selected", -1
                        me.editor.value ""
                        me.inputtags.value = ""
                ,  "Delete a post" ,
                { iconclass: "fa fa-question-circle", text: "Do you really want to delete this post ?" }
                return false
            me.bloglist.set "items", r.result

    resizeContent: () ->
        container = @find "editor-container"
        children = ($ container).children()
        titlebar = (($ @scheme).find ".afx-window-top")[0]
        toolbar = children[1]
        statusbar = children[4]
        cheight = ($ @scheme).height() - ($ titlebar).height() - ($ toolbar).height() - ($ statusbar).height() - 90
        ($ children[2]).css("height", cheight + "px")
Blogger.singleton = true
Blogger.dependencies = [ "mde/simplemde.min" ]
this.OS.register "Blogger", Blogger