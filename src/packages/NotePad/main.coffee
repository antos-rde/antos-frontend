class NotePad extends this.OS.GUI.BaseApplication
    constructor: () ->
        super "NotePad"
    main: () ->
        me = @
        @scheme.set "apptitle", "NotePad"
        
        div = @find "datarea"
        ace.require "ace/ext/language_tools"
        @.editor = ace.edit div
        @.editor.setTheme "ace/theme/monokai"
        @.editor.getSession().setMode 'ace/mode/text'
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
        ldata.push {text:m.name, mode:m.mode} for m in @modes.modes
        list.set "items",ldata
        list.set "onlistselect", (e)->
            me.editor.session.setMode e.data.mode

        stat = @find "editorstat"
        #status
        stup = (e)->
            c = me.editor.session.selection.getCursor()
            l = me.editor.session.getLength()
            $(stat).html "Row #{c.row}, col #{c.column}, lines: #{l}"
        stup(0)
        @.editor.getSession().selection.on "changeCursor", (e)->stup(e)

        @on "resize", ()-> me.editor.resize()
        @on "focus", ()->me.editor.focus()
        
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
this.OS.register "NotePad",NotePad