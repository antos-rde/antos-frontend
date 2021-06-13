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

namespace OS {
    const App = OS.application.Setting;

    /**
     *
     *
     * @class VFSSettingDialog
     * @extends {GUI.BasicDialog}
     */
    class VFSSettingDialog extends GUI.BasicDialog {
        /**
         *Creates an instance of VFSSettingDialog.
         * @memberof VFSSettingDialog
         */
        constructor() {
            super("VFSSettingDialog", VFSSettingDialog.scheme);
        }

        /**
         *
         *
         * @returns
         * @memberof VFSSettingDialog
         */
        main() {
            super.main();
            $(this.find("txtPath")).click((e) => {
                return this.openDialog("FileDialog", {
                    title: "__(Select a directory)",
                    mimes: ["dir"],
                    hidden: true,
                }).then((d) => {
                    return ((this.find("txtPath") as HTMLInputElement).value =
                        d.file.path);
                });
            });

            (this.find("btnOk") as GUI.tag.ButtonTag).onbtclick = (e) => {
                const data = {
                    path: (this.find("txtPath") as HTMLInputElement).value,
                    name: (this.find("txtName") as HTMLInputElement).value,
                };
                if (!data.name || data.name === "") {
                    return this.error(__("Please enter mount point name"));
                }
                if (!data.path || data.path === "") {
                    return this.error(__("Please select a directory"));
                }
                if (this.handle) {
                    this.handle(data);
                }
                return this.quit();
            };

            (this.find("btnCancel") as GUI.tag.ButtonTag).onbtclick = (e) => {
                return this.quit();
            };

            if (!this.data) {
                return;
            }
            if (this.data.text) {
                (this.find(
                    "txtName"
                ) as HTMLInputElement).value = this.data.text;
            }
            if (this.data.path) {
                return ((this.find(
                    "txtPath"
                ) as HTMLInputElement).value = this.data.path);
            }
        }
    }

    VFSSettingDialog.scheme = `\
<afx-app-window  width='250' height='180' apptitle = "__(Mount Points)">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" ></div>
            <afx-vbox>
                <div data-height="10" ></div>
                <afx-label data-height="30" text = "__(Name)" ></afx-label>
                <input type = "text" data-id= "txtName" ></input>
                <div data-height="3" ></div>
                <afx-label data-height="30" text = "__(Path)" ></afx-label>
                <input type = "text" data-id= "txtPath" ></input>
                <div data-height="10" ></div>
                <afx-hbox data-height="30">
                    <div ></div>
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" ></afx-button>
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" ></afx-button>
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" ></div>
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
`;

    /**
     *
     *
     * @class VFSHandle
     * @extends {App.SettingHandle}
     */
    class VFSHandle extends App.SettingHandle {
        private mplist: GUI.tag.ListViewTag;
        private dpath: GUI.tag.LabelTag;
        private ppath: GUI.tag.LabelTag;

        /**
         *Creates an instance of VFSHandle.
         * @param {HTMLElement} scheme
         * @param {OS.application.Setting} parent
         * @memberof VFSHandle
         */
        constructor(scheme: HTMLElement, parent: OS.application.Setting) {
            super(scheme, parent);
            this.mplist = this.find("mplist") as GUI.tag.ListViewTag;
            this.dpath = this.find("dpath") as GUI.tag.LabelTag;
            this.ppath = this.find("ppath") as GUI.tag.LabelTag;
            this.mplist.buttons = [
                {
                    text: "+",
                    onbtclick: async () => {
                        const d = await this.parent.openDialog(
                            new VFSSettingDialog(),
                            {
                                title: "__(Add mount point)",
                            }
                        );
                        setting.VFS.mountpoints.push({
                            text: d.name,
                            path: d.path,
                            iconclass: "fa fa-folder",
                            type: "fs",
                        });
                        return this.refresh();
                    },
                },
                {
                    text: "-",
                    onbtclick: async () => {
                        const item = this.mplist.selectedItem;
                        if (!item) {
                            return;
                        }
                        const selidx = $(item).index();
                        const d = await this.parent.openDialog("YesNoDialog", {
                            title: "__(Remove)",
                            text: __("Remove: {0}?", item.data.text),
                        });
                        if (!d) {
                            return;
                        }
                        setting.VFS.mountpoints.splice(selidx, 1);
                        return this.refresh();
                    },
                },
                {
                    text: "",
                    iconclass: "fa fa-pencil",
                    onbtclick: async () => {
                        const sel = this.mplist.selectedItem;
                        if (!sel) {
                            return;
                        }
                        const d = await this.parent.openDialog(
                            new VFSSettingDialog(),
                            {
                                title: "__(Edit mount point)",
                                text: sel.data.text,
                                path: sel.data.path,
                            }
                        );
                        sel.data.text = d.name;
                        sel.data.path = d.path;
                        return this.refresh();
                    },
                },
            ];
            (this.find(
                "btndpath"
            ) as GUI.tag.ButtonTag).onbtclick = async () => {
                const d = await this.parent.openDialog("FileDialog", {
                    title: "__(Select a directory)",
                    mimes: ["dir"],
                    hidden: true,
                });
                setting.desktop.path = d.file.path;
                GUI.refreshDesktop();
                return this.refresh();
            };

            (this.find(
                "btnppath"
            ) as GUI.tag.ButtonTag).onbtclick = async () => {
                const d = await this.parent.openDialog("FileDialog", {
                    title: "__(Select a directory)",
                    mimes: ["dir"],
                    hidden: true,
                });
                setting.system.pkgpaths.user = d.file.path;
                return this.refresh();
            };
            this.refresh();
        }

        /**
         *
         *
         * @private
         * @memberof VFSHandle
         */
        private refresh(): void {
            this.mplist.data = setting.VFS.mountpoints;
            this.dpath.text = setting.desktop.path;
            this.ppath.text = setting.system.pkgpaths.user;
        }
    }

    App.VFSHandle = VFSHandle;
}
