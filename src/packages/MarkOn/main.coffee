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
                    action: (e) =>
                        @previewOn = !@previewOn
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
        
        @editor.codemirror.on "change", () =>
            return if @editormux
            if @currfile.dirty is false
                @currfile.dirty = true
                @scheme.set "apptitle", "#{@currfile.basename}*"
        @on "hboxchange", (e) => @resizeContent()
        @bindKey "ALT-N", () => @actionFile "#{@name}-New"
        @bindKey "ALT-O", () => @actionFile "#{@name}-Open"
        @bindKey "CTRL-S", () => @actionFile "#{@name}-Save"
        @bindKey "ALT-W", () => @actionFile "#{@name}-Saveas"
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
        file.dirty = false
        file.read()
            .then (d) =>
                @currfile = file
                @editormux = true
                @editor.value d
                @scheme.set "apptitle", "#{@currfile.basename}"
                @editormux = false
            .catch (e) => @error __("Unable to open: {0}", file.path), e
            

    save: (file) ->
        file.write("text/plain")
            .then (d) =>
                return @error __("Error saving file {0}: {1}", file.basename, d.error) if d.error
                file.dirty = false
                file.text = file.basename
                @scheme.set "apptitle", "#{@currfile.basename}"
            .catch (e) => @error __("Unable to save file: {0}", file.path), e
    
    menu: () ->
        menu = [{
                text: "__(File)",
                child: [
                    { text: "__(New)", dataid: "#{@name}-New", shortcut: "A-N" },
                    { text: "__(Open)", dataid: "#{@name}-Open", shortcut: "A-O" },
                    { text: "__(Save)", dataid: "#{@name}-Save", shortcut: "C-S" },
                    { text: "__(Save as)", dataid: "#{@name}-Saveas", shortcut: "A-W" }
                ],
                onchildselect: (e) => @actionFile e.data.item.get("data").dataid
            }]
        menu
    
    actionFile: (e) ->
        saveas = () =>
            @openDialog("FileDialog", {
                title: __("Save as"),
                file: @currfile
            })
            .then (f) =>
                d = f.file.path.asFileHandle()
                d = d.parent() if f.file.type is "file"
                @currfile.setPath "#{d.path}/#{f.name}"
                @save @currfile

        switch e
            when "#{@name}-Open"
                @openDialog("FileDialog", {
                    title: __("Open file")
                })
                .then (f) =>
                    @open f.file.path.asFileHandle()

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
        evt.preventDefault()
        @.openDialog "YesNoDialog", (d) =>
            if d
                @currfile.dirty = false
                @quit()
        , __("Quit"), { text: __("Quit without saving ?") }

MarkOn.dependencies = [
    "os://scripts/mde/simplemde.min.js",
    "os://scripts/mde/simplemde.min.css"
]

this.OS.register "MarkOn", MarkOn