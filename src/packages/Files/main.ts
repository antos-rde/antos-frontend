
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
    export namespace application {

        interface FilesClipboardType {
            cut: boolean;
            files: API.VFS.BaseFileHandle[];
        }
        interface FilesViewType {
            icon: boolean;
            list: boolean;
            tree: boolean;
        }
        /**
         *
         *
         * @export
         * @class Files
         * @extends {BaseApplication}
         */
        export class Files extends BaseApplication {
            private view: GUI.tag.FileViewTag;
            private navbar: GUI.tag.HBoxTag;
            private currdir: API.VFS.BaseFileHandle;
            private favo: GUI.tag.ListViewTag;
            private clipboard: FilesClipboardType;
            private viewType: FilesViewType;
            private vfs_event_flag: boolean;
            constructor(args: AppArgumentsType[]) {
                super("Files", args);
            }


            /**
             * main entry point
             *
             * @returns
             * @memberof Files
             */
            main(): void {
                this.view = this.find("fileview") as GUI.tag.FileViewTag;
                this.navbar = this.find("nav-bar") as GUI.tag.HBoxTag;
                this.favo = this.find("favouri") as GUI.tag.ListViewTag;
                this.clipboard = undefined;
                this.viewType = this._api.switcher("icon", "list", "tree");
                this.viewType.list = true;

                this.view.contextmenuHandle = (e, m) => {
                    const file = this.view.selectedFile;
                    const apps = [];
                    let ctx_menu = [
                        this.mnFile(),
                    ];
                    if(file)
                    {
                        ctx_menu.push(this.mnEdit());
                        if (file.type === "dir") {
                            file.mime = "dir";
                        }

                        for (let v of this._gui.appsByMime(file.mime)) {
                            apps.push({
                                text: v.text,
                                app: v.app,
                                icon: v.icon,
                                iconclass: v.iconclass,
                            });
                        }
                        ctx_menu.unshift( {
                            text: "__(Open with)",
                            nodes: apps,
                            onchildselect: (e: GUI.TagEventType<GUI.tag.StackMenuEventData>) => {
                                if (!e) {
                                    return;
                                }
                                const it = e.data.item.data;
                                return this._gui.launch(it.app, [file]);
                            },
                        });
                        if(file.mime === "application/zip")
                        {
                            ctx_menu = ctx_menu.concat([
                                {
                                    text: "__(Extract Here)",
                                    onmenuselect: (e: GUI.TagEventType<GUI.tag.StackMenuEventData>) => {
                                        if (!e) {
                                            return;
                                        }
                                        API.VFS.extractZip(file.path,
                                            (z) => new Promise((r,e) => r(file.path.asFileHandle().parent().path)))
                                        .catch((err) => this.error(__("Unable to extract file"), err));
                                    },
                                },
                                {
                                    text: "__(Extract to)",
                                    onmenuselect: async (e: GUI.TagEventType<GUI.tag.StackMenuEventData>) => {
                                        if (!e) {
                                            return;
                                        }
                                        try {
                                            OS.GUI.dialogs.FileDialog.last_opened = this.currdir.path;
                                            const d = await this.openDialog("FileDialog", {
                                                title: __("Select extract destination"),
                                                type: "dir",
                                                file: file.path.replace(".zip","").asFileHandle()
                                            });
                                            const path = `${d.file.path}/${d.name}`;
                                            await API.VFS.mkdirAll([path]);
                                            await API.VFS.extractZip(file.path,
                                                (z) => new Promise((r,e) => r(path)));
                                        } catch (error) {
                                            this.error(__("Unable to extract file"), error);
                                        }
                                    },
                                },
                            ]);
                        }
                        else
                        {
                            ctx_menu.push(
                                {
                                    text: "__(Compress)",
                                    onmenuselect: async (e: GUI.TagEventType<GUI.tag.StackMenuEventData>) => {
                                        if (!e) {
                                            return;
                                        }
                                        try {
                                            OS.GUI.dialogs.FileDialog.last_opened = this.currdir.path;
                                            const d = await this.openDialog("FileDialog", {
                                                title: __("Save compressed file to"),
                                                type: "dir",
                                                file: `${this.currdir.path}/${file.name}.zip`.asFileHandle()
                                            });
                                            if(d.name.trim() === "")
                                            {
                                                return this.error(__("Invalid file name"));
                                            }
                                            const path = `${d.file.path}/${d.name}`;
                                            await API.VFS.mkar(file.path, path);
                                            this.toast(__("Archive file created: {0}",path ));
                                        } catch (error) {
                                            this.error(__("Unable to compress file, folder"), error);
                                        }
                                    }
                                }
                            );
                        }

                    }
                    m.nodes = ctx_menu;
                    m.show(e);
                };

                this.view.onfileopen = (e) => {
                    if (!e.data) {
                        return;
                    }
                    if (e.data.type === "dir") {
                        return;
                    }
                    return this._gui.openWith(e.data);
                };

                this.favo.onlistselect = (e) => {
                    if(this.currdir.path.startsWith(e.data.item.data.path))
                    {
                        return;
                    }
                    return this.view.path = e.data.item.data.path;
                };

                (this.find("btback") as GUI.tag.ButtonTag).onbtclick = () => {
                    if (this.currdir.isRoot()) {
                        return;
                    }
                    const p = this.currdir.parent();
                    this.favo.selected = -1;
                    return this.view.path = p.path;
                };

                this.view.fetch = (path) => {
                    return new Promise((resolve, reject) => {
                        let dir = path.asFileHandle();
                        dir
                            .read()
                            .then((d) => {
                                if (d.error) {
                                    return reject(d.error);
                                }
                                return resolve(d.result);
                            })
                            .catch((e) => reject(__e(e)));
                    });
                };
                const p_list = this.find<GUI.tag.TabBarTag>("path-nav");
                p_list.ontabselect = (e) => {
                    const handle: API.VFS.BaseFileHandle = e.data.item.data.handle;
                    if(this.currdir.path == handle.path)
                    {
                        return;
                    }
                    this.view.path = handle.path;
                }
                this.view.onchdir = (e) => {
                    const dir = (e.data.path as string).asFileHandle();
                    this.currdir = dir;
                    if(dir.genealogy)
                    {
                        (this.scheme as GUI.tag.WindowTag).apptitle = dir.filename;
                    }
                    else
                    {
                        (this.scheme as GUI.tag.WindowTag).apptitle = `${dir.protocol}://`;
                    }
                    // update the path-nav
                    let base_vfs = `${dir.protocol}://`.asFileHandle();
                    let segments = [{
                        text: base_vfs.path,
                        handle: base_vfs
                    }]
                    if(dir.genealogy)
                    {
                        
                        segments = segments.concat(dir.genealogy.map((e)=> {
                            base_vfs = `${base_vfs.path}/${e}`.asFileHandle();
                            return {
                                text: e,
                                handle: base_vfs
                            }
                        }));
                    }
                    p_list.items = segments;
                    p_list.scroll_to_end();
                    // update the current favo
                    const matched = this.favo.data.map((e,i) => {
                        return {
                            path: e.path,
                            index:i
                        }
                    })
                    .filter(e => {
                        return dir.path.startsWith(e.path as string);
                    });
                    if(matched.length != 0)
                    {
                        //console.log(matched[0]);
                        this.favo.selected = matched[0].index;
                    }
                }
                this.vfs_event_flag = true;
                this.view.ondragndrop = async (e) => {
                    if (!e) {
                        return;
                    }
                    const src = e.data.from;
                    const des = e.data.to.data;
                    if (des.type === "file") {
                        return;
                    }
                    // ask to confirm
                    const r = await this.ask({
                        title: __("Move files"),
                        text: __("Move selected file to {0}?", des.text)
                    });
                    if(!r)
                    {
                        return;
                    }
                    // disable the vfs event on
                    // we update it manually
                    this.vfs_event_flag = false;
                    const promises = [];
                    for(const item of src)
                    {
                        let file = item.data.path.asFileHandle();
                        promises.push(
                            file.move(`${des.path}/${file.basename}`));
                    }
                    try{
                        await Promise.all(promises);
                        if (this.view.view === "tree") {
                            this.view.update(src[0].data.path.asFileHandle().parent().path);
                            this.view.update(des.path);
                        } else {
                            this.view.path = this.view.path;
                        }
                    }
                    catch(error)
                    {
                        this.error(
                                __(
                                    "Unable to move files to: {0}",
                                    des.path
                                ),
                                error
                            );
                    }
                    this.vfs_event_flag = true;
                };
                if (this.setting.nav === undefined) {
                    this.setting.nav = true;
                }
                if (this.setting.showhidden === undefined) {
                    this.setting.showhidden = false;
                }
                this.applyAllSetting();

                // VFS mount point and event
                const mntpoints =  this.systemsetting.VFS.mountpoints.map(e => {
                    return {
                        text: e.text,
                        path: e.path,
                        icon: e.icon,
                        iconclass: e.iconclass,
                        selected: false
                    }
                });
                this.favo.data = mntpoints;
                if (this.setting.view) {
                    this.view.view = this.setting.view;
                }
                this.subscribe("VFS", (d: API.AnnouncementDataType<API.VFS.BaseFileHandle>) => {
                    if (!this.vfs_event_flag) {
                        return;
                    }
                    if (["read", "publish", "download"].includes(d.message as string)) {
                        return;
                    }
                    if (
                        d.u_data.hash() === this.currdir.hash() ||
                        d.u_data.parent().hash() === this.currdir.hash()
                    ) {
                        return this.view.path = this.currdir.path;
                    }
                });

                // register responsive event
                this.morphon(GUI.RESPONSIVE.MEDIUM, (fulfilled:boolean) => {
                    /**
                     * If the Window is bigger than medium size, then
                     * we enable the side bar
                     * 
                     * otherwise, use the top bar
                     */
                    const box = this.find("container") as GUI.tag.TileLayoutTag;
                    const nav = this.find("nav-bar") as GUI.tag.TileLayoutTag;
                    const fav = this.find("favouri") as GUI.tag.ListViewTag;
                    const resizer = this.find("resizer") as GUI.tag.ResizerTag;
                    if(fulfilled)
                    {
                        box.name = "hbox";
                        box.dir = "row";

                        nav.reversed = true;
                        nav.name = "vbox";
                        nav.dir = "column";

                        fav.dropdown = false;

                        resizer.dir = "hz";
                        resizer.disable = false;
                    }
                    else
                    {
                        box.name = "vbox";
                        box.dir = "column";

                        nav.reversed = false;
                        nav.name = "hbox";
                        nav.dir = "row";

                        fav.dropdown = true;

                        resizer.dir = "ve";
                        resizer.disable = true;
                    }
                });

                // bind keyboard shortcut
                this.bindKey("CTRL-F", () =>
                    this.actionFile(`${this.name}-mkf`)
                );
                this.bindKey("CTRL-D", () =>
                    this.actionFile(`${this.name}-mkdir`)
                );
                this.bindKey("CTRL-U", () =>
                    this.actionFile(`${this.name}-upload`)
                );
                this.bindKey("CTRL-S", () =>
                    this.actionFile(`${this.name}-share`)
                );
                this.bindKey("CTRL-I", () =>
                    this.actionFile(`${this.name}-info`)
                );

                this.bindKey("CTRL-R", () =>
                    this.actionEdit(`${this.name}-mv`)
                );
                this.bindKey("CTRL-M", () =>
                    this.actionEdit(`${this.name}-rm`)
                );
                this.bindKey("CTRL-X", () =>
                    this.actionEdit(`${this.name}-cut`)
                );
                this.bindKey("CTRL-C", () =>
                    this.actionEdit(`${this.name}-copy`)
                );
                this.bindKey("CTRL-P", () =>
                    this.actionEdit(`${this.name}-paste`)
                );
                this.bindKey("CTRL-ALT-R", ()=>{
                    this.view.path = this.currdir.path;
                });
                (this.find("btgrid") as GUI.tag.ButtonTag).onbtclick = (e) => {
                    this.view.view = "icon";
                    this.viewType.icon = true;
                };

                (this.find("btlist") as GUI.tag.ButtonTag).onbtclick = (e) => {
                    this.view.view = "list";
                    this.viewType.list = true;
                };
                // enable or disable multi-select by CTRL key
                $(this.scheme).on("keydown", (evt)=>{
                    if(evt.ctrlKey && evt.which == 17)
                    {
                        this.view.multiselect = true;
                    }
                    else
                    {
                        this.view.multiselect = false;
                    }
                });
                 $(this.scheme).on("keyup", (evt)=>{
                    if(evt.which === 38)
                    {
                        if (this.currdir.isRoot()) {
                            return;
                        }
                        const p = this.currdir.parent();
                        this.favo.selected = -1;
                        return this.view.path = p.path;
                    }
                    if(!evt.ctrlKey)
                    {
                        this.view.multiselect = false;
                    }
                });
                if (this.args && this.args.length > 0) {
                    this.currdir = this.args[0].path.asFileHandle();
                } else {
                    this.currdir = "home://".asFileHandle();
                }
                this.view.path = this.currdir.path;
            }

            protected applySetting(k: string): void{
                // view setting
                switch (k) {
                    case "showhidden":
                        return this.view.showhidden = this.setting.showhidden;
                    case "nav":
                        return this.toggleNav(this.setting.nav);
                }
            }

            private mnFile(): GUI.BasicItemType{
                //console.log file
                const arr: GUI.BasicItemType = {
                    text: "__(File)",
                    nodes: [
                        {
                            text: "__(New file)",
                            dataid: `${this.name}-mkf`,
                            shortcut: "C-F",
                        },
                        {
                            text: "__(New folder)",
                            dataid: `${this.name}-mkdir`,
                            shortcut: "C-D",
                        },
                        {
                            text: "__(Upload)",
                            dataid: `${this.name}-upload`,
                            shortcut: "C-U",
                        },
                        {
                            text: "__(Download)",
                            dataid: `${this.name}-download`,
                        },
                        {
                            text: "__(Share file)",
                            dataid: `${this.name}-share`,
                            shortcut: "C-S",
                        },
                        {
                            text: "__(Properties)",
                            dataid: `${this.name}-info`,
                            shortcut: "C-I",
                        },
                    ],
                    onchildselect: (e: GUI.TagEventType<GUI.tag.StackMenuEventData>) =>
                        this.actionFile(e.data.item.data.dataid),
                };
                return arr;
            }
            private mnEdit(): GUI.BasicItemType{
                return {
                    text: "__(Edit)",
                    nodes: [
                        {
                            text: "__(Rename)",
                            dataid: `${this.name}-mv`,
                            shortcut: "C-R",
                        },
                        {
                            text: "__(Delete)",
                            dataid: `${this.name}-rm`,
                            shortcut: "C-M",
                        },
                        {
                            text: "__(Cut)",
                            dataid: `${this.name}-cut`,
                            shortcut: "C-X",
                        },
                        {
                            text: "__(Copy)",
                            dataid: `${this.name}-copy`,
                            shortcut: "C-C",
                        },
                        {
                            text: "__(Paste)",
                            dataid: `${this.name}-paste`,
                            shortcut: "C-P",
                        },
                    ],
                    onchildselect: (e: GUI.TagEventType<GUI.tag.StackMenuEventData>) =>
                        this.actionEdit(e.data.item.data.dataid),
                };
            }
            protected menu(): GUI.BasicItemType[]{
                const menu = [
                    this.mnFile(),
                    this.mnEdit(),
                    {
                        text: "__(View)",
                        nodes: [
                            {
                                text: "__(Toggle responsive)",
                                dataid: `${this.name}-responsive`,
                            },
                            {
                                text: "__(Refresh)",
                                dataid: `${this.name}-refresh`,
                                shortcut: "C-A-R"
                            },
                            {
                                text: "__(Navigation bar)",
                                switch: true,
                                checked: this.setting.nav,
                                dataid: `${this.name}-nav`,
                            },
                            {
                                text: "__(Hidden files)",
                                switch: true,
                                checked: this.setting.showhidden,
                                dataid: `${this.name}-hidden`,
                            },
                            {
                                text: "__(Type)",
                                nodes: [
                                    {
                                        text: "__(Icon view)",
                                        radio: true,
                                        checked: this.viewType.icon,
                                        dataid: `${this.name}-icon`,
                                        type: "icon",
                                    },
                                    {
                                        text: "__(List view)",
                                        radio: true,
                                        checked: this.viewType.list,
                                        dataid: `${this.name}-list`,
                                        type: "list",
                                    },
                                    {
                                        text: "__(Tree view)",
                                        radio: true,
                                        checked: this.viewType.tree,
                                        dataid: `${this.name}-tree`,
                                        type: "tree",
                                    },
                                ],
                                onchildselect: (e: GUI.TagEventType<GUI.tag.StackMenuEventData>) => {
                                    const { type } = e.data.item.data;
                                    this.view.view = type;
                                    return (this.viewType[type] = true);
                                },
                            },
                        ],
                        onchildselect: (e: GUI.TagEventType<GUI.tag.StackMenuEventData>) => this.actionView(e),
                    },
                ];
                return menu;
            }

            private toggleNav(b: boolean): void {
                if (b) {
                    $(this.navbar).show();
                } else {
                    $(this.navbar).hide();
                }
                return this.trigger("resize");
            }

            private actionView(e: GUI.TagEventType<GUI.tag.StackMenuEventData>): void{
                const data = e.data.item.data;
                switch (data.dataid) {
                    case `${this.name}-hidden`:
                        //@.view.set "showhidden", e.item.data.checked
                        this.setting.showhidden = data.checked;
                    //@.setting.showhidden = e.item.data.checked
                    case `${this.name}-refresh`:
                        this.view.path = this.currdir.path;
                        return;
                    case `${this.name}-responsive`:
                        const win = (this.scheme as GUI.tag.WindowTag);
                        win.responsive = !win.responsive;
                        return;
                    case `${this.name}-nav`:
                        this.setting.nav = data.checked;
                }
            }
            //@setting.nav = e.item.data.checked
            //@toggleNav e.item.data.checked

            private actionEdit(e: string): void{
                const file = this.view.selectedFile;
                switch (e) {
                    case `${this.name}-mv`:
                        if (!file) {
                            return;
                        }
                        this.openDialog("PromptDialog", {
                            title: "__(Rename)",
                            label: "__(File name)",
                            value: file.filename,
                        }).then(async (d) => {
                            if (d === file.filename) {
                                return;
                            }
                            try {
                                return file.path
                                    .asFileHandle()
                                    .move(`${this.currdir.path}/${d}`);
                            }
                            catch (e) {
                                return this.error(__("Fail to rename: {0}", file.path), e);
                            }
                        });
                        break;

                    case `${this.name}-rm`:
                        if (!file) {
                            return;
                        }
                        this.openDialog("YesNoDialog", {
                            title: "__(Delete)",
                            iconclass: "fa fa-question-circle",
                            text: __(
                                "Do you really want to delete selected files?"
                            ),
                        }).then(async (d) => {
                            if (!d) {
                                return;
                            }
                            const promises = [];
                            for(const f of this.view.selectedFiles)
                            {
                                promises.push(f.path.asFileHandle().remove());
                            }
                            try {
                                await Promise.all(promises);
                            }
                            catch (e) {
                                return this.error(__("Fail to delete selected files"), e);
                            }
                        });
                        break;

                    case `${this.name}-cut`:
                        if (!file) {
                            return;
                        }
                        this.clipboard = {
                            cut: true,
                            files: this.view.selectedFiles.map(x => x.path.asFileHandle()),
                        };
                        return this.toast(__("{0} files cut", this.clipboard.files.length));

                    case `${this.name}-copy`:
                        if (!file) {
                            return;
                        }
                        this.clipboard = {
                            cut: false,
                            files: this.view.selectedFiles.map(x => x.path.asFileHandle()),
                        };
                        return this.toast(
                            __("{0} files copied", this.clipboard.files.length)
                        );

                    case `${this.name}-paste`:
                        if (!this.clipboard) {
                            return;
                        }
                        if (this.clipboard.cut) {
                            const promises = [];
                            for(const file of this.clipboard.files)
                            {
                                promises.push(file.move(
                                    `${this.currdir.path}/${file.basename}`
                                ));
                            }
                            Promise.all(promises)
                                .then((r) => {
                                    return (this.clipboard = undefined);
                                })
                                .catch((e) => {
                                    return this.error(
                                        __(
                                            "Fail to paste to: {0}",
                                            this.currdir.path
                                        ),
                                        e
                                    );
                                });
                        } else {
                            API.VFS.copy(this.clipboard.files.map(x => x.path),this.currdir.path)
                                .then(() => {
                                    return (this.clipboard = undefined);
                                })
                                .catch((e) => {
                                    return this.error(__("Fail to paste to: {0}", this.currdir.path), e);
                                });
                        }
                        break;
                    default:
                        this._api.handle.setting();
                }
            }

            private actionFile(e: string): void{
                const file = this.view.selectedFile;
                switch (e) {
                    case `${this.name}-mkdir`:
                        this.openDialog("PromptDialog", {
                            title: "__(New folder)",
                            label: "__(Folder name)",
                        }).then(async (d) => {
                            try {
                                return this.currdir.mk(d);
                            }
                            catch (e) {
                                return this.error(__("Fail to create: {0}", d), e);
                            }
                        });
                        break;
                    case `${this.name}-mkf`:
                        this.openDialog("PromptDialog", {
                            title: "__(New file)",
                            label: "__(File name)",
                        }).then(async (d) => {
                            const fp = `${this.currdir.path}/${d}`.asFileHandle();
                            try {
                                return fp.write("text/plain");
                            }
                            catch (e) {
                                return this.error(__("Fail to create: {0}", fp.path));
                            }
                        });
                        break;
                    case `${this.name}-info`:
                        if (!file) {
                            return;
                        }
                        this.openDialog("InfoDialog", file);
                        break;

                    case `${this.name}-upload`:
                        this.currdir.upload().catch((e) => {
                            return this.error(
                                __("Fail to upload: {0}", e.toString()),
                                e
                            );
                        });
                        break;

                    case `${this.name}-share`:
                        if (!file || file.type !== "file") {
                            return;
                        }
                        file.path
                            .asFileHandle()
                            .publish()
                            .then((r) => {
                                return this.notify(
                                    __("Shared url: {0}", r.result));
                            })
                            .catch((e) => {
                                return this.error(
                                    __("Fail to publish: {0}", file.path),
                                    e
                                );
                            });
                        break;
                    case `${this.name}-download`:
                        if (!file || file.type !== "file") {
                            return;
                        }
                        file.path
                            .asFileHandle()
                            .download()
                            .catch((e) => {
                                return this.error(
                                    __("Fail to download: {0}", file.path),
                                    e
                                );
                            });
                        break;
                    default:
                        return console.log(e);
                }
            }
        }
    }
}
