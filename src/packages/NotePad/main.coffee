class NotePad extends this.OS.GUI.BaseApplication
    constructor: ( args ) ->
        super "NotePad", args
    main: () ->
        me = @
        @scheme.set "apptitle", "NotePad"
        @sidebar = @find "sidebar"
        @location = @find "location"
        @fileview = @find "fileview"
        div = @find "datarea"
        ace.require "ace/ext/language_tools"
        @currfile = if @args and @args.length > 0 then @args[0].asFileHandler() else "Untitled".asFileHandler()
        @.editor = ace.edit div
        @.editor.setOptions {
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            fontSize: "9pt"
        }
        @.editor.completers.push { getCompletions: ( editor, session, pos, prefix, callback ) -> }
        @.editor.getSession().setUseWrapMode true

        @fileview.contextmenuHandler = (e, m) ->
            m.set "items", me.contextMenu()
            m.set "onmenuselect", (evt) ->
                me.contextAction evt
            m.show e

        @mlist = @find "modelist"
        @modes = ace.require "ace/ext/modelist"
        ldata = []
        f = (m, i) ->
            ldata.push {
                text: m.name,
                mode: m.mode,
                selected: if m.mode is 'ace/mode/text' then true else false
            }
            m.idx = i
        f(m, i) for m, i in @modes.modes
        @mlist.set "items", ldata
        @mlist.set "onlistselect", (e) ->
            me.editor.session.setMode e.data.mode

        themelist = @find "themelist"
        themes = ace.require "ace/ext/themelist"
        ldata = []
        ldata.push {
            text: m.caption,
            mode: m.theme,
            selected: if m.theme is "ace/theme/monokai" then true else false
        } for k, m of themes.themesByName
        themelist.set "onlistselect", (e) ->
            me.editor.setTheme e.data.mode
        themelist.set "items", ldata

        stat = @find "editorstat"
        #status
        stup = (e) ->
            c = me.editor.session.selection.getCursor()
            l = me.editor.session.getLength()
            $(stat).html "Row #{c.row}, col #{c.column}, lines: #{l}"
        stup(0)
        @.editor.getSession().selection.on "changeCursor", (e) -> stup(e)
        @editormux = false
        @editor.on "input", () ->
            if me.editormux
                me.editormux = false
                return false
            if not me.currfile.dirty
                me.currfile.dirty = true
                me.currfile.text += "*"
                me.tabarea.update()

        @on "resize", () -> me.editor.resize()
        @on "focus", () -> me.editor.focus()

        @fileview.set "chdir", (d) -> me.chdir d
        @fileview.set "fetch", (e, f) ->
            return unless e.child
            return if e.child.filename is "[..]"
            e.child.path.asFileHandler().read (d) ->
                return me.error "Resource not found #{e.child.path}" if d.error
                f d.result
        @fileview.set "onfileopen", (e) ->
            return if e.type is "dir"
            me.open e.path.asFileHandler()
        @subscribe "VFS", (d) ->
            p = (me.fileview.get "path").asFileHandler()
            me.chdir p.path if  d.data.file.hash()  is p.hash() or d.data.file.parent().hash() is p.hash()
        @location.set "onlistselect", (e) ->
            me.chdir e.data.path
        @location.set "items", ( i for i in @systemsetting.VFS.mountpoints when i.type isnt "app" )
        @location.set "selected", 0 unless @location.get "selected"
        @tabarea = @find "tabarea"
        @tabarea.set "ontabselect", (e) ->
            me.selecteTab e.idx
        @tabarea.set "onitemclose", (e) ->
            it = e.item.item
            return false unless it
            return me.closeTab it unless it.dirty
            me.openDialog "YesNoDialog", (d) ->
                return me.closeTab it if d
                me.editor.focus()
            , "Close tab", { text: "Close without saving ?" }
            return false
        #@tabarea.set "closable", true
        @bindKey "ALT-N", () -> me.actionFile "#{me.name}-New"
        @bindKey "ALT-O", () -> me.actionFile "#{me.name}-Open"
        @bindKey "CTRL-S", () -> me.actionFile "#{me.name}-Save"
        @bindKey "ALT-W", () -> me.actionFile "#{me.name}-Saveas"
        @open @currfile
    
    open: (file) ->
        #find table
        i = @findTabByFile file
        @fileview.set "preventUpdate", true
        return @tabarea.set "selected", i if i isnt -1
        return @newtab file if file.path.toString() is "Untitled"
        me = @
        file.read (d) ->
            file.cache = d or ""
            me.newtab file

    contextMenu: () ->
        [
            { text: "New file", dataid: "#{@name}-mkf" },
            { text: "New folder", dataid: "#{@name}-mkd" },
            { text: "Delete", dataid: "#{@name}-rm" }
            { text: "Refresh", dataid: "#{@name}-refresh" }
        ]

    contextAction: (e) ->
        me = @
        file = @fileview.get "selectedFile"
        dir = if file then file.path.asFileHandler() else (@fileview.get "path").asFileHandler()
        dir = dir.parent().asFileHandler() if file and file.type isnt "dir"
        switch e.item.data.dataid

            when "#{@name}-mkd"
                @openDialog "PromptDialog",
                    (d) ->
                        dir.mk d, (r) ->
                             me.error "Fail to create #{d}: #{r.error}" if r.error
                    , "New folder"
            
            when "#{@name}-mkf"
                @openDialog "PromptDialog",
                    (d) ->
                        fp = "#{dir.path}/#{d}".asFileHandler()
                        fp.write "", (r) ->
                            me.error "Fail to create #{d}: #{r.error}" if r.error
                    , "New file"
            when "#{@name}-rm"
                return unless file
                @openDialog "YesNoDialog",
                    (d) ->
                        return unless d
                        file.path.asFileHandler()
                            .remove (r) ->
                                me.error "Fail to delete #{file.filename}: #{r.error}" if r.error
                , "Delete" ,
                { iconclass: "fa fa-question-circle", text: "Do you really want to delete: #{file.filename} ?" }
            when "#{@name}-refresh"
                @.chdir ( @fileview.get "path" )

    save: (file) ->
        me = @
        file.write "text/plain", (d) ->
            return me.error "Error saving file #{file.basename}" if d.error
            file.dirty = false
            file.text = file.basename
            me.tabarea.update()

    findTabByFile: (file) ->
        lst = @tabarea.get "items"
        its = ( i for d, i in lst when d.hash() is file.hash() )
        return -1 if its.length is 0
        return its[0]

    closeTab: (it) ->
        @tabarea.remove it, false
        cnt = @tabarea.get "count"
        if cnt is 0
            @open "Untitled".asFileHandler()
            return false
        @tabarea.set "selected", cnt - 1
        return false

    newtab: (file) ->
        file.text = if file.basename then file.basename else file.path
        file.cache = "" unless file.cache
        file.um = new ace.UndoManager()
        @currfile.selected = false
        file.selected = true
        #console.log cnt
        @tabarea.push file, true
        #@currfile = @file
        #TODO: fix problem : @tabarea.set "selected", cnt

    selecteTab: (i) ->
        #return if i is @tabarea.get "selidx"
        file = (@tabarea.get "items")[i]
        return unless file
        @scheme.set "apptitle", file.text.toString()
        #return if file is @currfile
        if @currfile isnt file
            @currfile.cache = @editor.getValue()
            @currfile.cursor = @editor.selection.getCursor()
            @currfile = file

        m = "ace/mode/text"
        m = (@modes.getModeForPath file.path) if file.path.toString() isnt "Untitled"
        @mlist.set "selected", m.idx
        
        @editormux = true
        @editor.setValue file.cache, -1
        @editor.session.setMode m.mode
        @editor.session.setUndoManager file.um
        if file.cursor
            @editor.renderer.scrollCursorIntoView { row: file.cursor.row, column: file.cursor.column }, 0.5
            @editor.selection.moveTo file.cursor.row, file.cursor.column
        @editor.focus()

    chdir: (pth) ->
        #console.log "called", @_api.throwe("FCK")
        return unless pth
        me = @
        dir = pth.asFileHandler()
        dir.read (d) ->
            if(d.error)
                return me.error "Resource not found #{p}"
            if not dir.isRoot()
                p = dir.parent().asFileHandler()
                p.filename = "[..]"
                p.type = "dir"
                #p.size = 0
                d.result.unshift p
            ($ me.navinput).val dir.path
            me.fileview.set "path", pth
            me.fileview.set "data", d.result

    menu: () ->
        me = @
        menu = [{
                text: "File",
                child: [
                    { text: "New", dataid: "#{@name}-New", shortcut: "A-N"  },
                    { text: "Open", dataid: "#{@name}-Open", shortcut: "A-O"  },
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
                file = "#{d}/#{n}".asFileHandler()
                file.cache = me.currfile.cache
                file.dirty = me.currfile.dirty
                file.um = me.currfile.um
                file.cursor = me.currfile.cursor
                file.selected = me.currfile.selected
                file.text = me.currfile.text
                me.tabarea.replaceItem me.currfile, file, false
                me.currfile = file
                me.save me.currfile
            , "Save as", { file: me.currfile }
        switch e
            when "#{@name}-Open"
                @openDialog "FileDiaLog", ( d, f ) ->
                    me.open "#{d}/#{f}".asFileHandler()
                , "Open file"
            when "#{@name}-Save"
                @currfile.cache = @editor.getValue()
                return @save @currfile if @currfile.basename
                saveas()
            when "#{@name}-Saveas"
                @currfile.cache = @editor.getValue()
                saveas()
            when "#{@name}-New"
                @open "Untitled".asFileHandler()
    
    cleanup: (evt) ->
        dirties = ( v for v in  @tabarea.get "items" when v.dirty )
        return if dirties.length is 0
        me = @
        evt.preventDefault()
        @.openDialog "YesNoDialog", (d) ->
            if d
                v.dirty = false for v in dirties
                me.quit()
        , "Quit", { text: "Ignore all #{dirties.length} unsaved files ?" }

NotePad.singleton = false
NotePad.dependencies = [
    "ace/ace",
    "ace/ext-language_tools",
    "ace/ext-modelist",
    "ace/ext-themelist"
]
this.OS.register "NotePad", NotePad