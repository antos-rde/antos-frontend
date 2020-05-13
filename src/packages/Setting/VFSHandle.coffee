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

class VFSSettingDialog extends this.OS.GUI.BasicDialog
    constructor: () ->
        super "VFSSettingDialog", VFSSettingDialog.scheme
    
    init: () ->
        me = @
        $(@find("txtPath")).click (e) ->
            me.openDialog("FileDialog", {
                title: "__(Select a directory)",
                mimes: ["dir"],
                hidden: true
            })
            .then (d) ->
                (me.find "txtPath").value = d.file.path

        @find("btnOk").set "onbtclick", (e) ->
            data = {
                path: (me.find "txtPath").value,
                name: (me.find "txtName").value
            }
            return me.error __("Please enter mount point name") unless data.name and data.name isnt ""
            return me .error __("Please select a directory") unless data.path and data.path isnt ""
            me.handle(data) if me.handle
            me.quit()
        
        (@find "btnCancel").set "onbtclick", (e) ->
            me.quit()

        return unless @data
        (@find "txtName").value = @data.text if @data.text
        (@find "txtPath").value = @data.path if @data.path

VFSSettingDialog.scheme = """
<afx-app-window  width='250' height='180' apptitle = "__(Mount Points)">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-label data-height="30" text = "__(Name)" />
                <input type = "text" data-id= "txtName" />
                <div data-height="3" />
                <afx-label data-height="30" text = "__(Path)" />
                <input type = "text" data-id= "txtPath" />
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

class VFSHandle extends SettingHandle
    constructor: (scheme, parent) ->
        super(scheme, parent)
        me = @
        @mplist = @find "mplist"
        @dpath = @find "dpath"
        @ppath = @find "ppath"
        @mplist.set "buttons", [
            {
                text: "+",
                onbtclick: (e) ->
                    me.parent.openDialog(new VFSSettingDialog(), {
                        title: "__(Add mount point)"
                    })
                    .then (d) ->
                        me.parent.systemsetting.VFS.mountpoints.push {
                            text: d.name, path: d.path, iconclass: "fa fa-folder", type: "fs"
                        }
                        me.refresh()
            },
            {
                text: "-",
                onbtclick: (e) ->
                    item = me.mplist.get "selectedItem"
                    return unless item
                    selidx = $(item).index()
                    me.parent.openDialog("YesNoDialog", {
                        title: "__(Remove)",
                        text: __("Remove: {0}?", item.get("data").text)
                    }).then (d) ->
                        return unless d
                        me.parent.systemsetting.VFS.mountpoints.splice selidx, 1
                        me.refresh()
            },
            {
                text: "",
                iconclass: "fa fa-pencil",
                onbtclick: (e) ->
                    sel = me.mplist.get "selectedItem"
                    return unless sel
                    me.parent.openDialog(new VFSSettingDialog(), {
                        title: "__(Edit mount point)",
                        text: sel.get("data").text,
                        path: sel.get("data").path
                    }).then (d) ->
                        sel.get("data").text = d.name
                        sel.get("data").path = d.path
                        me.refresh()
            }
        ]
        (@find "btndpath").set 'onbtclick', (e) ->
            me.parent.openDialog("FileDialog", {
                title: "__(Select a directory)",
                mimes: ["dir"],
                hidden: true
            }).then (d) ->
                me.parent.systemsetting.desktop.path = d.file.path
                me.parent._gui.refreshDesktop()
                me.refresh()
        
        (@find "btnppath").set 'onbtclick', (e) ->
            me.parent.openDialog("FileDialog", {
                title: "__(Select a directory)",
                mimes: ["dir"],
                hidden: true
            }).then (d) ->
                me.parent.systemsetting.system.pkgpaths.user = d.file.path
                me.refresh()
        me.refresh()

    refresh: () ->
        me = @
        @mplist.set "data", @parent.systemsetting.VFS.mountpoints
        @dpath.set "text", @parent.systemsetting.desktop.path
        @ppath.set "text", @parent.systemsetting.system.pkgpaths.user