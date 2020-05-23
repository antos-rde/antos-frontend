# Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

# AnTOS Web desktop is is licensed under the GNU General Public
# License v3.0, see the LICENCE file for more information

# This program is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of 
# the License, or (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.

# You should have received a copy of the GNU General Public License
#along with this program. If not, see https://www.gnu.org/licenses/.
class SubWindow extends this.OS.GUI.BaseModel
    constructor: (name) ->
        super name, null
        @parent = undefined
        @modal = false
        
    quit: () ->
        evt = new Ant.OS.GUI.BaseEvent("exit")
        @onexit(evt)
        if not evt.prevent
            delete @.observable
            ($ @scheme).remove() if @scheme
            @dialog.quit() if @dialog
    init: () ->
    main: () ->
    meta: () ->
        return @parent.meta() if @parent and @parent.meta
        {}
        
    show: () ->
        @trigger 'focus'
        ($ @scheme).css "z-index", Ant.OS.GUI.zindex + 2
    hide: () ->
        @trigger 'hide'

SubWindow.type = 3
this.OS.GUI.SubWindow = SubWindow

class BaseDialog extends SubWindow
    constructor: (name) ->
        super name
        @handle = undefined

    onexit: (e) ->
        @parent.dialog = undefined if @parent

this.OS.GUI.BaseDialog = BaseDialog

class BasicDialog extends BaseDialog
    constructor: ( name, @markup) ->
        super name
        
    
    init: () ->
        if @markup
            if typeof @markup is "string"
                Ant.OS.GUI.htmlToScheme @markup, @, @host
            else # a file handle
                @render @markup.path
        else if Ant.OS.GUI.subwindows[@name] and Ant.OS.GUI.subwindows[@name].scheme
            scheme = Ant.OS.GUI.subwindows[@name].scheme
            Ant.OS.GUI.htmlToScheme scheme, @, @host

    main: () ->
        @scheme.set "apptitle", @data.title if @data and @data.title
        @scheme.set "resizable", false
        @scheme.set "minimizable", false

this.OS.GUI.BasicDialog = BasicDialog

class PromptDialog extends BasicDialog
    constructor: () ->
        super "PromptDialog"
    
    main: () ->
        super.main()
        $input = $(@find "txtInput")
        @find("lbl").set "text", @data.label if @data and @data.label
        $input.val @data.value if @data and @data.value

        (@find "btnOk").set "onbtclick", (e) =>
            @handle($input.val()) if @handle
            @quit()
        
        (@find "btnCancel").set "onbtclick", (e) =>
            @quit()

        $input.keyup (e) =>
            return unless e.which is 13
            @handle($input.val()) if @handle
            @quit()
    
        $input.focus()


PromptDialog.scheme = """
<afx-app-window  width='200' height='150' apptitle = "Prompt">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-label data-id = "lbl" />
                <input type = "text" data-id= "txtInput" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>
"""
this.OS.register "PromptDialog", PromptDialog

class TextDialog extends this.OS.GUI.BasicDialog
    constructor: () ->
        super "TextDialog"
    
    main: () ->
        super.main()
        $input = $(@find "txtInput")
        $input.val @data.value if @data and @data.value

        @find("btnOk").set "onbtclick", (e) =>
            value = $input.val()
            return unless value and value isnt ""
            @handle value if @handle
            @quit()
        
        @find("btnCancel").set "onbtclick", (e) =>
            @quit()
        
        $input.focus()

TextDialog.scheme = """
<afx-app-window data-id = "TextDialog" width='400' height='300'>
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <textarea data-id= "txtInput" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>
"""
this.OS.register "TextDialog", TextDialog

class CalendarDialog extends BasicDialog
    constructor: () ->
        super "CalendarDialog"
    
    main: () ->
        super.main()
        (@find "btnOk").set "onbtclick", (e) =>
            date = (@find "cal").get "selectedDate"
            return @notify __("Please select a day") unless date
            @handle(date) if @handle
            @quit()
        
        (@find "btnCancel").set "onbtclick", (e) =>
            @quit()

CalendarDialog.scheme = """
<afx-app-window  width='300' height='230' apptitle = "Calendar" >
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-calendar-view data-id = "cal" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
                <div data-height="10" />
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>
"""

this.OS.register "CalendarDialog", CalendarDialog

class ColorPickerDialog extends BasicDialog
    constructor: () ->
        super "ColorPickerDialog"
    
    main: () ->
        super.main()
        (@find "btnOk").set "onbtclick", (e) =>
            color = (@find "cpicker").get "selectedColor"
            return @notify __("Please select color") unless color
            @handle(color) if @handle
            @quit()
        
        (@find "btnCancel").set "onbtclick", (e) =>
            @quit()

ColorPickerDialog.scheme = """
<afx-app-window  width='320' height='250' apptitle = "Color picker" >
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-color-picker data-id = "cpicker" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
                <div data-height="10" />
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>
"""

this.OS.register "ColorPickerDialog", ColorPickerDialog

class InfoDialog extends BasicDialog
    constructor: () ->
        super "InfoDialog"
        
    main: () ->
        super.main()
        rows = []
        delete @data.title if @data and @data.title
        rows.push [ { text: k }, { text: v } ] for k, v of @data
        (@find "grid").set "header", [ { text: __("Name"), width: 70 }, { text: __("Value") } ]
        (@find "grid").set "rows", rows
        (@find "btnCancel").set "onbtclick", (e) =>
            @quit()

InfoDialog.scheme = """
<afx-app-window  width='250' height='300' apptitle = "Info" >
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-grid-view data-id = "grid" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
                <div data-height="10" />
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>
"""

this.OS.register "InfoDialog", InfoDialog


class YesNoDialog extends BasicDialog
    constructor: () ->
        super "YesNoDialog"

    main: () ->
        super.main()
        @find("lbl").set "*", @data if @data
        (@find "btnYes").set "onbtclick", (e) =>
            @handle(true) if @handle
            @quit()
        (@find "btnNo").set "onbtclick", (e) =>
            @handle(false) if @handle
            @quit()

YesNoDialog.scheme = """
<afx-app-window  width='200' height='150' apptitle = "Prompt">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-label data-id = "lbl" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnYes" text = "__(Yes)" data-width = "40" />
                    <afx-button data-id = "btnNo" text = "__(No)" data-width = "40" />
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>
"""
this.OS.register "YesNoDialog", YesNoDialog

class SelectionDialog extends BasicDialog
    constructor: () ->
        super "SelectionDialog"
    
    main: () ->
        super.main()
        (@find "list").set "data", @data.data if @data and @data.data
        fn = (e) =>
            data = (@find "list").get "selectedItem"
            return @notify __("Please select an item") unless data
            @handle(data.get("data")) if @handle
            @quit()
        (@find "list").set "onlistdbclick", fn
        (@find "btnOk").set "onbtclick", fn
        
        (@find "btnCancel").set "onbtclick", (e) =>
            @quit()

SelectionDialog.scheme = """
<afx-app-window  width='250' height='300' apptitle = "Selection">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-list-view data-id = "list" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>
"""
this.OS.register "SelectionDialog", SelectionDialog

class AboutDialog extends BasicDialog
    constructor: () ->
        super "AboutDialog"
    main: () ->
        super.main()
        mt = @meta()
        @scheme.set "apptitle", __("About: {0}", mt.name)
        (@find "mylabel").set "*", {
            icon: mt.icon,
            iconclass: mt.iconclass,
            text: "#{mt.name}(v#{mt.version})"
        }
        ($ @find "mydesc").html mt.description
        # grid data for author info
        return unless mt.info
        rows = []
        rows.push [ { text: k }, { text: v } ] for k, v of mt.info
        (@find "mygrid").set "header", [ { text: "", width: 100 }, { text: "" } ]
        (@find "mygrid").set "rows", rows
        (@find "btnCancel").set "onbtclick", (e) =>
            @quit()

AboutDialog.scheme = """
<afx-app-window data-id = 'about-window'  width='300' height='200'>
    <afx-vbox>
        <div style="text-align:center; margin-top:10px;" data-height="50">
            <h3 style = "margin:0;padding:0;">
                <afx-label data-id = 'mylabel'></afx-label>
            </h3>
            <i><p style = "margin:0; padding:0" data-id = 'mydesc'></p></i>
        </div>
        <afx-hbox>
            <div data-width="10"></div>
            <afx-grid-view data-id = 'mygrid'></afx-grid-view>
        </afx-hbox>
        
        <afx-hbox data-height="30">
            <div />
            <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "60" />
        </afx-hbox>
        <div data-height = "10"/>
    </afx-vbox>
</afx-app-window>
"""
this.OS.register "AboutDialog", AboutDialog

class FileDialog extends BasicDialog
    constructor: () ->
        super "FileDialog"
    
    main: () ->
        super.main()
        fileview = @find "fileview"
        location = @find "location"
        filename = @find "filename"
        fileview.set "fetch", (path) ->
            new Promise (resolve, reject) ->
                return resolve() unless path
                path.asFileHandle().read()
                    .then (d) ->
                        return reject d if d.error
                        resolve d.result
                    .catch (e) -> reject __e e
        setroot = (path) =>
            path.asFileHandle().read().then (d) =>
                if(d.error)
                    return @error __("Resource not found: {0}", path)
                fileview.set "path", path

        if not @data or not @data.root
            location.set "onlistselect", (e) ->
                return unless e and e.data.item
                setroot e.data.item.get("data").path
            location.set "data", ( i for i in @systemsetting.VFS.mountpoints when i.type isnt "app" )
            location.set "selected", 0 if location.get("selectedItem") is undefined
        else
            $(location).hide()
            @trigger "resize"
            setroot @data.root
        fileview.set "onfileselect", (e) ->
            ($ filename).val e.data.filename  if e.data.type is "file"
        (@find "bt-ok").set "onbtclick", (e) =>
            f = fileview.get "selectedFile"
            return @notify __("Please select a file/fofler") unless f
            if @data and @data.type and @data.type isnt f.type
                return @notify __("Please select {0} only", @data.type)
            if @data and @data.mimes
                #verify the mime
                m = false
                if f.mime
                    for v in @data.mimes
                        if f.mime.match (new RegExp v, "g")
                            m = true
                            break
                return @notify __("Only {0} could be selected", @data.mimes.join(",")) unless m
            
            name = $(filename).val()
            @handle { file: f, name: name } if @handle
            @quit()

        (@find "bt-cancel").set "onbtclick", (e) =>
            @quit()
        if @data and @data.file
            ($ filename).css("display", "block").val @data.file.basename or "Untitled"
            @trigger "resize"
        fileview.set "showhidden", @data.hidden if @data and @data.hidden

FileDialog.scheme = """
<afx-app-window width='400' height='300'>
    <afx-hbox>
        <afx-list-view data-id = "location" dropdown = "false" data-width = "120"></afx-list-view>
        <afx-vbox>
            <afx-file-view data-id = "fileview" view="tree" status = "false"></afx-file-view>
            <input data-height = '26' type = "text" data-id = "filename" style="margin-left:5px; margin-right:5px;display:none;" /> 
            <div data-height = '30' style=' text-align:right;padding:3px;'>
                <afx-button data-id = "bt-ok" text = "__(Ok)"></afx-button>
                <afx-button data-id = "bt-cancel" text = "__(Cancel)"></afx-button>
            </div>
        </afx-vbox>
    </afx-hbox>
</afx-app-window>
"""

this.OS.register "FileDialog", FileDialog