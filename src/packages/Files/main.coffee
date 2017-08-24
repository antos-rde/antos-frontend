_GUI = this.OS.GUI
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

    samples: () ->
        

this.OS.register "Files",Files