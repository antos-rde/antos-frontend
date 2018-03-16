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
class GraphEditor extends this.OS.GUI.BaseApplication
    constructor: ( args ) ->
        super "GraphEditor", args
        
    main: () ->
        me = @
        mermaidAPI.initialize { startOnLoad: false }
        @currfile = if @args and @args.length > 0 then @args[0].asFileHandler() else "Untitled".asFileHandler()
        @currfile.dirty = false
        @datarea = @find "datarea"
        @preview = @find "preview"
        @renderlist = @find "render-list"
        @btctn = @find "btn-container"
        @.editor = ace.edit @datarea
        @.editor.setOptions {
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            fontSize: "9pt"
        }
        #@.editor.completers.push { getCompletions: ( editor, session, pos, prefix, callback ) -> }
        @editor.getSession().setUseWrapMode true
        @editor.session.setMode "ace/mode/dot"
        @editor.setTheme "ace/theme/monokai"
        @editor.on "input", () ->
            if me.editormux
                me.editormux = false
                return false
            if not me.currfile.dirty
                me.currfile.dirty = true
        @renderlist.set "onlistselect", (e) ->
            text = ""
            if me.engine() is "Dot"
                text = GraphEditor.dummydot
            else
                text = GraphEditor.dummymermaid

            if not me.currfile.basename
                me.editormux = true
                me.editor.setValue text
            me.renderSVG false
    
        
        @editor.container.addEventListener "keydown", (e) ->
            me.renderSVG true if e.keyCode is 13
        , true
        
        @bindKey "CTRL-R", () -> me.renderSVG false
        @bindKey "ALT-G", () -> me.export "SVG"
        @bindKey "ALT-P", () -> me.export "PNG"
        @bindKey "ALT-N", () -> me.actionFile "#{me.name}-New"
        @bindKey "ALT-O", () -> me.actionFile "#{me.name}-Open"
        @bindKey "CTRL-S", () -> me.actionFile "#{me.name}-Save"
        @bindKey "ALT-W", () -> me.actionFile "#{me.name}-Saveas"
        #@bindKey "CTRL-M", () -> me.svgToCanvas(()->)

        @on "hboxchange", () ->
            me.editor.resize()
            me.calibrate()
        @on "focus", () -> me.editor.focus()
        (@find "btn-zoomin").set "onbtclick", (e) ->
            me.pan.zoomIn() if me.pan
        (@find "btn-zoomout").set "onbtclick", (e) ->
            me.pan.zoomOut() if me.pan
        (@find "btn-reset").set "onbtclick", (e) ->
            me.pan.resetZoom() if me.pan
        
        @renderlist.set "items", [{ text: "Dot", selected: true }, { text: "Mermaid" } ]
        @open @currfile
    engine: () ->
        sel = @renderlist.get "selected"
        sel.text
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
            me.renderlist.set "selected", if file.info.mime.match /.*graphviz/ then 0 else 1
            #me.renderSVG false
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
        me.openDialog "FileDiaLog", (d, n) ->
            fp = "#{d}/#{n}".asFileHandler()
            try
                switch t
                    when "SVG"
                        fp.cache = me.svgtext()
                        fp.write "text/plain", (r) ->
                            return me.error __("Cannot export to {0}: {1}", t, r.error) if r.error
                            me.notify __("File exported")
                    when "PNG"
                        # toDataURL("image/png")
                        me.svgToCanvas (canvas) ->
                            fp.cache = canvas.toDataURL "image/png"
                            console.log fp.cache
                            fp.write "base64", (r) ->
                                return me.error __("Cannot export to {0}: {1}", t, r.error) if r.error
                                me.notify __("File exported")
            catch e
                me.error __("Cannot export: {0}", e.message)
        , __("Export as"), { file: me.currfile }
        
       
    renderSVG: (silent) ->
        svg = undefined
        me = @
        try
            rd = (obj) ->
                $(me.preview).children("svg").remove()
                $(me.preview).append obj
                svg = $(me.preview).children("svg")[0]
                $(svg).prepend($ "<defs>")
                $($(svg).children("defs")[0]).html "<style type='text/css'>#{GraphEditor.css}</style>"
                me.calibrate()
                me.pan = svgPanZoom svg, {
                    zoomEnabled: true,
                    controlIconsEnabled: false,
                    fit: true,
                    center: true,
                    minZoom: 0.1
                }

            if @engine() is "Dot"
                result = Viz @editor.getValue(), { format: "svg", scale: 1 }
                rd($.parseHTML result)
            else
                id = Math.floor(Math.random() * 100000) + 1
                if silent
                    mermaidAPI.parseError = (e, h) ->
                else
                    mermaidAPI.parseError = (e, h) ->
                        me.error e
                mermaidAPI.render "c#{id}", @editor.getValue(), (text, f) ->
                    $(me.preview).append me.btctn
                    rd $($.parseHTML text).attr("style", "")
                , me.preview
        catch e
            @error e.message unless silent

    svgtext: () ->
        svg = $(@preview).children("svg")[0]
        serializer = new XMLSerializer()
        return serializer.serializeToString(svg)
    svgToCanvas: (f) ->
        me = @
        img = new Image()
        svgStr = @svgtext()
        img.onload = () ->
            canvas = me.find "offscreen"
            canvas.width = img.width
            canvas.height = img.height
            canvas.getContext("2d").drawImage img, 0, 0, img.width, img.height
            f(canvas)
        img.src = 'data:image/svg+xml;base64,' + window.btoa(svgStr)
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

GraphEditor.dummydot = """
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
GraphEditor.dummymermaid = """
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
"""
GraphEditor.css = """
<defs><style type="text/css">
 /* <![CDATA[ */.mermaid .label{font-family:'trebuchet ms',verdana,arial;color:#333}.node rect,.node circle,.node ellipse,.node polygon{fill:#cde498;stroke:#13540c;stroke-width:1px}.edgePath .path{stroke:green;stroke-width:1.5px}.edgeLabel{background-color:#e8e8e8}.cluster rect{fill:#cdffb2 !important;rx:4 !important;stroke:#6eaa49 !important;stroke-width:1px !important}.cluster text{fill:#333}.actor{stroke:#13540c;fill:#cde498}text.actor{fill:black;stroke:none}.actor-line{stroke:grey}.messageLine0{stroke-width:1.5;stroke-dasharray:"2 2";marker-end:"url(#arrowhead)";stroke:#333}.messageLine1{stroke-width:1.5;stroke-dasharray:"2 2";stroke:#333}#arrowhead{fill:#333}#crosshead path{fill:#333 !important;stroke:#333 !important}.messageText{fill:#333;stroke:none}.labelBox{stroke:#326932;fill:#cde498}.labelText{fill:black;stroke:none}.loopText{fill:black;stroke:none}.loopLine{stroke-width:2;stroke-dasharray:"2 2";marker-end:"url(#arrowhead)";stroke:#326932}.note{stroke:#6eaa49;fill:#fff5ad}.noteText{fill:black;stroke:none;font-family:'trebuchet ms',verdana,arial;font-size:14px}.section{stroke:none;opacity:.2}.section0{fill:#6eaa49}.section2{fill:#6eaa49}.section1,.section3{fill:white;opacity:.2}.sectionTitle0{fill:#333}.sectionTitle1{fill:#333}.sectionTitle2{fill:#333}.sectionTitle3{fill:#333}.sectionTitle{text-anchor:start;font-size:11px;text-height:14px}.grid .tick{stroke:lightgrey;opacity:.3;shape-rendering:crispEdges}.grid path{stroke-width:0}.today{fill:none;stroke:red;stroke-width:2px}.task{stroke-width:2}.taskText{text-anchor:middle;font-size:11px}.taskTextOutsideRight{fill:black;text-anchor:start;font-size:11px}.taskTextOutsideLeft{fill:black;text-anchor:end;font-size:11px}.taskText0,.taskText1,.taskText2,.taskText3{fill:white}.task0,.task1,.task2,.task3{fill:#487e3a;stroke:#13540c}.taskTextOutside0,.taskTextOutside2{fill:black}.taskTextOutside1,.taskTextOutside3{fill:black}.active0,.active1,.active2,.active3{fill:#cde498;stroke:#13540c}.activeText0,.activeText1,.activeText2,.activeText3{fill:black !important}.done0,.done1,.done2,.done3{stroke:grey;fill:lightgrey;stroke-width:2}.doneText0,.doneText1,.doneText2,.doneText3{fill:black !important}.crit0,.crit1,.crit2,.crit3{stroke:#f88;fill:red;stroke-width:2}.activeCrit0,.activeCrit1,.activeCrit2,.activeCrit3{stroke:#f88;fill:#cde498;stroke-width:2}.doneCrit0,.doneCrit1,.doneCrit2,.doneCrit3{stroke:#f88;fill:lightgrey;stroke-width:2;cursor:pointer;shape-rendering:crispEdges}.doneCritText0,.doneCritText1,.doneCritText2,.doneCritText3{fill:black !important}.activeCritText0,.activeCritText1,.activeCritText2,.activeCritText3{fill:black !important}.titleText{text-anchor:middle;font-size:18px;fill:black}g.classGroup text{fill:#13540c;stroke:none;font-family:'trebuchet ms',verdana,arial;font-size:14px}g.classGroup rect{fill:#cde498;stroke:#13540c}g.classGroup line{stroke:#13540c;stroke-width:1}svg .classLabel .box{stroke:none;stroke-width:0;fill:#cde498;opacity:.5}svg .classLabel .label{fill:#13540c}.relation{stroke:#13540c;stroke-width:1;fill:none}.composition{fill:#13540c;stroke:#13540c;stroke-width:1}#compositionStart{fill:#13540c;stroke:#13540c;stroke-width:1}#compositionEnd{fill:#13540c;stroke:#13540c;stroke-width:1}.aggregation{fill:#cde498;stroke:#13540c;stroke-width:1}#aggregationStart{fill:#cde498;stroke:#13540c;stroke-width:1}#aggregationEnd{fill:#cde498;stroke:#13540c;stroke-width:1}#dependencyStart{fill:#13540c;stroke:#13540c;stroke-width:1}#dependencyEnd{fill:#13540c;stroke:#13540c;stroke-width:1}#extensionStart{fill:#13540c;stroke:#13540c;stroke-width:1}#extensionEnd{fill:#13540c;stroke:#13540c;stroke-width:1}.node text{font-family:'trebuchet ms',verdana,arial;font-size:14px}div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:'trebuchet ms',verdana,arial;font-size:12px;background:#cdffb2;border:1px solid #6eaa49;border-radius:2px;pointer-events:none;z-index:100} /* ]]> */
</style></defs>
"""
GraphEditor.dependencies = [
    "ace/ace"
]
this.OS.register "GraphEditor", GraphEditor