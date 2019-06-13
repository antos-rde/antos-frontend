# Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

# AnTOS Web desktop is is licensed under the GNU General Public
# License v3.0, see the LICENCE file for more information

# This program is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of 
# the License, or (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.

# You should have received a copy of the GNU General Public License
#along with this program. If not, see https://www.gnu.org/licenses/.
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
            me.openDialog new BloggerCategoryDialog(),
            (d) ->
                c =
                    name: d.value,
                    pid: d.p.id,
                    publish: 1
                me.cvcatdb.save c, (r) ->
                    me.error __("Cannot add new category") if r.error
                    me.refreshCVCat()
                    #update the list

            , __("Add category"), { tree: me.cvlist.get "data" }
        
        (@find "cv-cat-edit").set "onbtclick", (e) ->
            cat = me.cvlist.get "selectedItem"
            return unless cat
            me.openDialog new BloggerCategoryDialog(), (d) ->
                c =
                    id: cat.id,
                    publish: cat.publish,
                    pid: d.p.id,
                    name: d.value
                
                me.cvcatdb.save c, (r) ->
                    return me.error __("Cannot Edit category") if r.error
                    me.refreshCVCat()
            , __("Edit category"), { tree: (me.cvlist.get "data"), cat: cat }

        (@find "cv-cat-del").set "onbtclick", (e) ->
            cat = me.cvlist.get "selectedItem"
            return unless cat
            me.openDialog "YesNoDialog",
                (d) ->
                    return unless d
                    me.deleteCVCat cat
            , __("Delete category") ,
            { iconclass: "fa fa-question-circle", text: __("Do you really want to delete: {0}?", cat.name) }
    
        (@find "cv-sec-add").set "onbtclick", (e) ->
            cat = me.cvlist.get "selectedItem"
            return me.notify __("Please select a category") unless cat and cat.id isnt 0
            me.openDialog new BloggerCVSectionDiaglog(), (d) ->
                d.cid = Number cat.id
                d.start = Number d.start
                d.end = Number d.end
                d.publish = 1
                me.cvsecdb.save d, (r) ->
                    return me.error __("Cannot save section: {0}", r.error) if r.error
                    me.CVSectionByCID Number(cat.id)

            , __("New section entry for {0}", cat.name), null

        (@find "cv-sec-move").set "onbtclick", (e) ->
            sec = (me.find "cv-sec-list").get "selected"
            return me.notify __("Please select a section to move") unless sec
            
            me.openDialog new BloggerCategoryDialog(), (d) ->
                c =
                    id: sec.id,
                    cid: d.p.id
                
                me.cvsecdb.save c, (r) ->
                    return me.error __("Cannot move section") if r.error
                    me.CVSectionByCID(sec.cid)
                    (me.find "cv-sec-list").set "selected", -1
            , __("Move to"), { tree: (me.cvlist.get "data"), selonly: true }

        (@find "cv-sec-edit").set "onbtclick", (e) ->
            sec = (me.find "cv-sec-list").get "selected"
            return me.notify __("Please select a section to edit") unless sec
            
            me.openDialog new BloggerCVSectionDiaglog(), (d) ->
                d.cid = Number sec.cid
                d.start = Number d.start
                d.end = Number d.end
                #d.publish = Number sec.publish
                me.cvsecdb.save d, (r) ->
                    return me.error __("Cannot save section: {0}", r.error) if r.error
                    me.CVSectionByCID Number(sec.cid)

            , __("Modify section entry"), sec

        @editor = new SimpleMDE
            element: me.find "markarea"
            autofocus: true
            tabSize: 4
            indentWithTabs: true
            toolbar: [
                {
                    name: __("New"),
                    className: "fa fa-file",
                    action: (e) ->
                        me.bloglist.set "selected", -1
                        me.clearEditor()
                },
                {
                    name: __("Save"),
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
                                return me.error __("Cannot export file for embedding to text") if r.error
                                doc = me.editor.codemirror.getDoc()
                                doc.replaceSelection "![](#{me._api.handler.shared}/#{r.result})"
                        , __("Select image file"), { mimes: ["image/.*"] }
                },
                {
                    name:"Youtube",
                    className: "fa fa-youtube",
                    action: (e) ->
                        doc = me.editor.codemirror.getDoc()
                        doc.replaceSelection "[[youtube:]]"
                }
                "|",
                {
                    name: __("Preview"),
                    className: "fa fa-eye no-disable",
                    action: (e) ->
                        me.previewOn = !me.previewOn
                        SimpleMDE.togglePreview e
                        #/console.log me.select ".editor-preview editor-preview-active"
                        renderMathInElement me.find "editor-container"
                },
                "|",
                {
                    name: __("Send mail"),
                    className: "fa fa-paper-plane",
                    action: (e) ->
                        sel = me.bloglist.get "selected"
                        return me.error __("No post selected") unless sel
                        me.openDialog new BloggerSendmailDiaglog(), (d) ->
                            console.log "test"
                        , __("Send mail"), { content: me.editor.value(), id: sel.id }
                }
            ]
        @bloglist.set "onlistselect", (e) ->
            sel = me.bloglist.get "selected"
            return unless sel
            me.blogdb.get Number(sel.id), (r) ->
                me.error __("Cannot fetch the entry content") if r.error
                me.editor.value atob(r.result.content)
                me.inputtags.value = r.result.tags
                (me.find "blog-publish").set "swon", (if Number(r.result.publish) then true else false)

        @.bloglist.set "onitemclose", (e) ->
            me.openDialog "YesNoDialog", (b) ->
                return unless b
                me.blogdb.delete e.item.item.id, (r) ->
                    return me.error __("Cannot delete: {0}", r.error) if r.error
                    me.bloglist.remove e.item.item, true
                    me.bloglist.set "selected", -1
                    me.clearEditor()
            ,  __("Delete a post") ,
            { iconclass: "fa fa-question-circle", text: __("Do you really want to delete this post ?") }
            return false
        @bindKey "CTRL-S", () ->
            sel = me.tabbar.get "selidx"
            return unless sel is 2
            me.saveBlog()
        @on "vboxchange", () ->
            me.resizeContent()
    # USER TAB
    fetchData: (idx) ->
        me = @
        switch idx
            when 0 #user info
                
                @userdb.get null, (d) ->
                    return me.error __("Cannot fetch user data") if d.error
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
        return @notify __("Full name must be entered") if not @user.fullname or @user.fullname is ""
        #console.log @user
        @userdb.save @user, (r) ->
            return me.error __("Cannot save user data") if r.error
            return me.notify __("User data updated")


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
                return me.notify __("Cannot fetch CV categories")
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
            return me.error __("Cannot delete all content of: {0} [{1}]", cat.name, r.error) if r.error
            cond = ({ "=": { id: v } } for v in ids)
            me.cvcatdb.delete { "or": cond }, (re) ->
                return me.error __("Cannot delete the category: {0} [{1}]", cat.name, re.error) if re.error
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
            return me.notify __("Section list is empty, please add one") if d.error
            v.text = v.title for v in d.result
            items = []
            $(me.find "cv-sec-status").html __("Found {0} sections", d.result.length)
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
                        return me.error __("Cannot delete the section: {0}", r.error) if r.error
                        el.remove e.item.item, true
                ,  __("Delete section") ,
                { iconclass: "fa fa-question-circle", text: __("Do you really want to delete: {0}?",e.item.item.text) }
                return false

            el.set "items", items

    # blog
    saveBlog: () ->
        me = @
        sel = @bloglist.get "selected"
        tags = @inputtags.value
        content = @editor.value()
        title = (new RegExp "^#+(.*)\n", "g").exec content
        return @notify __("Please insert a title in the text: beginning with heading") unless title and title.length is 2
        return @notify __("Please enter tags") if tags is ""
        d = new Date()
        data =
            content: content.asBase64()
            title: title[1].trim()
            tags: tags
            ctime: if sel then sel.ctime else d.timestamp()
            ctimestr: if sel then sel.ctimestr else d.toString()
            utime: d.timestamp()
            utimestr: d.toString()
            rendered: me.process(me.editor.options.previewRender(content))
            publish: if ((@find "blog-publish").get "swon") then 1 else 0
        data.id = sel.id if sel
        #save the data
        @blogdb.save data, (r) ->
            return me.error __("Cannot save blog: {0}", r.error) if r.error
            me.loadBlogs()
    
    process: (text) ->
        # find video tag and rendered it
        embed = (id) ->
            return """
                <iframe
                    class = "embeded-video"
                    width="560" height="315" 
                    src="https://www.youtube.com/embed/#{id}"
                    frameborder="0" allow="encrypted-media" allowfullscreen
                ></iframe>
            """
        re  = /\[\[([^:]*):([^\]]*)\]\]/g
        replace = []
        while (found = re.exec text) isnt null
            replace.push found
        return text.asBase64() unless replace.length > 0
        ret = ""
        begin = 0
        for it in replace
            ret += text.substring begin, it.index
            ret += embed(it[2])
            begin = it.index + it[0].length
        ret += text.substring begin, text.length
        #console.log ret
        return ret.asBase64()
        
    clearEditor:() ->
        @.editor.value ""
        @.inputtags.value = ""
        (@.find "blog-publish").set "swon", false
    # load blog
    loadBlogs: () ->
        me = @
        selidx = @bloglist.get "selidx"
        cond =
            order:
                ctime: "DESC"
            fields: [
                "id",
                "title",
                "ctimestr",
                "ctime",
                "utime",
                "utimestr"
            ]
        @blogdb.find cond, (r) ->
            return me.notify __("No post found: {0}", r.error) if r.error
            for v in r.result
                v.text = v.title
                v.complex = true
                v.closable = true
                v.detail = [
                    { text: __("Created: {0}", v.ctimestr), class: "blog-dates" },
                    { text: __("Updated: {0}", v.utimestr), class: "blog-dates" }]
            me.bloglist.set "items", r.result
            if selidx isnt -1
                me.bloglist.set "selected", selidx
            else
                me.clearEditor()
                me.bloglist.set "selected", -1
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