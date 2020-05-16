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
        me = @
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
                    me.currdir = dir
                    resolve d.result
        @setup()

    setup: () ->
        me = @
        ace.config.set('basePath', '/scripts/ace')
        ace.require "ace/ext/language_tools"
        @editor = ace.edit @find("datarea")
        @editor.setOptions {
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            highlightActiveLine: true,
            wrap: true,
            fontSize: "11pt"
        }
        #themes = ace.require "ace/ext/themelist"
        @editor.setTheme "ace/theme/monokai"
        @modes = ace.require "ace/ext/modelist"
        @editor.completers.push { getCompletions: ( editor, session, pos, prefix, callback ) -> }
        @editor.getSession().setUseWrapMode true
        @editormux = false
        @editor.on "input", () ->
            if me.editormux
                me.editormux = false
                return false
            if not me.currfile.dirty
                me.currfile.dirty = true
                me.currfile.text += "*"
                me.tabbar.update()
        @editor.getSession().selection.on "changeCursor", (e) ->
            me.updateStatus()
        
        @tabbar.set "ontabselect", (e) ->
            me.selecteTab $(e.data.item).index()
        @tabbar.set "ontabclose", (e) ->
            it = e.data.item
            return false unless it
            return me.closeTab it unless it.get("data").dirty
            me.openDialog("YesNoDialog", {
                title: __("Close tab"),
                text: __("Close without saving ?")
            }).then (d) ->
                return me.closeTab it if d
                me.editor.focus()
            return false
        @fileview.set "onfileopen", (e) ->
            return if e.data.type is "dir"
            me.openFile e.data.path.asFileHandle()

        @fileview.set "onfileselect", (e) ->
            return unless e.data or e.data.type is "dir"
            i = me.findTabByFile e.data.path.asFileHandle()
            return me.tabbar.set "selected", i if i isnt -1

        @on "resize", () -> me.editor.resize()
        @on "focus", () -> me.editor.focus()
        @spotlight = new CMDMenu __("Command palette")
        @bindKey "ALT-P", () -> me.spotlight.run me
        @find("datarea").contextmenuHandle = (e, m) ->
            m.set "items", [{
                text: __("Command palete"),
                onmenuselect: (e) ->
                    me.spotlight.run me
            }]
            m.show e

        @bindKey "ALT-N", () ->  me.menuAction "new"
        @bindKey "ALT-O", () ->  me.menuAction "open"
        @bindKey "ALT-F", () ->  me.menuAction "opendir"
        @bindKey "CTRL-S", () -> me.menuAction "save"
        @bindKey "ALT-W", () ->  me.menuAction "saveas"

        @loadExtensionMetaData()
        @initCommandPalete()
        @initSideBar()
        @openFile @currfile
    

    openFile: (file) ->
        #find tab
        i = @findTabByFile file
        return @tabbar.set "selected", i if i isnt -1
        return @newTab file if file.path.toString() is "Untitled"
        me = @
        file.read()
            .then (d) ->
                file.cache = d or ""
                me.newTab file
            .catch (e) ->
                me.error __("Unable to open: {0}", file.path)
    
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
                file.langmode = { caption: "Text", mode: "ace/mode/text" }
        @editormux = true
        @editor.setValue file.cache, -1
        @editor.session.setMode file.langmode.mode
        @editor.session.setUndoManager file.um
        if file.cursor
            @editor.renderer.scrollCursorIntoView {
                row: file.cursor.row, column: file.cursor.column
            }, 0.5
            @editor.selection.moveTo file.cursor.row, file.cursor.column
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
        me = @
        "#{@meta().path}/extensions.json"
            .asFileHandle()
            .read("json")
            .then (d) ->
                for ext in d
                    if me.extensions[ext.name]
                        me.extensions[ext.name].child = {}
                        me.extensions[ext.name].addAction v for v in ext.actions
                    else
                        me.extensions[ext.name] = new CMDMenu ext.text
                        me.extensions[ext.name].name = ext.name
                        me.extensions[ext.name].addAction v for v in ext.actions
                        me.spotlight.addAction me.extensions[ext.name]
                        me.extensions[ext.name].onchildselect (e) ->
                            me.loadAndRunExtensionAction e.data.item.get "data"
            .catch (e) ->
                me.error __("Cannot load extension meta data")

    runExtensionAction: (name, action) ->
        me = @
        return @error __("Unable to find extension: {0}", name) unless CodePad.extensions[name]
        ext = new CodePad.extensions[name](me)
        return @error __("Unable to find action: {0}", action) unless ext[action]
        ext.preload()
            .then () ->
                ext[action]()
            .catch (e) ->
                me.error e.stack

    loadAndRunExtensionAction: (data) ->
        me = @
        name = data.parent.name
        action = data.name
        #verify if the extension is load
        if not CodePad.extensions[name]
            #load the extension
            path = "#{@meta().path}/extensions/#{name}.js"
            @_api.requires path
                .then () -> me.runExtensionAction name, action
                .catch (e) ->
                    me.error __("unable to load extension: {}", name)
        else
            @runExtensionAction name, action

    fileMenu: () ->
        me = @
        {
            text: __("File"),
            child: [
                { text: __("New"), dataid: "new", shortcut: "A-N" },
                { text: __("Open"), dataid: "open", shortcut: "A-O" },
                { text: __("Open Folder"), dataid: "opendir", shortcut: "A-F" },
                { text: __("Save"), dataid: "save", shortcut: "C-S" },
                { text: __("Save as"), dataid: "saveas", shortcut: "A-W" }
            ],
            onchildselect: (e, r) ->
                me.menuAction e.data.item.get("data").dataid, r
        }
    
    save: (file) ->
        me = @
        file.write("text/plain")
            .then (d) ->
                return me.error __("Error saving file {0}: {1}", file.basename, d.error) if d.error
                file.dirty = false
                file.text = file.basename
                me.tabbar.update()
                me.scheme.set "apptitle", "#{me.currfile.basename}"
            .catch (e) -> me.error e.stack
    
    
    saveAs: () ->
        me = @
        me.openDialog("FileDialog", {
                title: __("Save as"),
                file: me.currfile
            })
            .then (f) ->
                d = f.file.path.asFileHandle()
                d = d.parent() if f.file.type is "file"
                me.currfile.setPath "#{d.path}/#{f.name}"
                me.save me.currfile
            .catch (e) ->
                me.error e.stack

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
        me = @
        evt.preventDefault()
        @.openDialog("YesNoDialog", {
            title: "__(Quit)",
            text: __("Ignore all {0} unsaved files ?", dirties.length)
        }).then (d) ->
            if d
                v.dirty = false for v in dirties
                me.quit()

    menu: () ->
        me = @
        menu = [
            @fileMenu()
            {
                text: "__(View)",
                child: [
                    { text: "__(Command Palette)", dataid: "cmdpalette", shortcut: "A-P" }
                ],
                onchildselect: (e, r) ->
                    me.spotlight.run me
            }
        ]
        menu

class CodePad.BaseExtension

    constructor: (@app) ->

    preload: () ->
        dep = ( "#{@basedir()}/#{v}" for v in @dependencies())
        Ant.OS.API.require dep

    basedir: () ->
        "#{@app.meta().path}/extensions"

    notify: (m) ->
        @app.notify m
    
    error: (m) ->
        @app.error m

    dependencies: () ->
        []

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
        me = @
        root.openDialog(new CommandPalette(), @)
            .then (d) ->
                data = d.data.item.get("data")
                return data.run root if data.run
                me.select d, root

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

CodePad.extensions = {}

CodePad.dependencies = [
    "os://scripts/ace/ace.js",
    "os://scripts/ace/ext-language_tools.js",
    "os://scripts/ace/ext-modelist.js",
    "os://scripts/ace/ext-themelist.js"
]
this.OS.register "CodePad", CodePad