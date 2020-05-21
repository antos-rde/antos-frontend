Ant = this

class CodePad extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "CodePad", args
        @currfile = "Untitled".asFileHandle()
        @currdir = undefined
        if @args and @args.length > 0
            if @args[0].type is "dir"
                @currdir = @args[0].path.asFileHandle()
            else
                @currfile = @args[0].path.asFileHandle()
                @currdir = @currfile.parent()

    main: () ->
        @extensions = {}
        @fileview = @find("fileview")
        @sidebar = @find("sidebar")
        @tabbar = @find "tabbar"
        @langstat = @find "langstat"
        @editorstat = @find "editorstat"

        @fileview.set "fetch", (path) ->
            new Promise (resolve, reject) ->
                dir = path
                dir = path.asFileHandle() if typeof path is "string"
                dir.read().then (d) ->
                    return reject d.error if d.error
                    resolve d.result
                .catch (e) -> reject e
        @setup()

    setup: () ->
        ace.config.set('basePath', '/scripts/ace')
        ace.require "ace/ext/language_tools"
        @editor = ace.edit @find("datarea")
        @editor.setOptions {
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            highlightActiveLine: true,
            highlightSelectedWord: true,
            behavioursEnabled: true,
            wrap: true,
            fontSize: "11pt",
            showInvisibles: true
        }
        #themes = ace.require "ace/ext/themelist"
        @editor.setTheme "ace/theme/monokai"
        @modes = ace.require "ace/ext/modelist"
        @editor.completers.push { getCompletions: ( editor, session, pos, prefix, callback ) -> }
        @editor.getSession().setUseWrapMode true
        @editormux = false
        @editor.on "input", () =>
            if @editormux
                @editormux = false
                return false
            if not @currfile.dirty
                @currfile.dirty = true
                @currfile.text += "*"
                @tabbar.update()
        @editor.getSession().selection.on "changeCursor", (e) =>
            @updateStatus()
        
        @tabbar.set "ontabselect", (e) =>
            @selecteTab $(e.data.item).index()
        @tabbar.set "ontabclose", (e) =>
            it = e.data.item
            return false unless it
            return @closeTab it unless it.get("data").dirty
            @openDialog("YesNoDialog", {
                title: __("Close tab"),
                text: __("Close without saving ?")
            }).then (d) =>
                return @closeTab it if d
                @editor.focus()
            return false
        @fileview.set "onfileopen", (e) =>
            return unless e.data and e.data.path
            return if e.data.type is "dir"
            @openFile e.data.path.asFileHandle()

        @fileview.set "onfileselect", (e) =>
            return unless e.data and e.data.path
            return if e.data.type is "dir"
            i = @findTabByFile e.data.path.asFileHandle()
            return @tabbar.set "selected", i if i isnt -1

        @on "resize", () => @editor.resize()
        @on "focus", () => @editor.focus()
        @spotlight = new CMDMenu __("Command palette")
        @bindKey "ALT-P", () => @spotlight.run @
        @find("datarea").contextmenuHandle = (e, m) =>
            m.set "items", [{
                text: __("Command palete"),
                onmenuselect: (e) =>
                    @spotlight.run @
            }]
            m.show e

        @fileview.contextmenuHandle = (e, m) =>
            m.set "items", [
                { text: "__(New file)", id: "new" },
                { text: "__(New folder)", id: "newdir" },
                { text: "__(Rename)", id: "rename" },
                { text: "__(Delete)", id: "delete" }
            ]
            m.set "onmenuselect", (e) =>
                @ctxFileMenuHandle e
            m.show e

        @bindKey "ALT-N", () =>  @menuAction "new"
        @bindKey "ALT-O", () =>  @menuAction "open"
        @bindKey "ALT-F", () =>  @menuAction "opendir"
        @bindKey "CTRL-S", () => @menuAction "save"
        @bindKey "ALT-W", () =>  @menuAction "saveas"

        @fileview.set "ondragndrop", (e) =>
            src = e.data.from.get("data").path.asFileHandle()
            des = e.data.to.get("data").path
            src.move "#{des}/#{src.basename}"
                .then (d) ->
                    e.data.to.update des
                    e.data.from.get("parent").update src.parent().path
                .catch (e) => @error __("Unable to move file/folder"), e

        @on "filechange", (data) =>
            path = data.file.path
            path = data.file.parent().path if data.type is "file"
            @fileview.update path


        @loadExtensionMetaData()
        @initCommandPalete()
        @initSideBar()
        @openFile @currfile

    openFile: (file) ->
        #find tab
        i = @findTabByFile file
        return @tabbar.set "selected", i if i isnt -1
        return @newTab file if file.path.toString() is "Untitled"

        file.read()
            .then (d) =>
                file.cache = d or ""
                @newTab file
            .catch (e) =>
                @error __("Unable to open: {0}", file.path), e
    
    findTabByFile: (file) ->
        lst = @tabbar.get "items"
        its = ( i for d, i in lst when d.hash() is file.hash() )
        return -1 if its.length is 0
        return its[0]

    newTab: (file) ->
        file.text = if file.basename then file.basename else file.path
        file.cache = "" unless file.cache
        file.um = new ace.UndoManager()
        @currfile.selected = false
        file.selected = true
        #console.log cnt
        @tabbar.push file

    closeTab: (it) ->
        @tabbar.remove it
        cnt = @tabbar.get("items").length

        if cnt is 0
            @openFile "Untitled".asFileHandle()
            return false
        @tabbar.set "selected", cnt - 1
        return false

    selecteTab: (i) ->
        #return if i is @tabbar.get "selidx"
        file = (@tabbar.get "items")[i]
        return unless file
        @scheme.set "apptitle", file.text.toString()
        #return if file is @currfile
        if @currfile isnt file
            @currfile.cache = @editor.getValue()
            @currfile.cursor = @editor.selection.getCursor()
            @currfile.selected = false
            @currfile = file

        if not file.langmode
            if file.path.toString() isnt "Untitled"
                m = @modes.getModeForPath(file.path)
                file.langmode = { caption: m.caption, mode: m.mode }
            else
                file.langmode   = { caption: "Text", mode: "ace/mode/text" }
        @editormux = true
        @editor.getSession().setUndoManager new ace.UndoManager()
        @editor.setValue file.cache, -1
        @editor.getSession().setMode file.langmode.mode
        if file.cursor
            @editor.renderer.scrollCursorIntoView {
                row: file.cursor.row, column: file.cursor.column
            }, 0.5
            @editor.selection.moveTo file.cursor.row, file.cursor.column
        @editor.getSession().setUndoManager file.um
        @updateStatus()
        @editor.focus()

    updateStatus: () ->
        c = @editor.session.selection.getCursor()
        l = @editor.session.getLength()
        @editorstat.set "text", __("Row {0}, col {1}, lines: {2}", c.row + 1, c.column + 1, l)
        @langstat.set "text", @currfile.langmode.caption

    initSideBar: () ->
        if @currdir
            $(@sidebar).show()
            @fileview.set "path", @currdir.path
        else
            $(@sidebar).hide()
        @trigger "resize"

    addAction: (action) ->
        @spotlight.addAction action
        @

    addActions: (list) ->
        @spotlight.addActions list
        @

    initCommandPalete: () ->
        themes = ace.require "ace/ext/themelist"
        cmdtheme = new CMDMenu __("Change theme")
        cmdtheme.addAction { text: v.caption, theme: v.theme } for k, v of themes.themesByName
        cmdtheme.onchildselect (d, r) ->
            data = d.data.item.get("data")
            r.editor.setTheme data.theme
            r.editor.focus()
        @spotlight.addAction cmdtheme
        cmdmode = new CMDMenu __("Change language mode")
        cmdmode.addAction { text: v.caption, mode: v.mode } for v in @modes.modes
        cmdmode.onchildselect (d, r) ->
            data = d.data.item.get("data")
            r.editor.session.setMode data.mode
            r.currfile.langmode = { caption: data.text, mode: data.mode }
            r.updateStatus()
            r.editor.focus()
        @spotlight.addAction cmdmode
        @addAction CMDMenu.fromMenu @fileMenu()
    
    loadExtensionMetaData: () ->
        "#{@meta().path}/extensions.json"
            .asFileHandle()
            .read("json")
            .then (d) =>
                for ext in d
                    if @extensions[ext.name]
                        @extensions[ext.name].child = []
                        @extensions[ext.name].addAction v for v in ext.actions
                    else
                        @extensions[ext.name] = new CMDMenu ext.text
                        @extensions[ext.name].name = ext.name
                        @extensions[ext.name].addAction v for v in ext.actions
                        @spotlight.addAction @extensions[ext.name]
                        @extensions[ext.name].onchildselect (e) =>
                            @loadAndRunExtensionAction e.data.item.get "data"
            .catch (e) =>
                @error __("Cannot load extension meta data"), e

    runExtensionAction: (name, action) ->
        return @error __("Unable to find extension: {0}", name) unless CodePad.extensions[name]
        ext = new CodePad.extensions[name](@)
        return @error __("Unable to find action: {0}", action) unless ext[action]
        ext.preload()
            .then () ->
                ext[action]()
            .catch (e) =>
                @error __("Unable to preload extension"), e

    loadAndRunExtensionAction: (data) ->
        name = data.parent.name
        action = data.name
        #verify if the extension is load
        if not CodePad.extensions[name]
            #load the extension
            path = "#{@meta().path}/extensions/#{name}.js"
            @_api.requires path
                .then () => @runExtensionAction name, action
                .catch (e) =>
                    @error __("unable to load extension: {0}", name), e
        else
            @runExtensionAction name, action

    fileMenu: () ->
        {
            text: __("File"),
            child: [
                { text: __("New"), dataid: "new", shortcut: "A-N" },
                { text: __("Open"), dataid: "open", shortcut: "A-O" },
                { text: __("Open Folder"), dataid: "opendir", shortcut: "A-F" },
                { text: __("Save"), dataid: "save", shortcut: "C-S" },
                { text: __("Save as"), dataid: "saveas", shortcut: "A-W" }
            ],
            onchildselect: (e, r) =>
                @menuAction e.data.item.get("data").dataid, r
        }
    
    ctxFileMenuHandle: (e) ->
        el = e.data.item
        return unless el
        data = el.get("data")
        return unless data
        file = @fileview.get "selectedFile"
        dir = @currdir
        dir = file.path.asFileHandle() if file and file.type is "dir"
        dir = file.path.asFileHandle().parent() if file and file.type is "file"
        
        switch data.id
            when "new"
                return unless dir
                @openDialog("PromptDialog", {
                    title: "__(New file)",
                    label: "__(File name)"
                })
                    .then (d) =>
                        fp = "#{dir.path}/#{d}".asFileHandle()
                        fp.write("text/plain")
                            .then (r) =>
                                @fileview.update dir.path
                            .catch (e) =>
                                @error __("Fail to create: {0}", e.stack), e
            
            when "newdir"
                return unless dir
                @openDialog("PromptDialog", {
                    title: "__(New folder)",
                    label: "__(Folder name)"
                })
                    .then (d) =>
                        dir.mk(d)
                            .then (r) =>
                                @fileview.update dir.path
                            .catch (e) =>
                                @error __("Fail to create: {0}", dir.path), e

            when "rename"
                return unless file
                @openDialog("PromptDialog", {
                    title: "__(Rename)",
                    label: "__(File name)",
                    value: file.filename
                })
                    .then (d) =>
                        return if d is file.filename
                        file = file.path.asFileHandle()
                        dir = file.parent()
                        file.move "#{dir.path}/#{d}"
                            .then (r) =>
                                @fileview.update dir.path
                            .catch (e) =>
                                @error __("Fail to rename: {0}", file.path), e

            when "delete"
                return unless file
                @openDialog("YesNoDialog", {
                    title: "__(Delete)",
                    iconclass: "fa fa-question-circle",
                    text: __("Do you really want to delete: {0}?", file.filename)
                })
                    .then (d) =>
                        return unless d
                        file = file.path.asFileHandle()
                        dir = file.parent()
                        file.remove()
                            .then (r) =>
                                @fileview.update dir.path
                            .catch (e) =>
                                @error __("Fail to delete: {0}", file.path), e
            
            else
                

    save: (file) ->
        file.write("text/plain")
            .then (d) =>
                file.dirty = false
                file.text = file.basename
                @tabbar.update()
                @scheme.set "apptitle", "#{@currfile.basename}"
            .catch (e) => @error __("Unable to save file: {0}", file.path), e
    
    
    saveAs: () ->
        @openDialog("FileDialog", {
                title: __("Save as"),
                file: @currfile
            })
            .then (f) =>
                d = f.file.path.asFileHandle()
                d = d.parent() if f.file.type is "file"
                @currfile.setPath "#{d.path}/#{f.name}"
                @save @currfile

    menuAction: (dataid, r) ->
        me = @
        me = r if r
        switch dataid
            when "new"
                me.openFile "Untitled".asFileHandle()
            when "open"
                me.openDialog("FileDialog", {
                    title: __("Open file"),
                    mimes: (v for v in me.meta().mimes when v isnt "dir")
                })
                .then (f) ->
                    me.openFile f.file.path.asFileHandle()
            when "opendir"
                me.openDialog("FileDialog", {
                    title: __("Open folder"),
                    mimes: ["dir"]
                })
                .then (f) ->
                    me.currdir = f.file.path.asFileHandle()
                    me.initSideBar()
            when "save"
                me.currfile.cache = me.editor.getValue()
                return me.save me.currfile if me.currfile.basename
                me.saveAs()
            when "saveas"
                me.currfile.cache = me.editor.getValue()
                me.saveAs()
            else
                console.log dataid

    cleanup: (evt) ->
        dirties = ( v for v in  @tabbar.get "items" when v.dirty )
        return if dirties.length is 0
        evt.preventDefault()
        @.openDialog("YesNoDialog", {
            title: "__(Quit)",
            text: __("Ignore all unsaved files: {0} ?", (v.filename() for v in dirties).join ", " )
        }).then (d) =>
            if d
                v.dirty = false for v in dirties
                @quit()

    menu: () ->
        menu = [
            @fileMenu()
            {
                text: "__(View)",
                child: [
                    { text: "__(Command Palette)", dataid: "cmdpalette", shortcut: "A-P" }
                ],
                onchildselect: (e, r) =>
                    @spotlight.run @
            }
        ]
        menu

class CMDMenu
    constructor: (@text, @shortcut) ->
        @child = []
        @parent = undefined
        @select = (e) ->

    addAction: (v) ->
        v.parent = @
        @child.push v
        @

    addActions: (list) ->
        @addAction v for v in list

    onchildselect: (f) ->
        @select = f
        @

    run: (root) ->
        root.openDialog(new CommandPalette(), @)
            .then (d) =>
                data = d.data.item.get("data")
                return data.run root if data.run
                @select d, root

CMDMenu.fromMenu = (mn) ->
    m = new CMDMenu mn.text, mn.shortcut
    m.onchildselect mn.onchildselect
    for v in mn.child
        if v.child
            m.addAction CMDMenu.fromMenu v
        else
            m.addAction v
    m

CodePad.CMDMenu = CMDMenu

CodePad.dependencies = [
    "os://scripts/ace/ace.js",
    "os://scripts/ace/ext-language_tools.js",
    "os://scripts/ace/ext-modelist.js",
    "os://scripts/ace/ext-themelist.js"
]
this.OS.register "CodePad", CodePad