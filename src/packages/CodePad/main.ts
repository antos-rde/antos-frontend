var ace: any;
namespace OS {
    export namespace application {
        /**
         * Extends the [[RemoteFileHandle]] interface with some useful
         * properties used by [[CodePad]]
         */
        export type CodePadFileHandle = API.VFS.RemoteFileHandle & {
            /**
             * The text will be displayed on the tab bar when opened
             *
             * @type {string}
             */
            text: string;

            /**
             * ACE Undo manager of the current file, stores the
             * modification history of the file
             *
             * @type {GenericObject<any>}
             */
            um: GenericObject<any>;

            /**
             * Indicate whether the file is selected
             *
             * @type {boolean}
             */
            selected: boolean;

            /**
             * Store the latest cursor position on the editor
             * when editing the file
             *
             * @type {GenericObject<any>}
             */
            cursor: GenericObject<any>;

            /**
             * Language mode setting of the file
             *
             * @type {GenericObject<string>}
             */
            langmode: GenericObject<string>;
        };
        /**
         * [[CodePad]]'s [[CommandPalette]] action type definition
         */
        type ActionType = CMDMenu | GenericObject<any>;

        /**
         * A simple yet powerful code/text editor.
         *
         * CodePad is the default text editor shipped with
         * AntOS base system. It is based on the ACE editor.
         *
         * Features:
         *
         * - It includes all the features of the ACE editor
         * - Text manipulation can be extended using the CodePad extension mechanism.
         * - All extension actions can be accessed via the [[CommandPalette]] which
         * is inspired by MS Visual Studio Code.
         * - Default extensions shipped with CodePad:
         *  - AntOSDK: allowing to create/develop/build/release an AntOS application
         *  - CodePad extension maker: allowing to develop/release/install CodePad extensions.
         *
         * @export
         * @class CodePad
         * @extends {BaseApplication}
         */
        export class CodePad extends BaseApplication {
            /**
             * Reference to the current editing file handle
             *
             * @private
             * @type {CodePadFileHandle}
             * @memberof CodePad
             */
            private currfile: CodePadFileHandle;

            /**
             * Reference to the current working directory
             *
             * @type {API.VFS.BaseFileHandle}
             * @memberof CodePad
             */
            currdir: API.VFS.BaseFileHandle;

            /**
             * Placeholder stores all extension actions loaded from
             * extensions.json
             *
             * @type {GenericObject<any>}
             * @memberof CodePad
             */
            extensions: GenericObject<any>;

            /**
             * Reference to the sidebar file view UI
             *
             * @private
             * @type {GUI.tag.FileViewTag}
             * @memberof CodePad
             */
            private fileview: GUI.tag.FileViewTag;

            /**
             * Reference to the sidebar
             *
             * @private
             * @type {GUI.tag.VBoxTag}
             * @memberof CodePad
             */
            private sidebar: GUI.tag.VBoxTag;

            /**
             * Reference to the editor tab bar UI
             *
             * @private
             * @type {GUI.tag.TabBarTag}
             * @memberof CodePad
             */
            private tabbar: GUI.tag.TabBarTag;

            /**
             * Reference to the language status bar
             *
             * @private
             * @type {GUI.tag.LabelTag}
             * @memberof CodePad
             */
            private langstat: GUI.tag.LabelTag;

            /**
             * Reference to the editor status bar
             *
             * @private
             * @type {GUI.tag.LabelTag}
             * @memberof CodePad
             */
            private editorstat: GUI.tag.LabelTag;

            /**
             * Reference to the editor instance
             *
             * @private
             * @type {GenericObject<any>}
             * @memberof CodePad
             */
            private editor: GenericObject<any>;

            /**
             * Editor language modes
             *
             * @private
             * @type {GenericObject<any>}
             * @memberof CodePad
             */
            private modes: GenericObject<any>;

            /**
             * Editor mutex
             *
             * @private
             * @type {boolean}
             * @memberof CodePad
             */
            private editormux: boolean;

            /**
             * Reference to the CommandPalette's spotlight
             *
             * @type {CMDMenu}
             * @memberof CodePad
             */
            spotlight: CMDMenu;

            /**
             * Extension prototype definition will be stored
             * in this class variable
             *
             * @static
             * @type {GenericObject<any>}
             * @memberof CodePad
             */
            static extensions: GenericObject<any>;

            /**
             * Prototype definition of a [[CommandPalette]] action
             *
             * @static
             * @type {typeof CMDMenu}
             * @memberof CodePad
             */
            static CMDMenu: typeof CMDMenu;

            /**
             * Prototype definition of CodePad CommandPalette
             *
             * @static
             * @type {typeof CommandPalette}
             * @memberof CodePad
             */
            static CommandPalette: typeof CommandPalette;

            /**
             * Base abstract prototype of a CodePad extension
             *
             * @static
             * @type {CodePadBaseExtension}
             * @memberof CodePad
             */
            static BaseExtension: CodePadBaseExtension;
            /**
             *Creates an instance of CodePad.
             * @param {AppArgumentsType[]} args application arguments
             * @memberof CodePad
             */
            constructor(args: AppArgumentsType[]) {
                super("CodePad", args);
                this.currfile = "Untitled".asFileHandle() as CodePadFileHandle;
                this.currdir = undefined;
                if (this.args && this.args.length > 0) {
                    if (this.args[0].type === "dir") {
                        this.currdir = this.args[0].path.asFileHandle() as CodePadFileHandle;
                    } else {
                        this.currfile = this.args[0].path.asFileHandle() as CodePadFileHandle;
                        this.currdir = this.currfile.parent();
                    }
                }
            }

            /**
             * Main application entry point
             *
             * @returns {void}
             * @memberof CodePad
             */
            main(): void {
                this.extensions = {};
                this.fileview = this.find("fileview") as GUI.tag.FileViewTag;
                this.sidebar = this.find("sidebar") as GUI.tag.VBoxTag;
                this.tabbar = this.find("tabbar") as GUI.tag.TabBarTag;
                this.langstat = this.find("langstat") as GUI.tag.LabelTag;
                this.editorstat = this.find("editorstat") as GUI.tag.LabelTag;

                this.fileview.fetch = (path) =>
                    new Promise(function (resolve, reject) {
                        let dir: API.VFS.BaseFileHandle;
                        if (typeof path === "string") {
                            dir = path.asFileHandle();
                        } else {
                            dir = path;
                        }
                        return dir
                            .read()
                            .then(function (d) {
                                if (d.error) {
                                    return reject(d.error);
                                }
                                return resolve(d.result);
                            })
                            .catch((e) => reject(__e(e)));
                    });
                return this.setup();
            }

            /**
             * Set up the text editor
             *
             * @private
             * @returns {void}
             * @memberof CodePad
             */
            private setup(): void {
                ace.config.set("basePath", "/scripts/ace");
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
                    showInvisibles: true,
                });
                //themes = ace.require "ace/ext/themelist"
                this.editor.setTheme("ace/theme/monokai");
                this.modes = ace.require("ace/ext/modelist");
                this.editor.completers.push({
                    getCompletions(
                        editor: any,
                        session: any,
                        pos: any,
                        prefix: any,
                        callback: any
                    ) {},
                });
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
                        return this.tabbar.update(undefined);
                    }
                });
                this.editor
                    .getSession()
                    .selection.on("changeCursor", (e: any) => {
                        return this.updateStatus();
                    });

                this.tabbar.ontabselect = (e) => {
                    return this.selecteTab($(e.data.item).index());
                };
                this.tabbar.ontabclose = (e) => {
                    const it = e.data.item;
                    if (!it) {
                        return false;
                    }
                    if (!it.data.dirty) {
                        return this.closeTab(it);
                    }
                    this.openDialog("YesNoDialog", {
                        title: __("Close tab"),
                        text: __("Close without saving ?"),
                    }).then((d) => {
                        if (d) {
                            return this.closeTab(it);
                        }
                        return this.editor.focus();
                    });
                    return false;
                };
                this.fileview.onfileopen = (e) => {
                    if (!e.data || !e.data.path) {
                        return;
                    }
                    if (e.data.type === "dir") {
                        return;
                    }
                    return this.openFile(
                        e.data.path.asFileHandle() as CodePadFileHandle
                    );
                };

                this.fileview.onfileselect = (e) => {
                    if (!e.data || !e.data.path) {
                        return;
                    }
                    if (e.data.type === "dir") {
                        return;
                    }
                    const i = this.findTabByFile(
                        e.data.path.asFileHandle() as CodePadFileHandle
                    );
                    if (i !== -1) {
                        return (this.tabbar.selected = i);
                    }
                };

                this.on("resize", () => this.editor.resize());
                this.on("focus", () => this.editor.focus());
                this.spotlight = new CMDMenu(__("Command palette"));
                this.bindKey("ALT-P", () => this.spotlight.run(this));
                this.find("datarea").contextmenuHandle = (e, m) => {
                    m.items = [
                        {
                            text: __("Command palete"),
                            onmenuselect: (
                                e: GUI.TagEventType<GUI.tag.MenuEventData>
                            ) => {
                                return this.spotlight.run(this);
                            },
                        },
                    ];
                    return m.show(e);
                };

                this.fileview.contextmenuHandle = (e, m) => {
                    m.items = [
                        { text: "__(New file)", id: "new" },
                        { text: "__(New folder)", id: "newdir" },
                        { text: "__(Rename)", id: "rename" },
                        { text: "__(Delete)", id: "delete" },
                    ];
                    m.onmenuselect = (e) => {
                        return this.ctxFileMenuHandle(e);
                    };
                    return m.show(e);
                };

                this.bindKey("ALT-N", () => this.menuAction("new"));
                this.bindKey("ALT-O", () => this.menuAction("open"));
                this.bindKey("ALT-F", () => this.menuAction("opendir"));
                this.bindKey("CTRL-S", () => this.menuAction("save"));
                this.bindKey("ALT-W", () => this.menuAction("saveas"));

                this.fileview.ondragndrop = (e) => {
                    const src = e.data.from.data.path.asFileHandle();
                    const des = e.data.to.data.path;
                    return src
                        .move(`${des}/${src.basename}`)
                        .then(function (d: any) {
                            const p1 = des;
                            const p2 = src.parent().path;
                            if (p1.length < p2.length) {
                                e.data.to.update(p1);
                                (e.data
                                    .from as GUI.tag.TreeViewTag).parent.update(
                                    p2
                                );
                            } else {
                                (e.data
                                    .from as GUI.tag.TreeViewTag).parent.update(
                                    p2
                                );
                                e.data.to.update(p1);
                            }
                        })
                        .catch((e: Error) =>
                            this.error(__("Unable to move file/folder"), e)
                        );
                };

                this.on("filechange", (data) => {
                    let { path } = data.file;
                    if (data.type === "file") {
                        ({ path } = data.file.parent());
                    }
                    return this.fileview.update(path);
                });

                this.loadExtensionMetaData();
                this.initCommandPalete();
                this.toggleSideBar();
                return this.openFile(this.currfile);
            }

            /**
             * Open a file in new tab. If the file is already opened,
             * the just select the tab
             *
             *
             * @param {CodePadFileHandle} file file to open
             * @returns {void}
             * @memberof CodePad
             */
            openFile(file: CodePadFileHandle): void {
                //find tab
                const i = this.findTabByFile(file);
                if (i !== -1) {
                    this.tabbar.selected = i;
                    return;
                }
                if (file.path.toString() === "Untitled") {
                    this.newTab(file);
                    return;
                }

                file.read()
                    .then((d) => {
                        file.cache = d || "";
                        return this.newTab(file);
                    })
                    .catch((e) => {
                        return this.error(
                            __("Unable to open: {0}", file.path),
                            e
                        );
                    });
            }

            /**
             * Find a tab on the tabbar corresponding to a file handle
             *
             * @private
             * @param {CodePadFileHandle} file then file handle to search
             * @returns {number}
             * @memberof CodePad
             */
            private findTabByFile(file: CodePadFileHandle): number {
                const lst = this.tabbar.items;
                const its = (() => {
                    const result = [];
                    for (let i = 0; i < lst.length; i++) {
                        const d = lst[i];
                        if (d.hash() === file.hash()) {
                            result.push(i);
                        }
                    }
                    return result;
                })();
                if (its.length === 0) {
                    return -1;
                }
                return its[0];
            }

            /**
             * Create new tab when opening a file
             *
             * @private
             * @param {CodePadFileHandle} file
             * @memberof CodePad
             */
            private newTab(file: CodePadFileHandle): void {
                file.text = file.basename ? file.basename : file.path;
                if (!file.cache) {
                    file.cache = "";
                }
                file.um = new ace.UndoManager();
                this.currfile.selected = false;
                file.selected = true;
                //console.log cnt
                this.tabbar.push(file);
            }

            /**
             * Close a tab when a file is closed
             *
             * @private
             * @param {GUI.tag.ListViewItemTag} it reference to the tab to close
             * @returns {boolean}
             * @memberof CodePad
             */
            private closeTab(it: GUI.tag.ListViewItemTag): boolean {
                this.tabbar.delete(it);
                const cnt = this.tabbar.items.length;

                if (cnt === 0) {
                    this.openFile(
                        "Untitled".asFileHandle() as CodePadFileHandle
                    );
                    return false;
                }
                this.tabbar.selected = cnt - 1;
                return false;
            }

            /**
             * Select a tab by its index
             *
             * @private
             * @param {number} i tab index
             * @returns {void}
             * @memberof CodePad
             */
            private selecteTab(i: number): void {
                //return if i is @tabbar.get "selidx"
                const file = this.tabbar.items[i] as CodePadFileHandle;
                if (!file) {
                    return;
                }
                (this
                    .scheme as GUI.tag.WindowTag).apptitle = file.text.toString();
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
                        file.langmode = {
                            caption: "Text",
                            mode: "ace/mode/text",
                        };
                    }
                }
                this.editormux = true;
                this.editor.getSession().setUndoManager(new ace.UndoManager());
                this.editor.setValue(file.cache, -1);
                this.editor.getSession().setMode(file.langmode.mode);
                if (file.cursor) {
                    this.editor.renderer.scrollCursorIntoView(
                        {
                            row: file.cursor.row,
                            column: file.cursor.column,
                        },
                        0.5
                    );
                    this.editor.selection.moveTo(
                        file.cursor.row,
                        file.cursor.column
                    );
                }
                this.editor.getSession().setUndoManager(file.um);
                this.updateStatus();
                this.editor.focus();
            }

            /**
             * Update the editor status bar
             *
             * @private
             * @memberof CodePad
             */
            private updateStatus(): void {
                const c = this.editor.session.selection.getCursor();
                const l = this.editor.session.getLength();
                this.editorstat.text = __(
                    "Row {0}, col {1}, lines: {2}",
                    c.row + 1,
                    c.column + 1,
                    l
                );
                this.langstat.text = this.currfile.langmode.caption;
            }

            /**
             * Show or hide the SideBar
             *
             * @memberof CodePad
             */
            toggleSideBar(): void {
                if (this.currdir) {
                    $(this.sidebar).show();
                    this.fileview.path = this.currdir.path;
                } else {
                    $(this.sidebar).hide();
                }
                this.trigger("resize");
            }

            /**
             * Add an action to the [[CommandPalette]]'s spotlight
             *
             * @private
             * @param {ActionType} action
             * @returns {CodePad}
             * @memberof CodePad
             */
            private addAction(action: ActionType): CodePad {
                this.spotlight.addAction(action);
                return this;
            }

            /**
             * Add a list of actions to the [[CommandPalette]]'s spotlight
             *
             * @private
             * @param {ActionType[]} list
             * @returns {CodePad}
             * @memberof CodePad
             */
            private addActions(list: ActionType[]): CodePad {
                this.spotlight.addActions(list);
                return this;
            }

            /**
             * Init the editor command palette
             *
             * @private
             * @memberof CodePad
             */
            private initCommandPalete(): void {
                let v: any;
                const themes = ace.require("ace/ext/themelist");
                const cmdtheme = new CMDMenu(__("Change theme"));
                for (let k in themes.themesByName) {
                    v = themes.themesByName[k];
                    cmdtheme.addAction({ text: v.caption, theme: v.theme });
                }
                cmdtheme.onchildselect(function (
                    d: GUI.TagEventType<GUI.tag.ListItemEventData>,
                    r: CodePad
                ) {
                    const data = d.data.item.data;
                    r.editor.setTheme(data.theme);
                    return r.editor.focus();
                });
                this.spotlight.addAction(cmdtheme);
                const cmdmode = new CMDMenu(__("Change language mode"));
                for (v of Array.from(this.modes.modes)) {
                    cmdmode.addAction({ text: v.caption, mode: v.mode });
                }
                cmdmode.onchildselect(function (
                    d: GUI.TagEventType<GUI.tag.ListItemEventData>,
                    r: CodePad
                ) {
                    const data = d.data.item.data;
                    r.editor.session.setMode(data.mode);
                    r.currfile.langmode = {
                        caption: data.text,
                        mode: data.mode,
                    };
                    r.updateStatus();
                    r.editor.focus();
                });
                this.spotlight.addAction(cmdmode);
                this.addAction(CMDMenu.fromMenu(this.fileMenu()));
            }

            /**
             * Load the extension meta data from `extension.json` file
             *
             * @memberof CodePad
             */
            loadExtensionMetaData(): void {
                `${this.meta().path}/extensions.json`
                    .asFileHandle()
                    .read("json")
                    .then((d: GenericObject<any>[]) => {
                        for (var ext of Array.from(d)) {
                            if (this.extensions[ext.name]) {
                                this.extensions[ext.name].nodes = [];
                                for (let v of Array.from(ext.actions)) {
                                    this.extensions[ext.name].addAction(v);
                                }
                            } else {
                                this.extensions[ext.name] = new CMDMenu(
                                    ext.text
                                );
                                this.extensions[ext.name].name = ext.name;
                                for (let v of Array.from(ext.actions)) {
                                    this.extensions[ext.name].addAction(v);
                                }
                                this.spotlight.addAction(
                                    this.extensions[ext.name]
                                );
                                this.extensions[ext.name].onchildselect(
                                    (
                                        e: GUI.TagEventType<
                                            GUI.tag.ListItemEventData
                                        >
                                    ) => {
                                        return this.loadAndRunExtensionAction(
                                            e.data.item.data as any
                                        );
                                    }
                                );
                            }
                        }
                    })
                    .catch((e) => {
                        return this.error(
                            __("Cannot load extension meta data"),
                            e
                        );
                    });
            }

            /**
             * Run an extension action from the command palette
             *
             * @private
             * @param {string} name extension name
             * @param {string} action action name
             * @returns {void}
             * @memberof CodePad
             */
            private runExtensionAction(name: string, action: string): void {
                if (!CodePad.extensions[name]) {
                    return this.error(
                        __("Unable to find extension: {0}", name)
                    );
                }
                const ext = new CodePad.extensions[name](this);
                if (!ext[action]) {
                    return this.error(__("Unable to find action: {0}", action));
                }
                ext.preload()
                    .then(() => ext[action]())
                    .catch((e: Error) => {
                        return this.error(__("Unable to preload extension"), e);
                    });
            }

            /**
             * Load extension then run an action
             *
             * @param {{
             *                 parent: { name: any };
             *                 name: any;
             *             }} data
             * @memberof CodePad
             */
            loadAndRunExtensionAction(data: {
                /**
                 * Parent context of the current action
                 *
                 * @type {{ name: any }}
                 */
                parent: { name: any };

                /**
                 * Action name
                 *
                 * @type {*}
                 */
                name: any;
            }): void {
                const { name } = data.parent;
                const action = data.name;
                //verify if the extension is load
                if (!CodePad.extensions[name]) {
                    //load the extension
                    const path = `${this.meta().path}/${name}.js`;
                    this._api
                        .requires(path)
                        .then(() => this.runExtensionAction(name, action))
                        .catch((e) => {
                            return this.error(
                                __("unable to load extension: {0}", name),
                                e
                            );
                        });
                } else {
                    this.runExtensionAction(name, action);
                }
            }

            /**
             * File menu definition
             *
             * @private
             * @returns {GUI.BasicItemType}
             * @memberof CodePad
             */
            private fileMenu(): GUI.BasicItemType {
                return {
                    text: __("File"),
                    nodes: [
                        { text: __("New"), dataid: "new", shortcut: "A-N" },
                        { text: __("Open"), dataid: "open", shortcut: "A-O" },
                        {
                            text: __("Open Folder"),
                            dataid: "opendir",
                            shortcut: "A-F",
                        },
                        { text: __("Save"), dataid: "save", shortcut: "C-S" },
                        {
                            text: __("Save as"),
                            dataid: "saveas",
                            shortcut: "A-W",
                        },
                    ],
                    onchildselect: (
                        e: GUI.TagEventType<GUI.tag.MenuEventData>,
                        r: CodePad
                    ) => {
                        return this.menuAction(e.data.item.data.dataid, r);
                    },
                };
            }

            /**
             * Context menu definition
             *
             * @private
             * @param {GUI.TagEventType} e
             * @returns {void}
             * @memberof CodePad
             */
            private ctxFileMenuHandle(
                e: GUI.TagEventType<GUI.tag.MenuEventData>
            ): void {
                const el = e.data.item as GUI.tag.MenuEntryTag;
                if (!el) {
                    return;
                }
                const data = el.data;
                if (!data) {
                    return;
                }
                let file: API.VFS.BaseFileHandle | API.FileInfoType = this
                    .fileview.selectedFile;
                let dir = this.currdir;
                if (file && file.type === "dir") {
                    dir = file.path.asFileHandle();
                }
                if (file && file.type === "file") {
                    dir = file.path.asFileHandle().parent();
                }

                switch (data.id) {
                    case "new":
                        if (!dir) {
                            return;
                        }
                        this.openDialog("PromptDialog", {
                            title: "__(New file)",
                            label: "__(File name)",
                        }).then(async (d) => {
                            const fp = `${dir.path}/${d}`.asFileHandle();
                            try {
                                const r = await fp.write("text/plain");
                                return this.fileview.update(dir.path);
                            } catch (e) {
                                return this.error(
                                    __("Fail to create: {0}", e.stack),
                                    e
                                );
                            }
                        });
                        break;

                    case "newdir":
                        if (!dir) {
                            return;
                        }
                        this.openDialog("PromptDialog", {
                            title: "__(New folder)",
                            label: "__(Folder name)",
                        }).then(async (d) => {
                            try {
                                const r = await dir.mk(d);
                                return this.fileview.update(dir.path);
                            } catch (e) {
                                return this.error(
                                    __("Fail to create: {0}", dir.path),
                                    e
                                );
                            }
                        });
                        break;

                    case "rename":
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
                            file = file.path.asFileHandle();
                            dir = file.parent();
                            try {
                                const r = await file.move(`${dir.path}/${d}`);
                                return this.fileview.update(dir.path);
                            } catch (e) {
                                return this.error(
                                    __("Fail to rename: {0}", file.path),
                                    e
                                );
                            }
                        });
                        break;

                    case "delete":
                        if (!file) {
                            return;
                        }
                        this.openDialog("YesNoDialog", {
                            title: "__(Delete)",
                            iconclass: "fa fa-question-circle",
                            text: __(
                                "Do you really want to delete: {0}?",
                                file.filename
                            ),
                        }).then(async (d) => {
                            if (!d) {
                                return;
                            }
                            file = file.path.asFileHandle();
                            dir = file.parent();
                            try {
                                const r = await file.remove();
                                return this.fileview.update(dir.path);
                            } catch (e) {
                                return this.error(
                                    __("Fail to delete: {0}", file.path),
                                    e
                                );
                            }
                        });
                        break;
                    default:
                }
            }

            /**
             * Save a file
             *
             * @private
             * @param {CodePadFileHandle} file
             * @memberof CodePad
             */
            private save(file: CodePadFileHandle): void {
                file.write("text/plain")
                    .then((d) => {
                        file.dirty = false;
                        file.text = file.basename;
                        this.tabbar.update(undefined);
                        (this
                            .scheme as GUI.tag.WindowTag).apptitle = `${this.currfile.basename}`;
                    })
                    .catch((e) =>
                        this.error(__("Unable to save file: {0}", file.path), e)
                    );
            }

            /**
             * Save the current file as another file
             *
             * @private
             * @memberof CodePad
             */
            private saveAs(): void {
                this.openDialog("FileDialog", {
                    title: __("Save as"),
                    file: this.currfile,
                }).then((f) => {
                    let d = f.file.path.asFileHandle();
                    if (f.file.type === "file") {
                        d = d.parent();
                    }
                    this.currfile.setPath(`${d.path}/${f.name}`);
                    this.save(this.currfile);
                });
            }

            /**
             * Menu action definition
             *
             * @private
             * @param {string} dataid
             * @param {CodePad} [r]
             * @returns {void}
             * @memberof CodePad
             */
            private menuAction(dataid: string, r?: CodePad): void {
                let me: any = this;
                if (r) {
                    me = r;
                }
                switch (dataid) {
                    case "new":
                        return me.openFile("Untitled".asFileHandle());
                    case "open":
                        return me
                            .openDialog("FileDialog", {
                                title: __("Open file"),
                                mimes: Array.from(me.meta().mimes).filter(
                                    (v) => v !== "dir"
                                ),
                            })
                            .then((f: API.FileInfoType) =>
                                me.openFile(f.file.path.asFileHandle())
                            );
                    case "opendir":
                        return me
                            .openDialog("FileDialog", {
                                title: __("Open folder"),
                                mimes: ["dir"],
                            })
                            .then(function (f: API.FileInfoType) {
                                me.currdir = f.file.path.asFileHandle();
                                return me.initSideBar();
                            });
                    case "save":
                        me.currfile.cache = me.editor.getValue();
                        if (me.currfile.basename) {
                            return me.save(me.currfile);
                        }
                        return me.saveAs();
                    case "saveas":
                        me.currfile.cache = me.editor.getValue();
                        return me.saveAs();
                    default:
                        return console.log(dataid);
                }
            }

            /**
             * Cleanup the editor before exiting.
             *
             * @param {BaseEvent} evt
             * @returns {void}
             * @memberof CodePad
             */
            cleanup(evt: BaseEvent): void {
                let v: GenericObject<any>;
                const dirties = (() => {
                    const result = [];
                    for (v of Array.from(this.tabbar.items)) {
                        if (v.dirty) {
                            result.push(v);
                        }
                    }
                    return result;
                })();
                if (dirties.length === 0) {
                    return;
                }
                evt.preventDefault();
                this.openDialog("YesNoDialog", {
                    title: "__(Quit)",
                    text: __(
                        "Ignore all unsaved files: {0} ?",
                        (() => {
                            const result1 = [];
                            for (v of Array.from(dirties)) {
                                result1.push(v.filename);
                            }
                            return result1;
                        })().join(", ")
                    ),
                }).then((d) => {
                    if (d) {
                        for (v of Array.from(dirties)) {
                            v.dirty = false;
                        }
                        return this.quit(false);
                    }
                });
            }

            /**
             * Application menu definition
             *
             * @returns {GUI.BasicItemType[]}
             * @memberof CodePad
             */
            menu(): GUI.BasicItemType[] {
                return [
                    this.fileMenu(),
                    {
                        text: "__(View)",
                        nodes: [
                            {
                                text: "__(Command Palette)",
                                dataid: "cmdpalette",
                                shortcut: "A-P",
                            },
                        ],
                        onchildselect: (
                            e: GUI.TagEventType<GUI.tag.MenuEventData>,
                            r: CodePadFileHandle
                        ) => {
                            return this.spotlight.run(this);
                        },
                    },
                ];
            }
        }

        /**
         *
         *
         * @class CMDMenu
         */
        class CMDMenu {
            text: string | FormattedString;
            private shortcut: string;
            nodes: GenericObject<any>[];
            parent: CMDMenu;
            private select: (
                e: GUI.TagEventType<GUI.tag.ListItemEventData>,
                r: CodePad
            ) => void;
            static fromMenu: (mn: GUI.BasicItemType) => CMDMenu;

            /**
             *Creates an instance of CMDMenu.
             * @param {(string | FormattedString)} text
             * @param {string} [shortcut]
             * @memberof CMDMenu
             */
            constructor(text: string | FormattedString, shortcut?: string) {
                this.text = text;
                this.shortcut = shortcut;
                this.nodes = [];
                this.parent = undefined;
                this.select = function (e) {};
            }

            /**
             *
             *
             * @param {ActionType} v
             * @returns {CMDMenu}
             * @memberof CMDMenu
             */
            addAction(v: ActionType): CMDMenu {
                v.parent = this;
                this.nodes.push(v);
                return this;
            }

            /**
             *
             *
             * @param {ActionType[]} list
             * @memberof CMDMenu
             */
            addActions(list: ActionType[]): void {
                Array.from(list).map((v) => this.addAction(v));
            }

            /**
             *
             *
             * @param {(e: GUI.TagEventType, r: CodePad) => void} f
             * @returns {CMDMenu}
             * @memberof CMDMenu
             */
            onchildselect(
                f: (
                    e: GUI.TagEventType<GUI.tag.ListItemEventData>,
                    r: CodePad
                ) => void
            ): CMDMenu {
                this.select = f;
                return this;
            }

            /**
             *
             *
             * @param {CodePad} root
             * @memberof CMDMenu
             */
            run(root: CodePad) {
                root.openDialog(new CommandPalette(), this).then((d) => {
                    const data = d.data.item.data;
                    if (data.run) {
                        return data.run(root);
                    }
                    return this.select(d, root);
                });
            }
        }

        CMDMenu.fromMenu = function (mn): CMDMenu {
            const m = new CMDMenu(mn.text, mn.shortcut);
            m.onchildselect(mn.onchildselect);
            for (let it of Array.from(mn.nodes)) {
                let v = it as ActionType;
                if (v.nodes) {
                    m.addAction(CMDMenu.fromMenu(v as GUI.BasicItemType));
                } else {
                    m.addAction(v as ActionType);
                }
            }
            return m;
        };

        CodePad.CMDMenu = CMDMenu;

        CodePad.dependencies = [
            "os://scripts/ace/ace.js",
            "os://scripts/ace/ext-language_tools.js",
            "os://scripts/ace/ext-modelist.js",
            "os://scripts/ace/ext-themelist.js",
        ];

        /**
         *
         *
         * @class CommandPalette
         * @extends {GUI.BasicDialog}
         */
        export class CommandPalette extends GUI.BasicDialog {
            private cmdlist: GUI.tag.ListViewTag;
            private searchbox: HTMLInputElement;

            /**
             *Creates an instance of CommandPalette.
             * @memberof CommandPalette
             */
            constructor() {
                super("CommandPalete", CommandPalette.scheme);
            }

            /**
             *
             *
             * @memberof CommandPalette
             */
            main(): void {
                super.main();
                const win = (this.parent as BaseModel)
                    .scheme as GUI.tag.WindowTag;
                const offset = $(".afx-window-content", win).offset();
                const pw = win.width / 5;
                (this.scheme as GUI.tag.WindowTag).width = 3 * pw;
                $(this.scheme).offset({
                    top: offset.top - 2,
                    left: offset.left + pw,
                });
                var cb = (e: JQuery.MouseEventBase) => {
                    if ($(e.target).closest(this.scheme).length > 0) {
                        return $(this.find("searchbox")).focus();
                    } else {
                        $(document).unbind("mousedown", cb);
                        return this.quit();
                    }
                };
                $(document).on("mousedown", cb);
                $(this.find("searchbox")).focus();
                this.cmdlist = this.find("container") as GUI.tag.ListViewTag;
                if (this.data) {
                    this.cmdlist.data = this.data.nodes;
                }
                $(this.cmdlist).click((e) => {
                    return this.selectCommand();
                });

                this.searchbox = this.find("searchbox") as HTMLInputElement;
                $(this.searchbox).keyup((e) => {
                    return this.search(e);
                });
            }

            /**
             *
             *
             * @private
             * @param {JQuery.KeyboardEventBase} e
             * @returns {void}
             * @memberof CommandPalette
             */
            private search(e: JQuery.KeyboardEventBase): void {
                let v: { text: string };
                switch (e.which) {
                    case 27:
                        // escape key
                        this.quit();
                        if (this.data.parent && this.data.parent.run) {
                            return this.data.parent.run(this.parent);
                        }
                        break;
                    case 37:
                        return e.preventDefault();
                    case 38:
                        this.cmdlist.selectPrev();
                        return e.preventDefault();
                    case 39:
                        return e.preventDefault();
                    case 40:
                        this.cmdlist.selectNext();
                        return e.preventDefault();
                    case 13:
                        e.preventDefault();
                        return this.selectCommand();
                    default:
                        var text = this.searchbox.value;
                        if (text.length === 2) {
                            this.cmdlist.data = this.data.nodes;
                            return;
                        }
                        if (text.length < 3) {
                            return;
                        }
                        var result = [];
                        var term = new RegExp(text, "i");
                        for (let v of this.data.nodes) {
                            if (v.text.match(term)) {
                                result.push(v);
                            }
                        }
                        this.cmdlist.data = result;
                }
            }

            /**
             *
             *
             * @private
             * @returns {void}
             * @memberof CommandPalette
             */
            private selectCommand(): void {
                const el = this.cmdlist.selectedItem as GUI.tag.ListViewItemTag;
                if (!el) {
                    return;
                }
                el.selected = false;
                if (this.handle) {
                    this.handle({ data: { item: el } });
                }
                return this.quit();
            }
        }

        CommandPalette.scheme = `\
<afx-app-window data-id = "cmd-win"
    apptitle="" minimizable="false"
    resizable = "false" width="200" height="200">
    <afx-vbox>
        <input data-height="25" type = "text" data-id="searchbox"/>
        <afx-list-view data-id="container"></afx-list-view>
    </afx-vbox>
</afx-app-window>\
        `;
    }
}
