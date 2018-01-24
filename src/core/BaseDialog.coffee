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
    constructor: ( name, @conf ) ->
        super name
    
    init: () ->
        html = "<afx-app-window  data-id = 'dia-window' apptitle='#{@name}' width='#{@conf.width}' height='#{@conf.height}'>
                <afx-hbox>"
        html += "<#{@conf.tag} #{@conf.att} data-id = 'content'></#{@conf.tag}>"
        html += "<div data-height = '40' style=' text-align:right;padding-top:3px;'>"
        html += "<afx-button data-id = 'bt#{k}' text = '#{v.label}' style='margin-right:5px;'></afx-button>" for k,v of @conf.buttons
        html += "</div></afx-hbox></afx-app-window>"
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

this.OS.GUI.BasicDialog = BasicDialog

class PromptDialog extends BasicDialog
    constructor: () ->
        super "PromptDialog", {
            tag: "input",
            width: 200,
            height: 90,
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
                d.scheme.set "apptitle", d.data if d.data
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
                rows.push [ { value: k }, { value: v } ] for k, v of d.data
                (d.find "content").set "rows", rows
                d.scheme.set "apptitle", d.data.filename
        }
this.OS.register "InfoDialog", InfoDialog

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