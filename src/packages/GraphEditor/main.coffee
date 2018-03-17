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
        #mermaid.initialize { startOnLoad: false }
        mermaid.initialize {
            theme: 'forest'
        }
        @currfile = if @args and @args.length > 0 then @args[0].asFileHandler() else "Untitled".asFileHandler()
        @currfile.dirty = false
        @datarea = @find "datarea"
        @preview = @find "preview"
        @btctn = @find "btn-container"
        @.editor = ace.edit @datarea
        @.editor.setOptions {
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            fontSize: "10pt"
        }
        #@.editor.completers.push { getCompletions: ( editor, session, pos, prefix, callback ) -> }
        @editor.getSession().setUseWrapMode true
        @editor.session.setMode "ace/mode/text"
        @editor.setTheme "ace/theme/monokai"
        @editor.on "input", () ->
            if me.editormux
                me.editormux = false
                return false
            if not me.currfile.dirty
                me.currfile.dirty = true


        if not me.currfile.basename
            me.editormux = true
            me.editor.setValue GraphEditor.dummymermaid
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
        @bindKey "CTRL-M", () -> me.svgToCanvas(()->)

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
                            try
                                fp.cache = canvas.toDataURL "image/png"
                                fp.write "base64", (r) ->
                                    return me.error __("Cannot export to {0}: {1}", t, r.error) if r.error
                                    me.notify __("File exported")
                            catch e
                                me.error __("Cannot export to PNG in this browser: {0}", e.message)
            catch e
                me.error __("Cannot export: {0}", e.message)
        , __("Export as"), { file: me.currfile }
        
       
    renderSVG: (silent) ->
        me = @
        id = Math.floor(Math.random() * 100000) + 1
        if silent
            mermaid.parseError = (e, h) ->
        else
            mermaid.parseError = (e, h) ->
                me.error e
        mermaid.render "c#{id}", @editor.getValue(), (text, f) ->
            me.preview.innerHTML = text
            $(me.preview).append me.btctn
            me.calibrate()
            svg = $(me.preview).children("svg")[0]
            $(svg).attr("style", "")
            me.pan = svgPanZoom svg, {
                zoomEnabled: true,
                controlIconsEnabled: false,
                fit: true,
                center: true,
                minZoom: 0.1
            }
            #rd $($.parseHTML text).
        , me.preview

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
        img.src = 'data:image/svg+xml;base64,' + btoa(svgStr)
        
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

GraphEditor.dummymermaid = """
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
"""
GraphEditor.dependencies = [
    "ace/ace"
]
this.OS.register "GraphEditor", GraphEditor