class SubWindow extends this.OS.GUI.BaseModel
    constructor: (name) ->
        super name, null
        @parent = undefined
        @modal = false
        
    quit: () ->
        evt = new _GUI.BaseEvent("exit")
        @onexit(evt)
        if not evt.prevent
            delete @.observable
            ($ @scheme).remove() if @scheme
            @dialog.quit() if @dialog
    init: () ->
    main: () ->
    meta: () ->
        @parent.meta()
    show: () ->
        @trigger 'focus'
        ($ @scheme).css "z-index", window._zindex + 2
    hide: () ->
        @trigger 'hide'

SubWindow.type = 3
this.OS.GUI.SubWindow = SubWindow

class BaseDialog extends SubWindow
    constructor: (name) ->
        super name
        @handler = undefined

    onexit: (e) ->
        @parent.dialog = undefined if @parent

this.OS.GUI.BaseDialog = BaseDialog
###
    this dialog rende a tag as main content
    and a list of buttons, the behaviour of
    the button is specified by user. The conf
    object is in the follow form
    {
        tag: <tag_name>,
        buttons:[
            {
                label: 'buton label',
                onclick: function(d){...}
            }, ...
        ]
    }
###
class BasicDialog extends BaseDialog
    constructor: ( name, @conf, @title) ->
        super name
    
    init: () ->
        @title = @name if not @title
        html = "<afx-app-window  data-id = 'dia-window'  width='#{@conf.width}' height='#{@conf.height}'>
                <afx-vbox>"
        html += "<#{v.tag} #{v.att} style = 'margin-left:5px; margin-right:5px;' data-id = 'content#{k}'></#{v.tag}>" for k,v of @conf.tags
        html += "<div data-height = '30' style=' text-align:right;padding-top:3px;'>"
        html += "<afx-button data-id = 'bt#{k}' text = '#{v.label}' style='margin-right:5px;'></afx-button>" for k,v of @conf.buttons
        html += "</div><div data-height='5'></div></afx-vbox></afx-app-window>"
        #render the html
        _GUI.htmlToScheme html, @, @host
    
    main: () ->
        @scheme.set "apptitle", @title
        @scheme.set "minimizable", false
        @scheme.set "resizable", @conf.resizable if @conf.resizable isnt undefined
        me = @
        f = (_v) -> () -> _v.onclick me
        # bind action to button
        ( (me.find "bt#{k}").set "onbtclick", f(v) ) for k, v of @conf.buttons
        @conf.filldata @ if @conf.filldata
        @conf.xtra @ if @conf.xtra

this.OS.GUI.BasicDialog = BasicDialog

class PromptDialog extends BasicDialog
    constructor: () ->
        super "PromptDialog", {
            tags: [
                { tag: "afx-label" },
                { tag: "input", att: "type = 'text' data-height='25'" }
            ],
            width: 200,
            height: 120,
            resizable: false,
            buttons: [
                {
                    label: "__(Ok)",
                    onclick: (d) ->
                        txt = (d.find "content1").value
                        return d.quit() if txt is ""
                        d.handler txt if d.handler
                        d.quit()
                },
                {
                    label: "__(Cancel)",
                    onclick: (d) -> d.quit()
                }
            ],
            filldata: (d) ->
                return unless d.data
                (d.find "content0").set "text", d.data.label
                (d.find "content1").value = d.data.value if d.data.value
            xtra: (d) ->
                $( d.find "content1" ).keyup (e) ->
                    (d.find "bt0").trigger() if e.which is 13
        }

this.OS.register "PromptDialog", PromptDialog

class CalendarDialog extends BasicDialog
    constructor: () ->
        super "CalendarDialog", {
            tags: [{ tag: 'afx-calendar-view' }],
            width: 300,
            height: 220,
            resizable: false,
            buttons: [
                {
                    label: "__(Ok)",
                    onclick: (d) ->
                        date = (d.find "content0").get "selectedDate"
                        if date
                            d.handler date if d.handler
                            d.quit()
                        else
                            d.notify __("Please select a date")
                },
                {
                    label: "__(Cancel)",
                    onclick: (d) -> d.quit()
                }
            ]
        }
this.OS.register "CalendarDialog", CalendarDialog

class ColorPickerDialog extends BasicDialog
    constructor: () ->
        super "ColorPickerDialog", {
            tags: [{ tag: 'afx-color-picker' }],
            width: 313,
            height: 220,
            resizable: false,
            buttons: [
                {
                    label: "__(Ok)",
                    onclick: (d) ->
                        c = (d.find "content0").get "selectedColor"
                        if c
                            d.handler c if d.handler
                            d.quit()
                        else
                            d.notify "Please select a color"
                },
                {
                    label: "__(Cancel)",
                    onclick: (d) -> d.quit()
                }
            ]
        }
this.OS.register "ColorPickerDialog", ColorPickerDialog

class InfoDialog extends BasicDialog
    constructor: () ->
        super "InfoDialog", {
            tags: [{ tag: 'afx-grid-view' }],
            width: 250,
            height: 300,
            resizable: true,
            buttons: [ { label: "__(Cancel)", onclick: (d) -> d.quit() } ],
            filldata: (d) ->
                return unless d.data
                rows = []
                rows.push [ { value: k }, { value: v } ] for k, v of d.data
                (d.find "content0").set "rows", rows
        }
this.OS.register "InfoDialog", InfoDialog


class YesNoDialog extends BasicDialog
    constructor: () ->
        super "YesNoDialog", {
            tags: [{ tag: "afx-label", att: "style = 'padding-left:10px;'" }],
            width: 300,
            height: 100,
            resizable: true,
            buttons: [
                {
                    label: "__(Yes)", onclick: (d) ->
                        d.handler true if d.handler
                        d.quit()
                },
                {
                    label: "__(No)", onclick: (d) ->
                        d.handler false if d.handler
                        d.quit()
                }
            ],
            filldata: (d) ->
                return unless d.data
                l = d.find "content0"
                for k, v of d.data
                    l.set k, v
        }
this.OS.register "YesNoDialog", YesNoDialog

class SelectionDialog extends BasicDialog
    constructor: () ->
        super "SelectionDialog", {
            tags: [{ tag: "afx-list-view" }],
            width: 250,
            height: 300,
            resizable: false,
            buttons: [
                {
                    label: "__(Ok)", onclick: (d) ->
                        el = d.find "content0"
                        it = el.get "selected"
                        return unless it
                        d.handler it if d.handler
                        d.quit()
                },
                { label: "__(Cancel)", onclick: (d) -> d.quit() }
            ],
            filldata: (d) ->
                return unless d.data
                (d.find "content0").set "items", d.data
            xtra: (d) ->
                ( d.find "content0" ).set "onlistdbclick", (e) ->
                    (d.find "bt0").trigger()
            
        }
this.OS.register "SelectionDialog", SelectionDialog

class AboutDialog extends BaseDialog
    constructor: () ->
        super "AboutDialog"

    init: () ->
        @render "os://resources/schemes/about.html"

    main: () ->
        mt = @meta()
        @scheme.set "apptitle", __("About: {0}",mt.name)
        (@find "mylabel").set "*", {icon:mt.icon, iconclass:mt.iconclass, text:"#{mt.name}(v#{mt.version})"}
        ($ @find "mydesc").html mt.description
        # grid data for author info
        return unless mt.info
        rows = []
        rows.push [ { value: k }, { value: v } ] for k, v of mt.info
        (@find "mygrid").set "rows", rows
        
this.OS.register "AboutDialog", AboutDialog

class FileDiaLog extends BaseDialog
    constructor: () ->
        super "FileDiaLog"
    
    init: () ->
        @render "os://resources/schemes/filedialog.html"
    
    main: () ->
        fileview = @find "fileview"
        location = @find "location"
        filename = @find "filename"
        me = @
        @scheme.set "apptitle", @title
        fileview.set "fetch", (e, f) ->
            return unless e.child
            e.child.path.asFileHandler().read (d) ->
                return me.error __("Resource not found: {0}", e.child.path) if d.error
                f d.result
        location.set "onlistselect", (e) ->
            return unless e and e.data.path
            e.data.path.asFileHandler().read (d) ->
                if(d.error)
                    return me.error __("Resource not found: {0}", e.data.path)
                fileview.set "path", e.data.path
                fileview.set "data", d.result
        location.set "items", ( i for i in @systemsetting.VFS.mountpoints when i.type isnt "app" )
        location.set "selected", 0 unless location.get "selected"
        fileview.set "onfileselect", (f) ->
            ($ filename).val f.filename  if f.type is "file"
        (@find "bt-ok").set "onbtclick", (e) ->
            f = fileview.get "selectedFile"
            return me.notify __("Please select a file") unless f
            if me.data and me.data.mimes
                #verify the mime
                m = false
                for v in me.data.mimes
                    if f.mime.match (new RegExp v, "g")
                        m = true
                        break
                return me.notify __("Only {0} could be selected", me.data.mimes.join(",")) unless m
            d = f.path
            d = f.path.asFileHandler().parent() if f.type is "file"
            me.handler d, ($ filename).val(), f.path if me.handler
            #sel = if  me.data and me.data.selection then me.data.selection else "file"
            #me.handler f, ($ filename).val() if me.handler and ((f.type is sel) or (sel is "*"))
            me.quit()

        (@find "bt-cancel").set "onbtclick", (e) ->
            me.quit()
        if @data and @data.file
            ($ filename).css("display", "block").val @data.file.basename or "Untitled"
            @trigger "resize"
        fileview.set "showhidden", @data.hidden if @data and @data.hidden

this.OS.register "FileDiaLog", FileDiaLog