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
            me.editormux = true
            me.editor.value d
            me.scheme.set "apptitle", "#{me.currfile.basename}"
            me.editormux = false
            

    save: (file) ->
        me = @
        file.write (file.getb64 "text/plain"), (d) ->
            return me.error "Error saving file #{file.basename}" if d.error
            file.dirty = false
            file.text = file.basename
            me.scheme.set "apptitle", "#{me.currfile.basename}"
    
    menu: () ->
        me = @
        menu = [{
                text: "File",
                child: [
                    { text: "New", dataid: "#{@name}-New", shortcut: "A-N" },
                    { text: "Open", dataid: "#{@name}-Open", shortcut: "A-O" },
                    { text: "Save", dataid: "#{@name}-Save", shortcut: "C-S" },
                    { text: "Save as", dataid: "#{@name}-Saveas", shortcut: "A-W" }
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
            , "Save as", { file: me.currfile }
        switch e
            when "#{@name}-Open"
                @openDialog "FileDiaLog", ( d, f ) ->
                    me.open "#{d}/#{f}".asFileHandler()
                , "Open file"
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
        , "Quit", { text: "Quit without saving ?" }

MarkOn.dependencies = [ "mde/simplemde.min" ]

this.OS.register "MarkOn", MarkOn