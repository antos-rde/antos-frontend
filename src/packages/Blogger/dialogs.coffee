class BloggerCategoryDialog extends this.OS.GUI.BasicDialog
    constructor: () ->
        super "BloggerCategoryDialog", {
            tags: [
                { tag: "afx-label", att: "data-height = '20', text = 'Pick a parent:'" },
                { tag: "afx-tree-view" },
                { tag: "afx-label", att: "data-height = '20', text = 'Category name:'" },
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
                        return d.notify "Please select a parent category" unless sel
                        val = (d.find "content3").value
                        return d.notify "Please enter category name" if val is ""
                        return d.notify "Parent can not be the category itself" if d.data.cat and d.data.cat.id is sel.id
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