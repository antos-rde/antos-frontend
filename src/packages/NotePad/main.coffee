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
        @open @currfile
    
    open: (file) ->
        #find table
        i = @findTabByFile file
        return @tabarea.set "selected", i if i isnt -1
        return @newtab file if file.path.toString() is "Untitled"
        me = @
        file.read (_d) ->
            d = if typeof _d is "string" then _d else JSON.stringify _d #TODO
            file.cache = d or ""
            me.newtab file

    save: (file) ->
        me = @
        file.write (file.getb64 "text/plain"), (d) ->
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
                    { text: "Open", dataid: "#{@name}-Open" },
                    { text: "Save", dataid: "#{@name}-Save" },
                    { text: "Save as", dataid: "#{@name}-Saveas" }
                ],
                onmenuselect: (e) -> me.actionFile e
            }]
        menu
    
    actionFile: (e) ->
        me = @
        saveas = () ->
            me.openDialog "FileDiaLog", (d, n) ->
                me.currfile.setPath "#{d}/#{n}"
                me.save me.currfile
            , "Save as", { file: me.currfile }
        switch e.item.data.dataid
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
                

NotePad.singleton = false
this.OS.register "NotePad", NotePad