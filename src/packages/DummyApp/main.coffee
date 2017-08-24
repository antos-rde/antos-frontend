_GUI = this.OS.GUI
class DummyApp extends this.OS.GUI.BaseApplication
    constructor: () ->
        super "DummyApp"
    main: () ->
        self = @
        @on "btclick", (e)->
            #_GUI.pushService "Budgy"
            self.openDialog "ColorPickerDialog", (d) -> console.log d
        @on "resize", (w,h)->
            console.log "#{self.name}: resize"
        #@on "listselect", (i)->
        #    console.log self.name, i
        @on "treeselect", (i) ->
            console.log self.name,i
        @on "focus", ()->
            console.log self.name, "is focused"
        @on "dayselect", (e) -> console.log "cellselected", e
        @on "gridselect", (e) -> console.log "GRID selected", e
        tree = @find "mytree"
        
        @scheme.set "apptitle", "Terminal"
        tdata = {
            name: 'My Tree',
            nodes: [
                { name: 'hello', icon:'fa fa-car'},
                { name: 'wat' },
                {
                    name: 'child folder',
                    nodes: [
                        {
                            name: 'child folder',
                            nodes: [
                                { name: 'hello' },
                                { name: 'wat' }
                            ]
                        },
                        { name: 'hello' },
                        { name: 'wat' },
                        {
                            name: 'child folder',
                            nodes: [
                                { name: 'hello' },
                                { name: 'wat' }
                            ]
                        }
                    ]
                }
            ]
        }
        tree.set "*",tdata

        list = @find "mylist"
        ldata = [
            {text:"some thing with avery long text"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"},
            {text:"some thing"}
        ]
        list.set "items",ldata
        list.set "onlistselect", (e)->
            console.log e

        @scheme.set "apptitle", "AntOS feature showcase"

        @scheme.contextmenuHandler = (e, m) ->
            mdata = [ { text: " Child 1" }, { text: "child2", child: [{text: "sub child", child:[{text:"sub sub child"}] }]}]
            m.set "items", mdata
            m.show(e)

DummyApp.singleton = false
this.OS.register "DummyApp",DummyApp