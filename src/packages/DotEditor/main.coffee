class DotEditor extends this.OS.GUI.BaseApplication
    constructor: ( args ) ->
        super "DotEditor", args
        
    main: () ->
        me = @
        @currfile = if @args and @args.length > 0 then @args[0].asFileHandler() else "Untitled".asFileHandler()
        @currfile.dirty = false
        @datarea = @find "datarea"
        @preview = @find "preview"

        @.editor = ace.edit @datarea
        @.editor.setOptions {
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            fontSize: "9pt"
        }
        #@.editor.completers.push { getCompletions: ( editor, session, pos, prefix, callback ) -> }
        @.editor.getSession().setUseWrapMode true
        @editor.session.setMode "ace/mode/dot"
        @editor.setTheme "ace/theme/monokai"
        @editor.on "input", () ->
            if me.editormux
                me.editormux = false
                return false
            if not me.currfile.dirty
                me.currfile.dirty = true
        @editormux = true
        @editor.setValue DotEditor.dummygraph
        @editor.container.addEventListener "keydown", (e) ->
             me.renderSVG true if e.key is ";"
        , true
        
        @bindKey "CTRL-R", () -> me.renderSVG false
        @bindKey "ALT-G", () -> me.export "SVG"
        @bindKey "ALT-P", () -> me.export "PNG"
        @bindKey "ALT-N", () -> me.actionFile "#{me.name}-New"
        @bindKey "ALT-O", () -> me.actionFile "#{me.name}-Open"
        @bindKey "CTRL-S", () -> me.actionFile "#{me.name}-Save"
        @bindKey "ALT-W", () -> me.actionFile "#{me.name}-Saveas"


        @on "hboxchange", () ->
            me.editor.resize()
            me.calibrate()
        @on "focus", () -> me.editor.focus()
        me.renderSVG true
        (@find "btn-zoomin").set "onbtclick", (e) ->
            me.pan.zoomIn() if me.pan
        (@find "btn-zoomout").set "onbtclick", (e) ->
            me.pan.zoomOut() if me.pan
        (@find "btn-reset").set "onbtclick", (e) ->
            me.pan.resetZoom() if me.pan
        @open @currfile
    menu: () ->
        me = @
        menu = [{
                text: "__(File)",
                child: [
                    { text: "__(New)", dataid: "#{@name}-New", shortcut: "A-N" },
                    { text: "__(Open)", dataid: "#{@name}-Open", shortcut: "A-O" },
                    { text: "__(Save)", dataid: "#{@name}-Save", shortcut: "C-S" },
                    { text: "__(Save as)",dataid: "#{@name}-Saveas" , shortcut: "A-W" },
                    { text: "__(Render)", dataid: "#{@name}-Render", shortcut: "C-R" },
                    { 
                        text: "__(Export as)",
                        child: [
                            { text: "SVG", shortcut: "A-G" },
                            { text: "PNG", shortcut: "A-P" }
                        ],
                        onmenuselect: (e) -> me.export e.item.data.text
                    },
                ],
                onmenuselect: (e) -> me.actionFile e.item.data.dataid
            }]
        menu
    open: (file) ->
        return if file.path is "Untitled"
        me = @
        file.dirty = false
        file.read (d) ->
            me.currfile = file
            me.editormux = true
            me.currfile.dirty = false
            me.editor.setValue d
            me.scheme.set "apptitle", "#{me.currfile.basename}"
            me.renderSVG false
    save: (file) ->
        me = @
        file.write "text/plain", (d) ->
            return me.error __("Error saving file {0}", file.basename) if d.error
            file.dirty = false
            file.text = file.basename
            me.scheme.set "apptitle", "#{me.currfile.basename}"

    actionFile: (e) ->
        me = @
        saveas = () ->
            me.openDialog "FileDiaLog", (d, n) ->
                me.currfile.setPath "#{d}/#{n}"
                me.save me.currfile
            , __("Save as"), { file: me.currfile }
        switch e
            when "#{@name}-Open"
                @openDialog "FileDiaLog", ( d, f ) ->
                    me.open "#{d}/#{f}".asFileHandler()
                , __("Open file")
            when "#{@name}-Save"
                @currfile.cache = @editor.getValue()
                return @save @currfile if @currfile.basename
                saveas()
            when "#{@name}-Saveas"
                @currfile.cache = @editor.getValue()
                saveas()
            when "#{@name}-Render"
                me.renderSVG false
            when "#{@name}-New"
                @currfile = "Untitled".asFileHandler()
                @currfile.cache = ""
                @currfile.dirty = false
                @editormux = true
                @editor.setValue("")
    
    export: (t) ->
        me = @
        me.openDialog "PromptDialog", (s) ->
            me._gui.openDialog "FileDiaLog", (d, n) ->
                fp = "#{d}/#{n}".asFileHandler()
                scale = Number(s)
                try
                    switch t
                        when "SVG"
                            fp.cache = Viz me.editor.getValue(), { format: "svg", scale: scale}
                            fp.write "text/plain", (r) ->
                                return me.error __("Cannot export to {0}: {1}", t, r.error) if r.error
                                me.notify __("File exported")
                        when "PNG"
                            content = Viz me.editor.getValue(), { format: "png-image-element", scale: scale}
                            content.onload = () ->
                                fp.cache = @src
                                fp.write "base64", (r) ->
                                    return me.error __("Cannot export to {0}: {1}", t, r.error) if r.error
                                    me.notify __("File exported")
                catch e
                    me.error __("Cannot export: {0}", e.message)
            , __("Export as"), { file: me.currfile }
        , "__(Scale)", { label: "__(Diagram scale)" }
        
       
    renderSVG: (silent) ->
        console.log  "render svg"
        try
            result = Viz @editor.getValue(), { format: "svg", scale: 1 }
            svg = $.parseHTML result
            $(@preview).children("svg").remove()
            $(@preview).append svg
            svg = $(@preview).children("svg")[0]
            @calibrate()
            @pan = svgPanZoom svg, {
                zoomEnabled: true,
                controlIconsEnabled: false,
                fit: true,
                center: true,
                minZoom: 0.1
            }
        catch e
            @error e.message unless silent

    calibrate: () ->
        svg = ($ @preview).children("svg")[0]
        if svg
            prs = [$(@preview).width(), $(@preview).height()]
            $(svg).attr "width", prs[0] + "px"
            $(svg).attr "height", prs[1] + "px"

    cleanup: (evt) ->
        return unless @currfile.dirty
        me = @
        evt.preventDefault()
        @.openDialog "YesNoDialog", (d) ->
            if d
                me.currfile.dirty = false
                me.quit()
        , __("Quit"), { text: __("Quit without saving ?") }

DotEditor.dummygraph = """
graph graphname {
     // This attribute applies to the graph itself
     size="2";
     // The label attribute can be used to change the label of a node
     a [label="Foo"];
     // Here, the node shape is changed.
     b [shape=box];
     // These edges both have different line properties
     a -- b -- c [color=blue];
     b -- d [style=dotted];
     // [style=invis] hides a node.
   }
"""
DotEditor.dependencies = [
    "ace/ace"
]
this.OS.register "DotEditor", DotEditor