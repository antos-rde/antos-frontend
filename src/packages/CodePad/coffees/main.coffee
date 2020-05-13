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
        #console.log themes.themesByName.monokai.theme
        @editor.setTheme "ace/theme/monokai"
        #console.log themes
        @editor.completers.push { getCompletions: ( editor, session, pos, prefix, callback ) -> }
        @editor.getSession().setUseWrapMode true
        @on "resize", () -> me.editor.resize()
        @on "focus", () -> me.editor.focus()
        @find("datarea").contextmenuHandle = (e, m) ->
            m.set "items", [{
                text: __("Command palete"),
                onmenuselect: (e) ->
                    me.showCmdPalette()
            }]
            m.show e
        @editor.resize()

    showCmdPalette: () ->
        @openDialog(new CommandPalette(), {
            
        }).then (d) ->

CodePad.dependencies = [
    "ace/ace",
    "ace/ext-language_tools",
    "ace/ext-modelist",
    "ace/ext-themelist"
]
this.OS.register "CodePad", CodePad