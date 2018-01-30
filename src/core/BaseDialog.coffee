class BaseDialog extends this.OS.GUI.BaseModel
    constructor: (name) ->
        super name, null
        @parent = undefined
        @modal = false
        @handler = undefined
    quit: () ->
        evt = new _GUI.BaseEvent("exit")
        @onexit(evt)
        if not evt.prevent
            delete @.observable
            @parent.dialog = undefined if @parent
            ($ @scheme).remove() if @scheme
            @dialog.quit() if @dialog
    init: () ->
    main: () ->
    meta: () ->
        @parent.meta()
    show: () ->
        @trigger 'focus'
        ($ @scheme).css "z-index", window._zindex+2
    hide: () ->
        @trigger 'hide'

BaseDialog.type = 3
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
        html = "<afx-app-window  data-id = 'dia-window' apptitle='#{@title}' width='#{@conf.width}' height='#{@conf.height}'>
                <afx-vbox>"
        html += "<#{@conf.tag} #{@conf.att} data-id = 'content'></#{@conf.tag}>"
        html += "<div data-height = '40' style=' text-align:right;padding-top:3px;'>"
        html += "<afx-button data-id = 'bt#{k}' text = '#{v.label}' style='margin-right:5px;'></afx-button>" for k,v of @conf.buttons
        html += "</div></afx-vbox></afx-app-window>"
        #render the html
        _GUI.htmlToScheme html, @, @host
    
    main: () ->
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
            tag: "input",
            width: 200,
            height: 90,
            att: "type = 'text'"
            resizable: false,
            buttons: [
                {
                    label: "0k",
                    onclick: (d) ->
                        txt = (d.find "content").value
                        return d.quit() if txt is ""
                        d.handler txt if d.handler
                        d.quit()
                },
                {
                    label: "Cancel",
                    onclick: (d) -> d.quit()
                }
            ],
            filldata: (d) ->
                return unless d.data
                (d.find "content").value = d.data
            xtra: (d) ->
                $( d.find "content" ).keyup (e) ->
                    (d.find "bt0").trigger() if e.which is 13
        }

this.OS.register "PromptDialog", PromptDialog

class CalendarDialog extends BasicDialog
    constructor: () ->
        super "CalendarDialog", {
            tag: 'afx-calendar-view',
            width: 300,
            height: 220,
            resizable: false,
            buttons: [
                {
                    label: 'Ok',
                    onclick: (d) ->
                        date = (d.find "content").get "selectedDate"
                        if date
                            d.handler date if d.handler
                            d.quit()
                        else
                            d.notify "Please select a date"
                },
                {
                    label: 'Cancel',
                    onclick: (d) -> d.quit()
                }
            ]
        }
this.OS.register "CalendarDialog", CalendarDialog

class ColorPickerDialog extends BasicDialog
    constructor: () ->
        super "ColorPickerDialog", {
            tag: 'afx-color-picker',
            width: 313,
            height: 220,
            resizable: false,
            buttons: [
                {
                    label: 'Ok',
                    onclick: (d) ->
                        c = (d.find "content").get "selectedColor"
                        if c
                            d.handler c if d.handler
                            d.quit()
                        else
                            d.notify "Please select a color"
                },
                {
                    label: 'Cancel',
                    onclick: (d) -> d.quit()
                }
            ]
        }
this.OS.register "ColorPickerDialog", ColorPickerDialog

class InfoDialog extends BasicDialog
    constructor: () ->
        super "InfoDialog", {
            tag: 'afx-grid-view',
            width: 250,
            height: 300,
            resizable: true,
            buttons: [ { label: 'Cancel', onclick: (d) -> d.quit() } ],
            filldata: (d) ->
                return unless d.data
                rows = []
                rows.push [ { value: k }, { value: v } ] for v, k in d.data
                (d.find "content").set "rows", rows
        }
this.OS.register "InfoDialog", InfoDialog


class YesNoDialog extends BasicDialog
    constructor: () ->
        super "YesNoDialog", {
            tag: "afx-label",
            width: 300,
            height: 100,
            att:"style = 'padding:10px;'"
            resizable: true,
            buttons: [
                {
                    label: "Yes", onclick: (d) ->
                        d.handler true if d.handler
                        d.quit()
                },
                {
                    label: "No", onclick: (d) ->
                        d.handler false if d.handler
                        d.quit()
                }
            ],
            filldata: (d) ->
                return unless d.data
                l = d.find "content"
                for k, v of d.data
                    l.set k, v
        }
this.OS.register "YesNoDialog", YesNoDialog

class SelectionDialog extends BasicDialog
    constructor: () ->
        super "SelectionDialog", {
            tag: "afx-list-view",
            att: "",
            width: 250,
            height: 300,
            resizable: false,
            buttons: [
                {
                    label: "Ok", onclick: (d) ->
                        el = d.find "content"
                        it = el.get "selected"
                        return unless it
                        d.handler it if d.handler
                        d.quit()
                },
                { label: "Cancel", onclick: (d) -> d.quit() }
            ],
            filldata: (d) ->
                return unless d.data
                (d.find "content").set "items", d.data
            xtra: (d) ->
                ( d.find "content" ).set "onlistdbclick", (e) ->
                    (d.find "bt0").trigger()
            
        }
this.OS.register "SelectionDialog", SelectionDialog

class AboutDialog extends BaseDialog
    constructor: () ->
        super "AboutDialog"

    init: () ->
        @render "resources/schemes/about.html"

    main: () ->
        mt = @meta()
        @scheme.set "apptitle", "About: #{mt.name}"
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
        @render "resources/schemes/filedialog.html"
    
    main: () ->
        fileview = @find "fileview"
        location = @find "location"
        filename = @find "filename"
        me = @
        @scheme.set "apptitle", "#{@title}"
        fileview.set "fetch", (e, f) ->
            return unless e.child
            e.child.path.asFileHandler().read (d) ->
                return me.error "Resource not found #{e.child.path}" if d.error
                f d.result
        location.set "onlistselect", (e) ->
            return unless e and e.data.path
            e.data.path.asFileHandler().read (d) ->
                if(d.error)
                    return me.error "Resource not found #{e.data.path}"
                fileview.set "path", e.data.path
                fileview.set "data", d.result
        location.set "items", ( i for i in @systemsetting.VFS.mountpoints when i.type isnt "app" )
        location.set "selected", 0 unless location.get "selected"
        fileview.set "onfileselect", (f) ->
           ($ filename).val f.filename  if f.type is "file"
        (@find "bt-ok").set "onbtclick", (e) ->
            f = fileview.get "selectedFile"
            return unless f
            d = f.path
            d = f.path.asFileHandler().parent() if f.type is "file"
            me.handler d, ($ filename).val() if me.handler
            #sel = if  me.data and me.data.selection then me.data.selection else "file"
            #me.handler f, ($ filename).val() if me.handler and ((f.type is sel) or (sel is "*"))
            me.quit()

        (@find "bt-cancel").set "onbtclick", (e) ->
            me.quit()
        ($ filename).css("display", "block").val @data.file.basename or "Untitled" if @data and @data.file

this.OS.register "FileDiaLog", FileDiaLog