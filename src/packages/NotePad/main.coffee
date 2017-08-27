class NotePad extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "NotePad", args
    main: () ->
        me = @
        @scheme.set "apptitle", "NotePad"
        @sidebar = @find "sidebar"
        @location = @find "location"
        @fileview = @find "fileview"
        div = @find "datarea"
        ace.require "ace/ext/language_tools"
        @.editor = ace.edit div
        @.editor.setOptions {
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            fontSize: "9pt"
        }
        @.editor.completers.push {getCompletions:(editor, session, pos, prefix, callback)->}
        @.editor.getSession().setUseWrapMode true

        list = @find "modelist"
        @modes = ace.require "ace/ext/modelist"
        ldata = []
        ldata.push {
            text: m.name,
            mode: m.mode,
            selected: if m.mode is 'ace/mode/text' then true else false
        } for m in @modes.modes
        list.set "items", ldata
        list.set "onlistselect", (e) ->
            me.editor.session.setMode e.data.mode

        themelist = @find "themelist"
        themes = ace.require "ace/ext/themelist"
        ldata = []
        ldata.push {
            text: m.caption,
            mode: m.theme,
            selected: if m.theme is "ace/theme/monokai" then true else false
        } for k, m of themes.themesByName
        themelist.set "items", ldata
        themelist.set "onlistselect", (e) ->
            me.editor.setTheme e.data.mode

        stat = @find "editorstat"
        #status
        stup = (e) ->
            c = me.editor.session.selection.getCursor()
            l = me.editor.session.getLength()
            $(stat).html "Row #{c.row}, col #{c.column}, lines: #{l}"
        stup(0)
        @.editor.getSession().selection.on "changeCursor", (e) -> stup(e)

        @on "resize", () -> me.editor.resize()
        @on "focus", () -> me.editor.focus()

        @fileview.set "chdir", (d) -> me.chdir d
        @fileview.set "fetch", (e, f) ->
            return unless e.child
            me._api.handler.scandir e.child.path,
                (d) -> f d.result
                , (e, s) -> me.error "Cannot fetch child dir #{e.child.path}"
        
        @location.set "onlistselect", (e) -> me.chdir e.data.path
        @location.set "items", [
            { text: "Home", path: 'home:///', iconclass:"fa fa-home", selected:true},
            { text: "OS", path: 'os:///', iconclass:"fa fa-inbox" },
            { text: "Desktop", path: 'home:///.desktop', iconclass: "fa fa-desktop" },
        ]

    chdir: (p) ->
        me = @
        me._api.handler.scandir p,
            (d) ->
                if(d.error)
                    return me.error "Resource not found #{p}"
                me.fileview.set "path", p
                me.fileview.set "data", d.result
            , (e, s) ->
                me.error "Cannot chdir #{p}"

    menu: ()->
        menu = [{
                text:"File", 
                child:[
                    {text:"Open", dataid:"#{@name}-Open"},
                    {text:"Close", dataid:"#{@name}-Close"}
                ]
            }]
        menu
NotePad.singleton = false
this.OS.register "NotePad", NotePad