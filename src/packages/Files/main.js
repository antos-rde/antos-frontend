/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS208: Avoid top-level this
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

class Files extends this.OS.GUI.BaseApplication {
    constructor(args) {
        super("Files", args);
    }
    
    main() {
        this.scheme.set("apptitle", "Files manager");
        this.view = this.find("fileview");
        this.navinput = this.find("navinput");
        this.navbar = this.find("nav-bar");
        if (this.args && (this.args.length > 0)) {
            this.currdir = this.args[0].path.asFileHandle();
        } else {
            this.currdir = "home://".asFileHandle();
        }
        this.favo = this.find("favouri");
        this.clipboard = undefined;
        this.viewType = this._api.switcher("icon", "list", "tree");
        this.viewType.list = true;

        this.view.contextmenuHandle = (e, m) => {
            const file = this.view.get("selectedFile");
            if (!file) { return; }
            const apps = [];
            if (file.type === "dir") { file.mime = "dir"; }
                
            for (let v of Array.from(this._gui.appsByMime(file.mime))) {
                apps.push({
                    text: v.text,
                    app: v.app,
                    icon: v.icon,
                    iconclass: v.iconclass
                });
            }
                
            m.set("items", [
                {
                    text: "__(Open with)",
                    child: apps,
                    onchildselect: e => {
                        if (!e) { return; }
                        const it = e.data.item.get("data");
                        return this._gui.launch(it.app, [file]);
                    }
                },
                this.mnFile(),
                this.mnEdit()
            ]);
            return m.show(e);
        };
        
        this.view.set("onfileopen", e => {
            if (!e.data) { return; }
            if (e.data.type === "dir") { return; }
            return this._gui.openWith(e.data);
        });

        this.favo.set("onlistselect", e => {
            return this.view.set("path", e.data.item.get("data").path);
        });
        
        ($(this.find("btback"))).click(() => {
            if (this.currdir.isRoot()) { return; }
            const p = this.currdir.parent();
            this.favo.set("selected", -1);
            return this.view.set("path", p.path);
        });

        ($(this.navinput)).keyup(e => {
            if (e.keyCode === 13) { return this.view.set("path", ($(this.navinput)).val()); }
        }); //enter
        
        this.view.set("fetch", path => {
            return new Promise((resolve, reject) => {
                let dir = path;
                if (typeof path === "string") { dir = path.asFileHandle(); }
                return dir.read().then(d => {
                    if (d.error) { return reject(d.error); }
                    if (!dir.isRoot()) {
                        const p = dir.parent();
                        p.filename = "[..]";
                        p.type = "dir";
                        d.result.unshift(p);
                    }
                    this.currdir = dir;
                    ($(this.navinput)).val(dir.path);
                    return resolve(d.result);
            }).catch(e => reject(__e(e)));
            });
        });
        
        this.vfs_event_flag = true;
        this.view.set("ondragndrop", e => {
            if (!e) { return; }
            const src = e.data.from.get("data");
            const des = e.data.to.get("data");
            if (des.type === "file") { return; }
            const file = src.path.asFileHandle();
            // disable the vfs event on
            // we update it manually
            this.vfs_event_flag = false;
            return file.move(`${des.path}/${file.basename}`)
                .then(() => {
                    if (this.view.get("view") === "icon") {
                        this.view.set("path", this.view.get("path"));
                    } else {
                        this.view.update(file.parent().path);
                        this.view.update(des.path);
                    }
                    //reenable the vfs event
                    return this.vfs_event_flag = true;
            }).catch(e => {
                    // reenable the vfs event
                    this.vfs_event_flag = true;
                    return this.error(__("Unable to move: {0} -> {1}", src.path, des.path), e);
            });
        });

        // application setting
        if (this.setting.sidebar === undefined) { this.setting.sidebar = true; }
        if (this.setting.nav === undefined) { this.setting.nav = true; }
        if (this.setting.showhidden === undefined) { this.setting.showhidden = false; }
        this.applyAllSetting();

        // VFS mount point and event
        const mntpoints = this.systemsetting.VFS.mountpoints;
        for (let i = 0; i < mntpoints.length; i++) { const el = mntpoints[i]; el.selected = false; }
        this.favo.set("data", mntpoints);
        //@favo.set "selected", -1
        if (this.setting.view) { this.view.set("view", this.setting.view); }
        this.subscribe("VFS", d => {
            if (!this.vfs_event_flag) { return; }
            if  (["read", "publish", "download"].includes(d.data.m)) { return; }
            if ((d.data.file.hash() === this.currdir.hash()) ||
                    (d.data.file.parent().hash() === this.currdir.hash())) {
                return this.view.set("path", this.currdir);
            }
        });
        
        // bind keyboard shortcut
        this.bindKey("CTRL-F", () => this.actionFile(`${this.name}-mkf`));
        this.bindKey("CTRL-D", () => this.actionFile(`${this.name}-mkdir`));
        this.bindKey("CTRL-U", () => this.actionFile(`${this.name}-upload`));
        this.bindKey("CTRL-S", () => this.actionFile(`${this.name}-share`));
        this.bindKey("CTRL-I", () => this.actionFile(`${this.name}-info`));

        this.bindKey("CTRL-R", () => this.actionEdit(`${this.name}-mv`));
        this.bindKey("CTRL-M", () => this.actionEdit(`${this.name}-rm`));
        this.bindKey("CTRL-X", () => this.actionEdit(`${this.name}-cut`));
        this.bindKey("CTRL-C", () => this.actionEdit(`${this.name}-copy`));
        this.bindKey("CTRL-P", () => this.actionEdit(`${this.name}-paste`));

        (this.find("btgrid")).set("onbtclick", e => {
            this.view.set('view', "icon");
            return this.viewType.icon = true;
        });

        (this.find("btlist")).set("onbtclick", e => {
            this.view.set('view', "list");
            return this.viewType.list = true;
        });
        return this.view.set("path", this.currdir);
    }

    applySetting(k) {
        // view setting
        switch (k) {
            case "showhidden": return this.view.set("showhidden", this.setting.showhidden);
            case "nav": return this.toggleNav(this.setting.nav);
            case "sidebar": return this.toggleSidebar(this.setting.sidebar);
        }
    }

    mnFile() {
        //console.log file
        const arr = {
            text: "__(File)",
            child: [
                { text: "__(New file)", dataid: `${this.name}-mkf`, shortcut: 'C-F' },
                { text: "__(New folder)", dataid: `${this.name}-mkdir`, shortcut: 'C-D' },
                { text: "__(Upload)", dataid: `${this.name}-upload`, shortcut: 'C-U' },
                { text: "__(Download)", dataid: `${this.name}-download` },
                { text: "__(Share file)", dataid: `${this.name}-share`, shortcut: 'C-S' },
                { text: "__(Properties)", dataid: `${this.name}-info`, shortcut: 'C-I' }
            ], onchildselect: e => this.actionFile(e.data.item.get("data").dataid)
        };
        return arr;
    }
    mnEdit() {
        return {
            text: "__(Edit)",
            child: [
                { text: "__(Rename)", dataid: `${this.name}-mv`, shortcut: 'C-R' },
                { text: "__(Delete)", dataid: `${this.name}-rm`, shortcut: 'C-M' },
                { text: "__(Cut)", dataid: `${this.name}-cut`, shortcut: 'C-X' },
                { text: "__(Copy)", dataid: `${this.name}-copy`, shortcut: 'C-C' },
                { text: "__(Paste)", dataid: `${this.name}-paste`, shortcut: 'C-P' }
            ], onchildselect: e => this.actionEdit(e.data.item.get("data").dataid)
        };
    }
    menu() {

        const menu = [
            this.mnFile(),
            this.mnEdit(),
            {
                text: "__(View)",
                child: [
                    { text: "__(Refresh)", dataid: `${this.name}-refresh` },
                    { text: "__(Sidebar)", switch: true, checked: this.setting.sidebar, dataid: `${this.name}-side` },
                    { text: "__(Navigation bar)", switch: true, checked: this.setting.nav, dataid: `${this.name}-nav` },
                    { text: "__(Hidden files)", switch: true, checked: this.setting.showhidden, dataid: `${this.name}-hidden` },
                    { text: "__(Type)", child: [
                        { text: "__(Icon view)", radio: true, checked: this.viewType.icon, dataid: `${this.name}-icon`, type: 'icon' },
                        { text: "__(List view)", radio:true, checked: this.viewType.list, dataid: `${this.name}-list`, type: 'list' },
                        { text: "__(Tree view)", radio:true, checked: this.viewType.tree, dataid: `${this.name}-tree`, type: 'tree' }
                     ], onchildselect: e => {
                        const {
                            type
                        } = e.data.item.get("data");
                        this.view.set('view', type);
                        return this.viewType[type] = true;
                    }
                    },
                ], onchildselect: e => this.actionView(e)
            },
        ];
        return menu;
    }

    toggleSidebar(b) {
        if (b) { ($(this.favo)).show(); } else { ($(this.favo)).hide(); }
        return this.trigger("resize");
    }
    
    toggleNav(b) {
        if (b) { ($(this.navbar)).show(); } else { ($(this.navbar)).hide(); }
        return this.trigger("resize");
    }

    actionView(e) {
        const data = e.data.item.get("data");
        switch (data.dataid) {
            case `${this.name}-hidden`:
                //@.view.set "showhidden", e.item.data.checked
                return this.registry("showhidden", data.checked);
                //@.setting.showhidden = e.item.data.checked
            case `${this.name}-refresh`:
                return this.chdir(null);
            case `${this.name}-side`:
                return this.registry("sidebar", data.checked);
                //@setting.sidebar = e.item.data.checked
                //@toggleSidebar e.item.data.checked
            case `${this.name}-nav`:
                return this.registry("nav", data.checked);
        }
    }
                //@setting.nav = e.item.data.checked
                //@toggleNav e.item.data.checked

    actionEdit(e) {
        const file = this.view.get("selectedFile");
        switch (e) {
            case `${this.name}-mv`:
                if (!file) { return; }
                return this.openDialog("PromptDialog", {
                    title: "__(Rename)",
                    label: "__(File name)",
                    value: file.filename
                })
                    .then(d => {
                        if (d === file.filename) { return; }
                        return file.path.asFileHandle().move(`${this.currdir.path}/${d}`)
                            .catch(e => {
                                return this.error(__("Fail to rename: {0}", file.path), e);
                        });
                });
            
            case `${this.name}-rm`:
                if (!file) { return; }
                return this.openDialog("YesNoDialog", {
                    title: "__(Delete)",
                    iconclass: "fa fa-question-circle",
                    text: __("Do you really want to delete: {0}?", file.filename)
                })
                    .then(d => {
                        if (!d) { return; }
                        return file.path.asFileHandle().remove()
                            .catch(e => {
                                return this.error(__("Fail to delete: {0}", file.path), e);
                        });
                });
            
            case `${this.name}-cut`:
                if (!file) { return; }
                this.clipboard = {
                    cut: true,
                    file: file.path.asFileHandle()
                };
                return this.notify(__("File {0} cut", file.filename));
            
            case `${this.name}-copy`:
                if (!file && (file.type !== "dir")) { return; }
                this.clipboard = {
                    cut: false,
                    file: file.path.asFileHandle()
                };
                return this.notify(__("File {0} copied", file.filename));

            case `${this.name}-paste`:
                if (!this.clipboard) { return; }
                if (this.clipboard.cut) {
                    return this.clipboard.file.move(`${this.currdir.path}/${this.clipboard.file.basename}`)
                        .then(r => {
                            return this.clipboard = undefined;
                    }).catch(e => {
                            return this.error(__("Fail to paste: {0}", this.clipboard.file.path), e);
                    });
                } else {
                    return this.clipboard.file.read("binary")
                        .then(d => {
                            const blob = new Blob([d], { type: this.clipboard.file.info.mime });
                            const fp = `${this.currdir.path}/${this.clipboard.file.basename}`.asFileHandle();
                            fp.cache = blob;
                            return fp.write(this.clipboard.file.info.mime)
                                .then(r => {
                                    return this.clipboard = undefined;
                            }).catch(e => {
                                    return this.error(__("Fail to paste: {0}", this.clipboard.file.path), e);
                            });
                    }).catch(e => {
                            return this.error(__("Fail to read: {0}", this.clipboard.file.path), e);
                    });
                }
            default:
                return this._api.handle.setting();
        }
    }
    
    actionFile(e) {
        const file = this.view.get("selectedFile");
        switch (e) {
            case `${this.name}-mkdir`:
                return this.openDialog("PromptDialog", {
                    title: "__(New folder)",
                    label: "__(Folder name)"
                })
                    .then(d => {
                        return this.currdir.mk(d)
                            .catch(e => {
                                return this.error(__("Fail to create: {0}", d), e);
                        });
                });
            
            case `${this.name}-mkf`:
                return this.openDialog("PromptDialog", {
                    title: "__(New file)",
                    label: "__(File name)"
                })
                    .then(d => {
                        const fp = `${this.currdir.path}/${d}`.asFileHandle();
                        return fp.write("text/plain")
                            .catch(e => {
                                return this.error(__("Fail to create: {0}", fp.path));
                        });
                });
            
            case `${this.name}-info`:
                if (!file) { return; }
                return this.openDialog("InfoDialog", file);
            
            case `${this.name}-upload`:
                return this.currdir.upload()
                    .catch(e => {
                        return this.error(__("Fail to upload: {0}", e.toString()), e);
                });

            case `${this.name}-share`:
                if (!file || (file.type !== "file")) { return; }
                return file.path.asFileHandle().publish()
                    .then(r => {
                        return this.notify(__("Shared url: {0}", r.result));
                }).catch(e => {
                        return this.error(__("Fail to publish: {0}", file.path), e);
                });

            case `${this.name}-download`:
                if (file.type !== "file") { return; }
                return file.path.asFileHandle().download()
                    .catch(e => {
                        return this.error(__("Fail to download: {0}", file.path), e);
                });
            default:
                return console.log(e);
        }
    }
}

this.OS.register("Files", Files);