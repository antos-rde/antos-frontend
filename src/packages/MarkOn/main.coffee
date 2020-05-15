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
        if @args and @args.length > 0
            @currfile =  @args[0].path.asFileHandle()
        else
            @currfile = "Untitled".asFileHandle()
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
        file.read()
            .then (d) ->
                me.currfile = file
                me.editormux = true
                me.editor.value d
                me.scheme.set "apptitle", "#{me.currfile.basename}"
                me.editormux = false
            .catch (e) -> me.error e.stack
            

    save: (file) ->
        me = @
        file.write("text/plain")
            .then (d) ->
                return me.error __("Error saving file {0}: {1}", file.basename, d.error) if d.error
                file.dirty = false
                file.text = file.basename
                me.scheme.set "apptitle", "#{me.currfile.basename}"
            .catch (e) -> me.error e.stack
    
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
                onchildselect: (e) -> me.actionFile e.data.item.get("data").dataid
            }]
        menu
    
    actionFile: (e) ->
        me = @
        saveas = () ->
            me.openDialog("FileDialog", {
                title: __("Save as"),
                file: me.currfile
            })
            .then (f) ->
                d = f.file.path.asFileHandle()
                d = d.parent() if f.file.type is "file"
                me.currfile.setPath "#{d.path}/#{f.name}"
                console.log me.currfile
                me.save me.currfile
            .catch (e) ->
                me.error e.stack

        switch e
            when "#{@name}-Open"
                @openDialog("FileDialog", {
                    title: __("Open file")
                })
                .then (f) ->
                    me.open f.file.path.asFileHandle()

            when "#{@name}-Save"
                @currfile.cache = @editor.value()
                return @save @currfile if @currfile.basename
                saveas()
            when "#{@name}-Saveas"
                @currfile.cache = @editor.value()
                saveas()
             when "#{@name}-New"
                @currfile = "Untitled".asFileHandle()
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

MarkOn.dependencies = [
    "os://scripts/mde/simplemde.min.js",
    "os://scripts/mde/simplemde.min.css"
]

this.OS.register "MarkOn", MarkOn