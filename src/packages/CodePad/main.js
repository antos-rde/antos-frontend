/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Ant = this;

class CodePad extends this.OS.GUI.BaseApplication {
    constructor(args) {
        super("CodePad", args);
        this.currfile = "Untitled".asFileHandle();
        this.currdir = undefined;
        if (this.args && (this.args.length > 0)) {
            if (this.args[0].type === "dir") {
                this.currdir = this.args[0].path.asFileHandle();
            } else {
                this.currfile = this.args[0].path.asFileHandle();
                this.currdir = this.currfile.parent();
            }
        }
    }

    main() {
        this.extensions = {};
        this.fileview = this.find("fileview");
        this.sidebar = this.find("sidebar");
        this.tabbar = this.find("tabbar");
        this.langstat = this.find("langstat");
        this.editorstat = this.find("editorstat");

        this.fileview.set("fetch", path => new Promise(function(resolve, reject) {
            let dir = path;
            if (typeof path === "string") { dir = path.asFileHandle(); }
            return dir.read().then(function(d) {
                if (d.error) { return reject(d.error); }
                return resolve(d.result);}).catch(e => reject(__e(e)));
        }));
        return this.setup();
    }

    setup() {
        ace.config.set('basePath', '/scripts/ace');
        ace.require("ace/ext/language_tools");
        this.editor = ace.edit(this.find("datarea"));
        this.editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            highlightActiveLine: true,
            highlightSelectedWord: true,
            behavioursEnabled: true,
            wrap: true,
            fontSize: "11pt",
            showInvisibles: true
        });
        //themes = ace.require "ace/ext/themelist"
        this.editor.setTheme("ace/theme/monokai");
        this.modes = ace.require("ace/ext/modelist");
        this.editor.completers.push({ getCompletions( editor, session, pos, prefix, callback ) {} });
        this.editor.getSession().setUseWrapMode(true);
        this.editormux = false;
        this.editor.on("input", () => {
            if (this.editormux) {
                this.editormux = false;
                return false;
            }
            if (!this.currfile.dirty) {
                this.currfile.dirty = true;
                this.currfile.text += "*";
                return this.tabbar.update();
            }
        });
        this.editor.getSession().selection.on("changeCursor", e => {
            return this.updateStatus();
        });
        
        this.tabbar.set("ontabselect", e => {
            return this.selecteTab($(e.data.item).index());
        });
        this.tabbar.set("ontabclose", e => {
            const it = e.data.item;
            if (!it) { return false; }
            if (!it.get("data").dirty) { return this.closeTab(it); }
            this.openDialog("YesNoDialog", {
                title: __("Close tab"),
                text: __("Close without saving ?")
            }).then(d => {
                if (d) { return this.closeTab(it); }
                return this.editor.focus();
            });
            return false;
        });
        this.fileview.set("onfileopen", e => {
            if (!e.data || !e.data.path) { return; }
            if (e.data.type === "dir") { return; }
            return this.openFile(e.data.path.asFileHandle());
        });

        this.fileview.set("onfileselect", e => {
            if (!e.data || !e.data.path) { return; }
            if (e.data.type === "dir") { return; }
            const i = this.findTabByFile(e.data.path.asFileHandle());
            if (i !== -1) { return this.tabbar.set("selected", i); }
        });

        this.on("resize", () => this.editor.resize());
        this.on("focus", () => this.editor.focus());
        this.spotlight = new CMDMenu(__("Command palette"));
        this.bindKey("ALT-P", () => this.spotlight.run(this));
        this.find("datarea").contextmenuHandle = (e, m) => {
            m.set("items", [{
                text: __("Command palete"),
                onmenuselect: e => {
                    return this.spotlight.run(this);
                }
            }]);
            return m.show(e);
        };

        this.fileview.contextmenuHandle = (e, m) => {
            m.set("items", [
                { text: "__(New file)", id: "new" },
                { text: "__(New folder)", id: "newdir" },
                { text: "__(Rename)", id: "rename" },
                { text: "__(Delete)", id: "delete" }
            ]);
            m.set("onmenuselect", e => {
                return this.ctxFileMenuHandle(e);
            });
            return m.show(e);
        };

        this.bindKey("ALT-N", () =>  this.menuAction("new"));
        this.bindKey("ALT-O", () =>  this.menuAction("open"));
        this.bindKey("ALT-F", () =>  this.menuAction("opendir"));
        this.bindKey("CTRL-S", () => this.menuAction("save"));
        this.bindKey("ALT-W", () =>  this.menuAction("saveas"));

        this.fileview.set("ondragndrop", e => {
            const src = e.data.from.get("data").path.asFileHandle();
            const des = e.data.to.get("data").path;
            return src.move(`${des}/${src.basename}`)
                .then(function(d) {
                    e.data.to.update(des);
                    return e.data.from.get("parent").update(src.parent().path);}).catch(e => this.error(__("Unable to move file/folder"), e));
        });

        this.on("filechange", data => {
            let {
                path
            } = data.file;
            if (data.type === "file") { ({
                path
            } = data.file.parent()); }
            return this.fileview.update(path);
        });


        this.loadExtensionMetaData();
        this.initCommandPalete();
        this.initSideBar();
        return this.openFile(this.currfile);
    }

    openFile(file) {
        //find tab
        const i = this.findTabByFile(file);
        if (i !== -1) { return this.tabbar.set("selected", i); }
        if (file.path.toString() === "Untitled") { return this.newTab(file); }

        return file.read()
            .then(d => {
                file.cache = d || "";
                return this.newTab(file);
        }).catch(e => {
                return this.error(__("Unable to open: {0}", file.path), e);
        });
    }
    
    findTabByFile(file) {
        const lst = this.tabbar.get("items");
        const its = ((() => {
            const result = [];
             for (let i = 0; i < lst.length; i++) {
                const d = lst[i];
                if (d.hash() === file.hash()) {
                    result.push(i);
                }
            } 
            return result;
        })());
        if (its.length === 0) { return -1; }
        return its[0];
    }

    newTab(file) {
        file.text = file.basename ? file.basename : file.path;
        if (!file.cache) { file.cache = ""; }
        file.um = new ace.UndoManager();
        this.currfile.selected = false;
        file.selected = true;
        //console.log cnt
        return this.tabbar.push(file);
    }

    closeTab(it) {
        this.tabbar.remove(it);
        const cnt = this.tabbar.get("items").length;

        if (cnt === 0) {
            this.openFile("Untitled".asFileHandle());
            return false;
        }
        this.tabbar.set("selected", cnt - 1);
        return false;
    }

    selecteTab(i) {
        //return if i is @tabbar.get "selidx"
        const file = (this.tabbar.get("items"))[i];
        if (!file) { return; }
        this.scheme.set("apptitle", file.text.toString());
        //return if file is @currfile
        if (this.currfile !== file) {
            this.currfile.cache = this.editor.getValue();
            this.currfile.cursor = this.editor.selection.getCursor();
            this.currfile.selected = false;
            this.currfile = file;
        }

        if (!file.langmode) {
            if (file.path.toString() !== "Untitled") {
                const m = this.modes.getModeForPath(file.path);
                file.langmode = { caption: m.caption, mode: m.mode };
            } else {
                file.langmode   = { caption: "Text", mode: "ace/mode/text" };
            }
        }
        this.editormux = true;
        this.editor.getSession().setUndoManager(new ace.UndoManager());
        this.editor.setValue(file.cache, -1);
        this.editor.getSession().setMode(file.langmode.mode);
        if (file.cursor) {
            this.editor.renderer.scrollCursorIntoView({
                row: file.cursor.row, column: file.cursor.column
            }, 0.5);
            this.editor.selection.moveTo(file.cursor.row, file.cursor.column);
        }
        this.editor.getSession().setUndoManager(file.um);
        this.updateStatus();
        return this.editor.focus();
    }

    updateStatus() {
        const c = this.editor.session.selection.getCursor();
        const l = this.editor.session.getLength();
        this.editorstat.set("text", __("Row {0}, col {1}, lines: {2}", c.row + 1, c.column + 1, l));
        return this.langstat.set("text", this.currfile.langmode.caption);
    }

    initSideBar() {
        if (this.currdir) {
            $(this.sidebar).show();
            this.fileview.set("path", this.currdir.path);
        } else {
            $(this.sidebar).hide();
        }
        return this.trigger("resize");
    }

    addAction(action) {
        this.spotlight.addAction(action);
        return this;
    }

    addActions(list) {
        this.spotlight.addActions(list);
        return this;
    }

    initCommandPalete() {
        let v;
        const themes = ace.require("ace/ext/themelist");
        const cmdtheme = new CMDMenu(__("Change theme"));
        for (let k in themes.themesByName) { v = themes.themesByName[k]; cmdtheme.addAction({ text: v.caption, theme: v.theme }); }
        cmdtheme.onchildselect(function(d, r) {
            const data = d.data.item.get("data");
            r.editor.setTheme(data.theme);
            return r.editor.focus();
        });
        this.spotlight.addAction(cmdtheme);
        const cmdmode = new CMDMenu(__("Change language mode"));
        for (v of Array.from(this.modes.modes)) { cmdmode.addAction({ text: v.caption, mode: v.mode }); }
        cmdmode.onchildselect(function(d, r) {
            const data = d.data.item.get("data");
            r.editor.session.setMode(data.mode);
            r.currfile.langmode = { caption: data.text, mode: data.mode };
            r.updateStatus();
            return r.editor.focus();
        });
        this.spotlight.addAction(cmdmode);
        return this.addAction(CMDMenu.fromMenu(this.fileMenu()));
    }
    
    loadExtensionMetaData() {
        return `${this.meta().path}/extensions.json`
            .asFileHandle()
            .read("json")
            .then(d => {
                return (() => {
                    const result = [];
                    for (var ext of Array.from(d)) {
                        if (this.extensions[ext.name]) {
                            this.extensions[ext.name].child = [];
                            result.push((() => {
                                const result1 = [];
                                for (let v of Array.from(ext.actions)) {                                     result1.push(this.extensions[ext.name].addAction(v));
                                }
                                return result1;
                            })());
                        } else {
                            this.extensions[ext.name] = new CMDMenu(ext.text);
                            this.extensions[ext.name].name = ext.name;
                            for (let v of Array.from(ext.actions)) { this.extensions[ext.name].addAction(v); }
                            this.spotlight.addAction(this.extensions[ext.name]);
                            result.push(this.extensions[ext.name].onchildselect(e => {
                                return this.loadAndRunExtensionAction(e.data.item.get("data"));
                            }));
                        }
                    }
                    return result;
                })();
        }).catch(e => {
                return this.error(__("Cannot load extension meta data"), e);
        });
    }

    runExtensionAction(name, action) {
        if (!CodePad.extensions[name]) { return this.error(__("Unable to find extension: {0}", name)); }
        const ext = new (CodePad.extensions[name])(this);
        if (!ext[action]) { return this.error(__("Unable to find action: {0}", action)); }
        return ext.preload()
            .then(() => ext[action]()).catch(e => {
                return this.error(__("Unable to preload extension"), e);
        });
    }

    loadAndRunExtensionAction(data) {
        const {
            name
        } = data.parent;
        const action = data.name;
        //verify if the extension is load
        if (!CodePad.extensions[name]) {
            //load the extension
            const path = `${this.meta().path}/extensions/${name}.js`;
            return this._api.requires(path)
                .then(() => this.runExtensionAction(name, action))
                .catch(e => {
                    return this.error(__("unable to load extension: {0}", name), e);
            });
        } else {
            return this.runExtensionAction(name, action);
        }
    }

    fileMenu() {
        return {
            text: __("File"),
            child: [
                { text: __("New"), dataid: "new", shortcut: "A-N" },
                { text: __("Open"), dataid: "open", shortcut: "A-O" },
                { text: __("Open Folder"), dataid: "opendir", shortcut: "A-F" },
                { text: __("Save"), dataid: "save", shortcut: "C-S" },
                { text: __("Save as"), dataid: "saveas", shortcut: "A-W" }
            ],
            onchildselect: (e, r) => {
                return this.menuAction(e.data.item.get("data").dataid, r);
            }
        };
    }
    
    ctxFileMenuHandle(e) {
        const el = e.data.item;
        if (!el) { return; }
        const data = el.get("data");
        if (!data) { return; }
        let file = this.fileview.get("selectedFile");
        let dir = this.currdir;
        if (file && (file.type === "dir")) { dir = file.path.asFileHandle(); }
        if (file && (file.type === "file")) { dir = file.path.asFileHandle().parent(); }
        
        switch (data.id) {
            case "new":
                if (!dir) { return; }
                return this.openDialog("PromptDialog", {
                    title: "__(New file)",
                    label: "__(File name)"
                })
                    .then(d => {
                        const fp = `${dir.path}/${d}`.asFileHandle();
                        return fp.write("text/plain")
                            .then(r => {
                                return this.fileview.update(dir.path);
                        }).catch(e => {
                                return this.error(__("Fail to create: {0}", e.stack), e);
                        });
                });
            
            case "newdir":
                if (!dir) { return; }
                return this.openDialog("PromptDialog", {
                    title: "__(New folder)",
                    label: "__(Folder name)"
                })
                    .then(d => {
                        return dir.mk(d)
                            .then(r => {
                                return this.fileview.update(dir.path);
                        }).catch(e => {
                                return this.error(__("Fail to create: {0}", dir.path), e);
                        });
                });

            case "rename":
                if (!file) { return; }
                return this.openDialog("PromptDialog", {
                    title: "__(Rename)",
                    label: "__(File name)",
                    value: file.filename
                })
                    .then(d => {
                        if (d === file.filename) { return; }
                        file = file.path.asFileHandle();
                        dir = file.parent();
                        return file.move(`${dir.path}/${d}`)
                            .then(r => {
                                return this.fileview.update(dir.path);
                        }).catch(e => {
                                return this.error(__("Fail to rename: {0}", file.path), e);
                        });
                });

            case "delete":
                if (!file) { return; }
                return this.openDialog("YesNoDialog", {
                    title: "__(Delete)",
                    iconclass: "fa fa-question-circle",
                    text: __("Do you really want to delete: {0}?", file.filename)
                })
                    .then(d => {
                        if (!d) { return; }
                        file = file.path.asFileHandle();
                        dir = file.parent();
                        return file.remove()
                            .then(r => {
                                return this.fileview.update(dir.path);
                        }).catch(e => {
                                return this.error(__("Fail to delete: {0}", file.path), e);
                        });
                });
            
            default:
        }
    }
                

    save(file) {
        return file.write("text/plain")
            .then(d => {
                file.dirty = false;
                file.text = file.basename;
                this.tabbar.update();
                return this.scheme.set("apptitle", `${this.currfile.basename}`);
        }).catch(e => this.error(__("Unable to save file: {0}", file.path), e));
    }
    
    
    saveAs() {
        return this.openDialog("FileDialog", {
                title: __("Save as"),
                file: this.currfile
            })
            .then(f => {
                let d = f.file.path.asFileHandle();
                if (f.file.type === "file") { d = d.parent(); }
                this.currfile.setPath(`${d.path}/${f.name}`);
                return this.save(this.currfile);
        });
    }

    menuAction(dataid, r) {
        let me = this;
        if (r) { me = r; }
        switch (dataid) {
            case "new":
                return me.openFile("Untitled".asFileHandle());
            case "open":
                return me.openDialog("FileDialog", {
                    title: __("Open file"),
                    mimes: (Array.from(me.meta().mimes).filter((v) => v !== "dir"))
                })
                .then(f => me.openFile(f.file.path.asFileHandle()));
            case "opendir":
                return me.openDialog("FileDialog", {
                    title: __("Open folder"),
                    mimes: ["dir"]
                })
                .then(function(f) {
                    me.currdir = f.file.path.asFileHandle();
                    return me.initSideBar();
                });
            case "save":
                me.currfile.cache = me.editor.getValue();
                if (me.currfile.basename) { return me.save(me.currfile); }
                return me.saveAs();
            case "saveas":
                me.currfile.cache = me.editor.getValue();
                return me.saveAs();
            default:
                return console.log(dataid);
        }
    }

    cleanup(evt) {
        let v;
        const dirties = ((() => {
            const result = [];
             for (v of  Array.from(this.tabbar.get("items"))) {                 if (v.dirty) {
                    result.push(v);
                }
            } 
            return result;
        })());
        if (dirties.length === 0) { return; }
        evt.preventDefault();
        return this.openDialog("YesNoDialog", {
            title: "__(Quit)",
            text: __("Ignore all unsaved files: {0} ?", ((() => {
                const result1 = [];
                for (v of Array.from(dirties)) {                     result1.push(v.filename());
                }
                return result1;
            })()).join(", ") )
        }).then(d => {
            if (d) {
                for (v of Array.from(dirties)) { v.dirty = false; }
                return this.quit();
            }
        });
    }

    menu() {
        const menu = [
            this.fileMenu(),
            {
                text: "__(View)",
                child: [
                    { text: "__(Command Palette)", dataid: "cmdpalette", shortcut: "A-P" }
                ],
                onchildselect: (e, r) => {
                    return this.spotlight.run(this);
                }
            }
        ];
        return menu;
    }
}

class CMDMenu {
    constructor(text, shortcut) {
        this.text = text;
        this.shortcut = shortcut;
        this.child = [];
        this.parent = undefined;
        this.select = function(e) {};
    }

    addAction(v) {
        v.parent = this;
        this.child.push(v);
        return this;
    }

    addActions(list) {
        return Array.from(list).map((v) => this.addAction(v));
    }

    onchildselect(f) {
        this.select = f;
        return this;
    }

    run(root) {
        return root.openDialog(new CommandPalette(), this)
            .then(d => {
                const data = d.data.item.get("data");
                if (data.run) { return data.run(root); }
                return this.select(d, root);
        });
    }
}

CMDMenu.fromMenu = function(mn) {
    const m = new CMDMenu(mn.text, mn.shortcut);
    m.onchildselect(mn.onchildselect);
    for (let v of Array.from(mn.child)) {
        if (v.child) {
            m.addAction(CMDMenu.fromMenu(v));
        } else {
            m.addAction(v);
        }
    }
    return m;
};

CodePad.CMDMenu = CMDMenu;

CodePad.dependencies = [
    "os://scripts/ace/ace.js",
    "os://scripts/ace/ext-language_tools.js",
    "os://scripts/ace/ext-modelist.js",
    "os://scripts/ace/ext-themelist.js"
];
this.OS.register("CodePad", CodePad);