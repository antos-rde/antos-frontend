class Files extends this.OS.GUI.BaseApplication
    constructor: () ->
        super "Files"
    main: () ->
        me = @
        @scheme.set "apptitle", "Files manager"
        @view = @find "fileview"
        @scheme.contextmenuHandler = (e, m) ->
            mdata = [ { text: " Child 1" }, { text: "child2", child: [{text: "sub child", child:[{text:"sub sub child"}] }]}]
            m.set "items", mdata
            m.show(e)
        @on "fileselect", (d) -> console.log d
        #load home directory
        p = 'home:///'
        @_api.VFS.scandir p,
            (d) ->
                me.view.set "path", p
                me.view.set "data", d.result
            , (e, s) ->
                alert "cannot open dir"

    menu: () ->
        me = @
        menu = [
            {
                text: "File",
                child: [
                    { text: "New file", dataid: "#{@name}-mkf" },
                    { text: "New folder", dataid: "#{@name}-mkdir" },
                    { text: "Upload", dataid: "#{@name}-upload" }
                ]
            },
            {
                text: "Edit",
                child: [
                    { text: "Rename", dataid: "#{@name}-mv" },
                    { text: "Delete", dataid: "#{@name}-rm" },
                    { text: "Information", dataid: "#{@name}-info" },
                    { text: "Open with", dataid: "#{@name}-open" },
                    { text: "Download", dataid: "#{@name}-download" },
                ]
            },
            {
                text: "View",
                child: [
                    { text: "Refresh", dataid: "#{@name}-refresh" },
                    { text: "Sidebar", switch: true, dataid: "#{@name}-side" },
                    { text: "Navigation bar", switch: true , dataid: "#{@name}-nav" },
                    { text: "Hidden files", switch: true, dataid: "#{@name}-hidden" },
                    { text: "Type", child: [
                        { text: "Icon view", radio: true, dataid: "#{@name}-icon", type: 'icon' },
                        { text: "List view", radio:true, checked: true, dataid: "#{@name}-list", type: 'list' },
                        { text: "Tree view", radio:true, dataid: "#{@name}-tree", type: 'tree' }
                     ], onmenuselect: (e) ->
                        me.view.set 'view', e.item.data.type
                    },
                ]
            },
        ]
        menu

this.OS.register "Files",Files