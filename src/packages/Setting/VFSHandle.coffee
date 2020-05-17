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
        $(@find("txtPath")).click (e) =>
            @openDialog("FileDialog", {
                title: "__(Select a directory)",
                mimes: ["dir"],
                hidden: true
            })
            .then (d) =>
                (@find "txtPath").value = d.file.path

        @find("btnOk").set "onbtclick", (e) =>
            data = {
                path: (@find "txtPath").value,
                name: (@find "txtName").value
            }
            return @error __("Please enter mount point name") unless data.name and data.name isnt ""
            return @error __("Please select a directory") unless data.path and data.path isnt ""
            @handle(data) if @handle
            @quit()
        
        (@find "btnCancel").set "onbtclick", (e) =>
            @quit()

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
        @mplist = @find "mplist"
        @dpath = @find "dpath"
        @ppath = @find "ppath"
        @mplist.set "buttons", [
            {
                text: "+",
                onbtclick: (e) =>
                    @parent.openDialog(new VFSSettingDialog(), {
                        title: "__(Add mount point)"
                    })
                    .then (d) =>
                        @parent.systemsetting.VFS.mountpoints.push {
                            text: d.name, path: d.path, iconclass: "fa fa-folder", type: "fs"
                        }
                        @refresh()
            },
            {
                text: "-",
                onbtclick: (e) =>
                    item = @mplist.get "selectedItem"
                    return unless item
                    selidx = $(item).index()
                    @parent.openDialog("YesNoDialog", {
                        title: "__(Remove)",
                        text: __("Remove: {0}?", item.get("data").text)
                    }).then (d) =>
                        return unless d
                        @parent.systemsetting.VFS.mountpoints.splice selidx, 1
                        @refresh()
            },
            {
                text: "",
                iconclass: "fa fa-pencil",
                onbtclick: (e) =>
                    sel = @mplist.get "selectedItem"
                    return unless sel
                    @parent.openDialog(new VFSSettingDialog(), {
                        title: "__(Edit mount point)",
                        text: sel.get("data").text,
                        path: sel.get("data").path
                    }).then (d) =>
                        sel.get("data").text = d.name
                        sel.get("data").path = d.path
                        @refresh()
            }
        ]
        (@find "btndpath").set 'onbtclick', (e) =>
            @parent.openDialog("FileDialog", {
                title: "__(Select a directory)",
                mimes: ["dir"],
                hidden: true
            }).then (d) =>
                @parent.systemsetting.desktop.path = d.file.path
                @parent._gui.refreshDesktop()
                @refresh()
        
        (@find "btnppath").set 'onbtclick', (e) =>
            @parent.openDialog("FileDialog", {
                title: "__(Select a directory)",
                mimes: ["dir"],
                hidden: true
            }).then (d) =>
                @parent.systemsetting.system.pkgpaths.user = d.file.path
                @refresh()
        @refresh()

    refresh: () ->
        @mplist.set "data", @parent.systemsetting.VFS.mountpoints
        @dpath.set "text", @parent.systemsetting.desktop.path
        @ppath.set "text", @parent.systemsetting.system.pkgpaths.user