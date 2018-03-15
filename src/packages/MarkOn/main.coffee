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

class MarkOn extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "MarkOn", args
    
    main: () ->
        me = @
        markarea = @find "markarea"
        @container = @find "mycontainer"
        @previewOn = false
        @currfile = if @args and @args.length > 0 then @args[0].asFileHandler() else "Untitled".asFileHandler()
        @editormux = false
        @editor = new SimpleMDE
            element: markarea
            autofocus: true
            tabSize: 4
            indentWithTabs: true
            toolbar: [
                "bold", "italic", "heading", "|", "quote", "code",
                "unordered-list", "ordered-list", "|", "link",
                "image", "table", "horizontal-rule", "|",
                {
                    name: "preview",
                    className: "fa fa-eye no-disable",
                    action: (e) ->
                        me.previewOn = !me.previewOn
                        SimpleMDE.togglePreview e
                        #if(self.previewOn) toggle the highlight
                        #{
                        #    var container = self._scheme.find(self,"Text")
                        #                        .$element.getElementsByClassName("editor-preview");
                        #    if(container.length == 0) return;
                        #    var codes = container[0].getElementsByTagName('pre');
                        #    codes.forEach(function(el){
                        #        hljs.highlightBlock(el);
                        #    });
                        #    //console.log(code);
                        #}
                }
            ]
        
        @editor.codemirror.on "change", () ->
            return if me.editormux
            if me.currfile.dirty is false
                me.currfile.dirty = true
                me.scheme.set "apptitle", "#{me.currfile.basename}*"
        @on "hboxchange", (e) -> me.resizeContent()
        @bindKey "ALT-N", () -> me.actionFile "#{me.name}-New"
        @bindKey "ALT-O", () -> me.actionFile "#{me.name}-Open"
        @bindKey "CTRL-S", () -> me.actionFile "#{me.name}-Save"
        @bindKey "ALT-W", () -> me.actionFile "#{me.name}-Saveas"
        @resizeContent()
        @open @currfile

    resizeContent: () ->
        children = ($ @container).children()
        titlebar = (($ @scheme).find ".afx-window-top")[0]
        toolbar = children[1]
        statusbar = children[4]
        cheight = ($ @scheme).height() - ($ titlebar).height() - ($ toolbar).height() - ($ statusbar).height() - 40
        ($ children[2]).css("height", cheight + "px")
    
    open: (file) ->
        #find table
        return if file.path is "Untitled"
        me = @
        file.dirty = false
        file.read (d) ->
            me.currfile = file
            me.editormux = true
            me.editor.value d
            me.scheme.set "apptitle", "#{me.currfile.basename}"
            me.editormux = false
            

    save: (file) ->
        me = @
        file.write "text/plain", (d) ->
            return me.error __("Error saving file {0}", file.basename) if d.error
            file.dirty = false
            file.text = file.basename
            me.scheme.set "apptitle", "#{me.currfile.basename}"
    
    menu: () ->
        me = @
        menu = [{
                text: "__(File)",
                child: [
                    { text: "__(New)", dataid: "#{@name}-New", shortcut: "A-N" },
                    { text: "__(Open)", dataid: "#{@name}-Open", shortcut: "A-O" },
                    { text: "__(Save)", dataid: "#{@name}-Save", shortcut: "C-S" },
                    { text: "__(Save as)", dataid: "#{@name}-Saveas", shortcut: "A-W" }
                ],
                onmenuselect: (e) -> me.actionFile e.item.data.dataid
            }]
        menu
    
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
                @currfile.cache = @editor.value()
                return @save @currfile if @currfile.basename
                saveas()
            when "#{@name}-Saveas"
                @currfile.cache = @editor.value()
                saveas()
             when "#{@name}-New"
                @currfile = "Untitled".asFileHandler()
                @currfile.cache = ""
                @editor.value("")
    
    cleanup: (evt) ->
        return unless @currfile.dirty
        me = @
        evt.preventDefault()
        @.openDialog "YesNoDialog", (d) ->
            if d
                me.currfile.dirty = false
                me.quit()
        , __("Quit"), { text: __("Quit without saving ?") }

MarkOn.dependencies = [ "mde/simplemde.min" ]

this.OS.register "MarkOn", MarkOn