class CMDMenu
    constructor: (@text, @shortcut) ->
        @child = []
        @select = (e) ->

    addAction: (v) ->
        @child.push v
        @

    addActions: (list) ->
        @addAction v for v in list

    onchildselect: (f) ->
        @select = f
        @

    run: (root) ->
        me = @
        root.openDialog(new CommandPalette(), @child)
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

class CodePad extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "CodePad", args
    
    main: () ->
        me = @
        @fileview = @find("fileview")
        @fileview.set "fetch", (path) ->
            new Promise (resolve, reject) ->
                dir = path
                dir = path.asFileHandle() if typeof path is "string"
                dir.read().then (d) ->
                    return reject d.error if d.error
                    me.currdir = dir
                    resolve d.result
        @fileview.set "path", "desktop://"
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
            useWrapMode: true,
            fontSize: "9pt"
        }
        #themes = ace.require "ace/ext/themelist"
        @editor.setTheme "ace/theme/monokai"
        @editor.completers.push { getCompletions: ( editor, session, pos, prefix, callback ) -> }
        @editor.getSession().setUseWrapMode true
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
        @initCommandPalete()
        @editor.resize()

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

        modes = ace.require "ace/ext/modelist"
        cmdmode = new CMDMenu __("Change language mode")
        cmdmode.addAction { text: v.name, mode: v.mode } for v in modes.modes
        cmdmode.onchildselect (d, r) ->
            data = d.data.item.get("data")
            r.editor.session.setMode data.mode
            r.editor.focus()
        @spotlight.addAction cmdmode
        @addAction CMDMenu.fromMenu @fileMenu()
    
    fileMenu: () ->
        me = @
        {
            text: __("File"),
            child: [
                { text: __("New"), dataid: "new", shortcut: "A-N" },
                { text: __("Open"), dataid: "open", shortcut: "A-O" },
                { text: __("Save"), dataid: "save", shortcut: "C-S" },
                { text: __("Save as"), dataid: "saveas", shortcut: "A-W" }
            ],
            onchildselect: (e, r) ->
                console.log e.data.item.get "data"
        }
        

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

CodePad.dependencies = [
    "ace/ace",
    "ace/ext-language_tools",
    "ace/ext-modelist",
    "ace/ext-themelist"
]
this.OS.register "CodePad", CodePad