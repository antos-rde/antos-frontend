class BloggerCategoryDialog extends this.OS.GUI.BasicDialog
    constructor: () ->
        super "BloggerCategoryDialog", {
            tags: [
                { tag: "afx-label", att: "data-height = '20', text = 'Pick a parent'" },
                { tag: "afx-tree-view" },
                { tag: "afx-label", att: "data-height = '20', text = 'Category name'" },
                { tag: "input", att: "type = 'text' data-height = '20'" }
            ],
            width: 200,
            height: 300,
            resizable: true,
            buttons: [
                {
                    label: "0k",
                    onclick: (d) ->
                        sel = (d.find "content1").get "selectedItem"
                        return d.notify __("Please select a parent category") unless sel
                        val = (d.find "content3").value
                        return d.notify __("Please enter category name") if val is "" and not d.data.selonly
                        return d.notify __("Parent can not be the category itself") if d.data.cat and d.data.cat.id is sel.id
                        d.handler { p: sel, value: val } if d.handler
                        d.quit()
                },
                {
                    label: "Cancel",
                    onclick: (d) -> d.quit()
                }
            ],
            filldata: (d) ->
                return unless d.data
                #console.log d.data
                tree = d.find "content1"
                tree.set "data", d.data.tree if d.data.tree
                if d.data.cat
                    it = (tree.find "id", d.data.cat.pid)[0]
                    tree.set "selectedItem", it
                    (d.find "content3").value = d.data.cat.name
                #(d.find "content0").set "text", d.data.label
                #(d.find "content1").value = d.data.value if d.data.value
            xtra: (d) ->
                $( d.find "content3" ).keyup (e) ->
                    (d.find "bt0").trigger() if e.which is 13
        }

        
this.OS.register "BloggerCategoryDialog", BloggerCategoryDialog

# This dialog is use for cv section editing

class BloggerCVSectionDiaglog extends this.OS.GUI.BaseDialog
    constructor: () ->
        super "BloggerCVSectionDiaglog"

    init: () ->
        @render "#{@path()}/cvsection.html"

    main: () ->
        me = @
        @scheme.set "apptitle", @title
        @editor = new SimpleMDE
            element: @find "contentarea"
            status: false
            toolbar: false
        ($ (@select '[class = "CodeMirror-scroll"]')[0]).css "min-height", "50px"
        ($ (@select '[class="CodeMirror cm-s-paper CodeMirror-wrap"]')[0]).css "min-height", "50px"
        @on "vboxchange", () ->
            me.resizeContent()
            
        inputs = me.select "[input-class='user-input']"
        (($ v).val me.data[v.name] for v in inputs ) if me.data
        @editor.value me.data.content if me.data and me.data.content
        (@find "bt-cv-sec-save").set "onbtclick", (e) ->
            data = {}
            console.log inputs
            data[v.name] = ($ v).val() for v in inputs
            data.content = me.editor.value()
            return me.notify __("Title or content must not be blank") if data.title is "" and data.content is ""
            #return me.notify "Content must not be blank" if data.content is ""
            data.id = me.data.id if me.data and me.data.id
            me.handler data if me.handler
            me.quit()
        me.resizeContent()
    resizeContent: () ->
        container = @find "editor-container"
        children = ($ container).children()
        cheight = ($ container).height() - 30
        ($ children[1]).css("height", cheight + "px")
this.OS.register "BloggerCVSectionDiaglog", BloggerCVSectionDiaglog