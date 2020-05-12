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
        @handle = undefined

    onexit: (e) ->
        @parent.dialog = undefined if @parent

this.OS.GUI.BaseDialog = BaseDialog

class BasicDialog extends BaseDialog
    constructor: ( name, target) ->
        super name
        if typeof target is "string"
            Ant.OS.GUI.htmlToScheme target, @, @host
        else # a file handle
            @render target.path
    
    init: () ->
        @scheme.set "apptitle", @data.title if @data and @data.title
        @scheme.set "resizable", false
        @scheme.set "minimizable", false

this.OS.GUI.BasicDialog = BasicDialog

class PromptDialog extends BasicDialog
    constructor: () ->
        super "PromptDialog", PromptDialog.scheme
    
    init: () ->
        super.init()
        me = @
        @find("lbl").set "text", @data.label if @data and @data.label
        $(@find "txtInput").val @data.value if @data and @data.value

        (@find "btnOk").set "onbtclick", (e) ->
            me.handle($(me.find "txtInput").val()) if me.handle
            me.quit()
        
        (@find "btnCancel").set "onbtclick", (e) ->
            me.quit()


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

class CalendarDialog extends BasicDialog
    constructor: () ->
        super "CalendarDialog", CalendarDialog.scheme
    
    init: () ->
        super.init()
        me = @
        (@find "btnOk").set "onbtclick", (e) ->
            date = (me.find "cal").get "selectedDate"
            return me.notify __("Please select a day") unless date
            me.handle(date) if me.handle
            me.quit()
        
        (@find "btnCancel").set "onbtclick", (e) ->
            me.quit()

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
        super "ColorPickerDialog", ColorPickerDialog.scheme
    
    init: () ->
        super.init()
        me = @
        (@find "btnOk").set "onbtclick", (e) ->
            color = (me.find "cpicker").get "selectedColor"
            return me.notify __("Please select color") unless color
            me.handle(color) if me.handle
            me.quit()
        
        (@find "btnCancel").set "onbtclick", (e) ->
            me.quit()

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
        super "InfoDialog", InfoDialog.scheme
        
    init: () ->
        super.init()
        me = @
        rows = []
        delete @data.title if @data and @data.title
        rows.push [ { text: k }, { text: v } ] for k, v of @data
        (@find "grid").set "header", [ { text: __("Name"), width: 70 }, { text: __("Value") } ]
        (@find "grid").set "rows", rows
        (@find "btnCancel").set "onbtclick", (e) ->
            me.quit()

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
        super "YesNoDialog", YesNoDialog.scheme

    init: () ->
        super.init()
        me = @
        @find("lbl").set "*", @data if @data
        (@find "btnYes").set "onbtclick", (e) ->
            me.handle(true) if me.handle
            me.quit()
        (@find "btnNo").set "onbtclick", (e) ->
            me.handle(false) if me.handle
            me.quit()

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
        super "SelectionDialog", SelectionDialog.scheme
    
    init: () ->
        super.init()
        me = @
        (@find "list").set "data", @data.data if @data and @data.data
        (@find "btnOk").set "onbtclick", (e) ->
            data = (me.find "list").get "selectedItem"
            return me.notify __("Please select an item") unless data
            me.handle(data) if me.handle
            me.quit()
        
        (@find "btnCancel").set "onbtclick", (e) ->
            me.quit()

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
                    <afx-button data-id = "btnCancel" text = "__(Cancels)" data-width = "50" />
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
        super "AboutDialog", AboutDialog.scheme

    init: () ->
        mt = @meta()
        me = @
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
        (@find "btnCancel").set "onbtclick", (e) ->
            me.quit()

AboutDialog.scheme = """
<afx-app-window data-id = 'about-window'  width='300' height='200'>
    <afx-vbox>
        <div style="text-align:center; margin-top:10px;" data-height="50">
            <h3 style = "margin:0;padding:0;">
                <afx-label data-id = 'mylabel'></afx-label>
            </h3>
            <i><p style = "margin:0; padding:0" data-id = 'mydesc'></p></i>
        </div>
        <afx-grid-view data-id = 'mygrid'></afx-grid-view>
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
        super "FileDialog", FileDialog.scheme
    
    init: () ->
        super.init()
        fileview = @find "fileview"
        location = @find "location"
        filename = @find "filename"
        me = @
        fileview.set "fetch", (path) ->
            new Promise (resolve, reject) ->
                path.asFileHandle().read()
                    .then (d) ->
                        return reject d if d.error
                        resolve d.result
                    .catch (e) -> reject e
        setroot = (path) ->
            path.asFileHandle().read().then (d) ->
                if(d.error)
                    return me.error __("Resource not found: {0}", path)
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
        (@find "bt-ok").set "onbtclick", (e) ->
            f = fileview.get "selectedFile"
            return me.notify __("Please select a file/fofler") unless f
            return me.notify __("Please select {0} only", me.data.type) if me.data and me.data.type and me.data.type isnt f.type
            if me.data and me.data.mimes
                #verify the mime
                m = false
                if f.mime
                    for v in me.data.mimes
                        if f.mime.match (new RegExp v, "g")
                            m = true
                            break
                return me.notify __("Only {0} could be selected", me.data.mimes.join(",")) unless m
            
            name = $(filename).val()
            me.handle { file: f, name: name } if me.handle
            me.quit()

        (@find "bt-cancel").set "onbtclick", (e) ->
            me.quit()
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