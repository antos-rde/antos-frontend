/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

// AnTOS Web desktop is is licensed under the GNU General Public
// License v3.0, see the LICENCE file for more information

// This program is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as
// published by the Free Software Foundation, either version 3 of 
// the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.

// You should have received a copy of the GNU General Public License
//along with this program. If not, see https://www.gnu.org/licenses/.

class VFSSettingDialog extends this.OS.GUI.BasicDialog {
    constructor() {
        super("VFSSettingDialog", VFSSettingDialog.scheme);
    }
    
    main() {
        super.main();
        $(this.find("txtPath")).click(e => {
            return this.openDialog("FileDialog", {
                title: "__(Select a directory)",
                mimes: ["dir"],
                hidden: true
            })
            .then(d => {
                return (this.find("txtPath")).value = d.file.path;
            });
        });

        this.find("btnOk").set("onbtclick", e => {
            const data = {
                path: (this.find("txtPath")).value,
                name: (this.find("txtName")).value
            };
            if (!data.name || (data.name === "")) { return this.error(__("Please enter mount point name")); }
            if (!data.path || (data.path === "")) { return this.error(__("Please select a directory")); }
            if (this.handle) { this.handle(data); }
            return this.quit();
        });
        
        (this.find("btnCancel")).set("onbtclick", e => {
            return this.quit();
        });

        if (!this.data) { return; }
        if (this.data.text) { (this.find("txtName")).value = this.data.text; }
        if (this.data.path) { return (this.find("txtPath")).value = this.data.path; }
    }
}

VFSSettingDialog.scheme = `\
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
</afx-app-window>\
`;

class VFSHandle extends SettingHandle {
    constructor(scheme, parent) {
        super(scheme, parent);
        this.mplist = this.find("mplist");
        this.dpath = this.find("dpath");
        this.ppath = this.find("ppath");
        this.mplist.set("buttons", [
            {
                text: "+",
                onbtclick: e => {
                    return this.parent.openDialog(new VFSSettingDialog(), {
                        title: "__(Add mount point)"
                    })
                    .then(d => {
                        this.parent.systemsetting.VFS.mountpoints.push({
                            text: d.name, path: d.path, iconclass: "fa fa-folder", type: "fs"
                        });
                        return this.refresh();
                    });
                }
            },
            {
                text: "-",
                onbtclick: e => {
                    const item = this.mplist.get("selectedItem");
                    if (!item) { return; }
                    const selidx = $(item).index();
                    return this.parent.openDialog("YesNoDialog", {
                        title: "__(Remove)",
                        text: __("Remove: {0}?", item.get("data").text)
                    }).then(d => {
                        if (!d) { return; }
                        this.parent.systemsetting.VFS.mountpoints.splice(selidx, 1);
                        return this.refresh();
                    });
                }
            },
            {
                text: "",
                iconclass: "fa fa-pencil",
                onbtclick: e => {
                    const sel = this.mplist.get("selectedItem");
                    if (!sel) { return; }
                    return this.parent.openDialog(new VFSSettingDialog(), {
                        title: "__(Edit mount point)",
                        text: sel.get("data").text,
                        path: sel.get("data").path
                    }).then(d => {
                        sel.get("data").text = d.name;
                        sel.get("data").path = d.path;
                        return this.refresh();
                    });
                }
            }
        ]);
        (this.find("btndpath")).set('onbtclick', e => {
            return this.parent.openDialog("FileDialog", {
                title: "__(Select a directory)",
                mimes: ["dir"],
                hidden: true
            }).then(d => {
                this.parent.systemsetting.desktop.path = d.file.path;
                this.parent._gui.refreshDesktop();
                return this.refresh();
            });
        });
        
        (this.find("btnppath")).set('onbtclick', e => {
            return this.parent.openDialog("FileDialog", {
                title: "__(Select a directory)",
                mimes: ["dir"],
                hidden: true
            }).then(d => {
                this.parent.systemsetting.system.pkgpaths.user = d.file.path;
                return this.refresh();
            });
        });
        this.refresh();
    }

    refresh() {
        this.mplist.set("data", this.parent.systemsetting.VFS.mountpoints);
        this.dpath.set("text", this.parent.systemsetting.desktop.path);
        return this.ppath.set("text", this.parent.systemsetting.system.pkgpaths.user);
    }
}