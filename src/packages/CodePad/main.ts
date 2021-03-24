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
             * Reference to the editor manager instance
             *
             * @private
             * @type {EditorModelManager}
             * @memberof CodePad
             */
            eum: EditorModelManager;

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
             * Reference to the bottom bar
             *
             * @private
             * @type {GUI.tag.TabContainerTag}
             * @memberof CodePad
             */
            private bottombar: GUI.tag.TabContainerTag;


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
             * Reference to the file status bar
             *
             * @private
             * @type {GUI.tag.LabelTag}
             * @memberof CodePad
             */
            private filestat: GUI.tag.LabelTag;

            /**
             * Reference to the CommandPalette's spotlight
             *
             * @type {CMDMenu}
             * @memberof CodePad
             */
            spotlight: CMDMenu;


            /**
             * Is the split mode enabled
             *
             * @private
             * @type {boolean}
             * @memberof CodePad
             */
            private split_mode: boolean;

            /**
             * Reference to the editor logger
             *
             * @type {Logger}
             * @memberof CodePad
             */
            logger: Logger;

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
             * Prototype definition of a Logger
             *
             * @static
             * @type {typeof Logger}
             * @memberof CodePad
             */
            static Logger: typeof Logger;
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
                this.currdir = undefined;
            }

            /**
             * Main application entry point
             *
             * @returns {void}
             * @memberof CodePad
             */
            main(): void {
                this.extensions = {};
                this.eum = new EditorModelManager();
                this.fileview = this.find("fileview") as GUI.tag.FileViewTag;
                this.sidebar = this.find("sidebar") as GUI.tag.VBoxTag;
                this.bottombar = this.find("bottombar") as GUI.tag.TabContainerTag;
                this.langstat = this.find("langstat") as GUI.tag.LabelTag;
                this.editorstat = this.find("editorstat") as GUI.tag.LabelTag;
                this.filestat = this.find("current-file-lbl") as GUI.tag.LabelTag;
                this.logger = new Logger(this.find("output-tab"));

                this.split_mode = true;

                // add editor instance
                this.eum
                    .add(new CodePadACEModel(
                        this,
                        this.find("left-tabbar") as GUI.tag.TabBarTag,
                        this.find("left-editorarea")) as CodePadBaseEditorModel)
                    .add(new CodePadACEModel(
                        this,
                        this.find("right-tabbar") as GUI.tag.TabBarTag,
                        this.find("right-editorarea")) as CodePadBaseEditorModel);

                this.eum.onstatuschange = (st) =>
                    this.updateStatus(st)

                this.fileview.fetch = (path) =>
                    new Promise(async function (resolve, reject) {
                        let dir: API.VFS.BaseFileHandle;
                        if (typeof path === "string") {
                            dir = path.asFileHandle();
                        } else {
                            dir = path;
                        }
                        try {
                            const d = await dir
                                .read();
                            if (d.error) {
                                return reject(d.error);
                            }
                            return resolve(d.result);
                        } catch (e) {
                            return reject(__e(e));
                        }
                    });
                let file = "Untitled".asFileHandle() as CodePadFileHandle;
                if (this.args && this.args.length > 0) {
                    this.addRecent(this.args[0].path);
                    if (this.args[0].type === "dir") {
                        this.currdir = this.args[0].path.asFileHandle() as CodePadFileHandle;
                    } else {
                        file = this.args[0].path.asFileHandle() as CodePadFileHandle;
                        this.currdir = file.parent();
                    }
                }
                this.setup();
                return this.eum.active.openFile(file);
            }

            /**
             * Set up the text editor
             *
             * @private
             * @returns {void}
             * @memberof CodePad
             */
            private setup(): void {
                if (!this.setting.recent)
                    this.setting.recent = [];
                this.fileview.onfileopen = (e) => {
                    if (!e.data || !e.data.path) {
                        return;
                    }
                    if (e.data.type === "dir") {
                        return;
                    }
                    this.addRecent(e.data.path);
                    return this.eum.active.openFile(
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
                    this.eum.active.selectFile(e.data.path);
                };

                this.on("resize", () => this.eum.resize());
                this.on("focus", () => this.eum.active.focus());
                this.spotlight = new CMDMenu(__("Command palette"));
                this.bindKey("ALT-P", () => this.spotlight.run(this));
                this.eum.contextmenuHandle = (e, m) => {
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

                (this.find("logger-clear") as GUI.tag.ButtonTag).onbtclick = () => {
                    this.logger.clear()
                }

                if (this.setting.showBottomBar === undefined) {
                    this.setting.showBottomBar = false;
                }

                this.loadExtensionMetaData();
                this.initCommandPalete();
                this.toggleSideBar();
                this.toggleSplitMode();
                this.applyAllSetting();
            }

            /**
             * Update the editor status bar
             *
             * @private
             * @memberof CodePad
             */
            private updateStatus(stat: GenericObject<any> = undefined): void {
                if (!stat)
                    stat = this.eum.active.getEditorStatus();
                this.editorstat.text = __(
                    "Row {0}, col {1}, lines: {2}",
                    stat.row + 1,
                    stat.column + 1,
                    stat.line
                );
                if (stat.langmode)
                    this.langstat.text = stat.langmode.text;
                this.filestat.text = stat.file
                let win = this.scheme as GUI.tag.WindowTag;
                if (win.apptitle != stat.file)
                    win.apptitle = stat.file;
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

            showOutput(toggle: boolean = false): void {
                if (toggle)
                    this.showBottomBar(true);
                this.bottombar.selectedIndex = 0;
            }

            /**
             * Apply [[showBottomBar]] from user setting value
             *
             * @protected
             * @param {string} k
             * @memberof CodePad
             */
            protected applySetting(k: string): void {
                if (k == "showBottomBar") {
                    this.showBottomBar(this.setting.showBottomBar);
                }
            }

            /**
             * Show or hide the bottom bar and
             * save the value to user setting
             *
             * @param {boolean} v
             * @memberof CodePad
             */
            public showBottomBar(v: boolean): void {
                this.setting.showBottomBar = v;
                if (v) {
                    $(this.bottombar).show();
                }
                else {
                    $(this.bottombar).hide();
                }
                this.trigger("resize");
            }

            /**
             * toggle the bottom bar
             *
             * @memberof CodePad
             */
            private toggleBottomBar(): void {
                this.showBottomBar(!this.setting.showBottomBar);
            }

            private toggleSplitMode(): void {
                const right_pannel = this.find("right-panel");
                const right_editor = this.eum.editors[1];
                const left_editor = this.eum.editors[0];
                if (this.split_mode) {
                    // before hide check if there is dirty files
                    if (right_editor.isDirty()) {
                        this.notify(__("Unable to disable split view: Please save changes of modified files on the right panel"));
                        return;
                    }
                    right_editor.closeAll();
                    $(right_pannel).hide();
                    this.split_mode = false;
                    left_editor.focus();
                }
                else {
                    $(right_pannel).show();
                    this.split_mode = true;
                    right_editor.openFile("Untitled".asFileHandle() as CodePadFileHandle);
                    right_editor.focus();
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
                    r.eum.active.setTheme(data.theme);
                    return r.eum.active.focus();
                });
                this.spotlight.addAction(cmdtheme);
                const cmdmode = new CMDMenu(__("Change language mode"));
                for (v of Array.from(this.eum.active.getModes())) {
                    cmdmode.addAction({ text: v.text, mode: v.mode });
                }
                cmdmode.onchildselect(function (
                    d: GUI.TagEventType<GUI.tag.ListItemEventData>,
                    r: CodePad
                ) {
                    const data = d.data.item.data;
                    r.eum.active.setMode(data);
                    r.updateStatus();
                    r.eum.active.focus();
                });
                this.spotlight.addAction(cmdmode);
                this.addAction(CMDMenu.fromMenu(this.fileMenu()));
            }

            /**
             * Load extension meta-data from specific file
             *
             * @private
             * @param {string} path
             * @return {*}  {Promise<void>}
             * @memberof CodePad
             */
            private loadExtensionMetaFromFile(path: string | API.VFS.BaseFileHandle): Promise<void> {
                return new Promise((resolve, reject) => {
                    path
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
                                        const action = v as any;
                                        this.extensions[ext.name].addAction(v);
                                        if (action.shortcut) {
                                            this.bindKey(action.shortcut, (e) => {
                                                return this.loadAndRunExtensionAction(action);
                                            })
                                        }
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
                                    this.extensions[ext.name].rootpath = path.asFileHandle().parent().path;
                                }
                            }
                            resolve();
                        })
                        .catch((e) => {
                            reject(__e(e));
                        });
                });
            }
            /**
             * Load the extension meta data from `extension.json` file
             *
             * @memberof CodePad
             */
            loadExtensionMetaData(): void {
                this.loadExtensionMetaFromFile(`${this.meta().path}/extensions.json`)
                    .then(() => {
                        // try to load local extension
                        this.loadExtensionMetaFromFile("home://.codepad/extensions.json")
                            .catch((e) => {
                                // ignore any error
                            });
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
             * @param { GenericObject<any>} extmeta extension name
             * @param {string} action action name
             * @returns {void}
             * @memberof CodePad
             */
            private runExtensionAction(extmeta: GenericObject<any>, action: string): void {
                let ext = undefined;
                if (extmeta.ext) {
                    if (!extmeta.ext[action]) {
                        return this.error(__("Unknown extension action: {0}", action));
                    }
                }
                else {
                    if (!CodePad.extensions[extmeta.name]) {
                        return this.error(
                            __("Unable to find extension: {0}", extmeta.name)
                        );
                    }
                    extmeta.ext = new CodePad.extensions[extmeta.name](this);
                    if (!extmeta.ext[action]) {
                        return this.error(__("Unable to find action: {0}", action));
                    }
                }

                extmeta.ext.preload()
                    .then(() => extmeta.ext[action]())
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
                 * @type {{ name: any, ext: any, rootpath?:string }}
                 */
                parent: { name: any, ext: any, rootpath?: string };

                /**
                 * Action name
                 *
                 * @type {*}
                 */
                name: any;
            }): void {
                const name = data.parent.name;
                const action = data.name;
                //verify if the extension is load
                if (!CodePad.extensions[name]) {
                    //load the extension
                    let path = `${this.meta().path}/${name}.js`;
                    if (data.parent.rootpath)
                        path = `${data.parent.rootpath}/${name}.js`;
                    this._api
                        .requires(path, true)
                        .then(() => this.runExtensionAction(data.parent, action))
                        .catch((e) => {
                            return this.error(
                                __("unable to load extension: {0}", name),
                                e
                            );
                        });
                } else {
                    this.runExtensionAction(data.parent, action);
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
                const recent = this.setting.recent.map((i: string) => {
                    return { text: i };
                });
                return {
                    text: __("File"),
                    nodes: [
                        { text: __("New"), dataid: "new", shortcut: "A-N" },
                        {
                            text: __("Open Recent"),
                            dataid: "recent",
                            nodes: recent,
                            onchildselect: (
                                e: GUI.TagEventType<GUI.tag.MenuEventData>,
                                r: CodePad
                            ) => {
                                const handle = e.data.item.data.text.asFileHandle();
                                handle.onready().then((meta: any) => {
                                    if (!meta) {
                                        return;
                                    }
                                    if (meta.type == "dir") {
                                        this.currdir = handle;
                                        this.toggleSideBar();
                                    }
                                    else {
                                        this.eum.active.openFile(handle);
                                    }
                                });
                            }
                        },
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
             * Add a file to recent files setting
             *
             * @private
             * @param {string} file
             * @memberof CodePad
             */
            private addRecent(file: string): void {
                if (!this.setting.recent)
                    this.setting.recent = [];
                if (this.setting.recent.includes(file)) {
                    return;
                }
                this.setting.recent.push(file);
                if(this.setting.recent.length > 10)
                    this.setting.recent = this.setting.recent.slice(0, 10);
                
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
            private menuAction(dataid: string, r?: CodePad): any {
                let me: CodePad = this;
                if (r) {
                    me = r;
                }
                switch (dataid) {
                    case "new":
                        return me.eum.active.openFile("Untitled".asFileHandle() as CodePadFileHandle);
                    case "open":
                        return me
                            .openDialog("FileDialog", {
                                title: __("Open file"),
                                mimes: Array.from(me.meta().mimes).filter(
                                    (v) => v !== "dir"
                                ),
                            })
                            .then((f: API.FileInfoType) => {
                                this.addRecent(f.file.path);
                                me.eum.active.openFile(f.file.path.asFileHandle());
                            });
                    case "opendir":
                        return me
                            .openDialog("FileDialog", {
                                title: __("Open folder"),
                                mimes: ["dir"],
                            })
                            .then(function (f: API.FileInfoType) {
                                me.addRecent(f.file.path);
                                me.currdir = f.file.path.asFileHandle();
                                return me.toggleSideBar();
                            });
                    case "save":
                        return me.eum.active.save();

                    case "saveas":
                        return me.eum.active.saveAs();
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
                const dirties = this.eum.dirties();
                if (dirties.length === 0) {
                    // cleanup all extension
                    for (let k in this.extensions) {
                        if (this.extensions[k].ext && this.extensions[k].ext.cleanup) {
                            this.extensions[k].ext.cleanup();
                        }
                    }
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
                            {
                                text: "__(Toggle bottom bar)",
                                dataid: "bottombar"
                            },
                            {
                                text: "__(Toggle split view)",
                                dataid: "splitview"
                            }
                        ],
                        onchildselect: (
                            e: GUI.TagEventType<GUI.tag.MenuEventData>,
                            r: CodePadFileHandle
                        ) => {
                            switch (e.data.item.data.dataid) {
                                case "cmdpalette":
                                    return this.spotlight.run(this);

                                case "bottombar":
                                    return this.toggleBottomBar();

                                case "splitview":
                                    return this.toggleSplitMode();
                                    break;

                                default:
                                    break;
                            }
                            r
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
            shortcut: string;
            nodes: GenericObject<any>[];
            parent: CMDMenu;
            rootpath: string;
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
                if (shortcut) {
                    this.text += `(${shortcut})`;
                }
                this.shortcut = shortcut;
                this.nodes = [];
                this.parent = undefined;
                this.rootpath = undefined;
                this.select = function (e) { };
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
                if (v.shortcut) {
                    v.text = `${v.text.__()} (${v.shortcut})`;
                }
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
            const m = new CMDMenu(mn.text, undefined);
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

        /**
         * Helper class to manager several instances
         * of editor models
         *
         * @class EditorModelManager
         */
        class EditorModelManager {

            /**
             * Referent to the active editor model
             *
             * @private
             * @type {CodePadBaseEditorModel}
             * @memberof EditorModelManager
             */
            private active_editor: CodePadBaseEditorModel;

            /**
             * Store a list of editor models
             *
             * @private
             * @type {CodePadBaseEditorModel[]}
             * @memberof EditorModelManager
             */
            private models: CodePadBaseEditorModel[];

            /**
             * Creates an instance of EditorModelManager.
             * @memberof EditorModelManager
             */
            constructor() {
                this.active_editor = undefined;
                this.models = [];
            }

            get editors(): CodePadBaseEditorModel[] {
                return this.models;
            }
            set contextmenuHandle(cb: (e: any, m: any) => void) {
                for (let ed of this.models) {
                    ed.contextmenuHandle = cb;
                }
            }

            /**
             * Get the active editor model
             *
             * @readonly
             * @type {CodePadBaseEditorModel}
             * @memberof EditorModelManager
             */
            get active(): CodePadBaseEditorModel {
                return this.active_editor;
            }

            /**
             * Add a model to the manager
             *
             * @param {CodePadBaseEditorModel} model
             * @memberof EditorModelManager
             */
            add(model: CodePadBaseEditorModel): EditorModelManager {
                this.models.push(model);
                if (!this.active_editor)
                    this.active_editor = model;
                model.on("focus", () => {
                    this.active_editor = model;
                });
                return this;
            }

            set onstatuschange(cb: (stat: GenericObject<any>) => void) {
                for (let ed of this.models) {
                    ed.onstatuschange = cb;
                }
            }

            dirties(): CodePadFileHandle[] {
                let list = [];
                for (let ed of this.models) {
                    list = list.concat(ed.dirties());
                }
                return list;
            }

            /**
             * Resize all editor
             *
             * @memberof EditorModelManager
             */
            resize(): void {
                for (let ed of this.models) {
                    ed.resize();
                }
            }
        }
        /**
         * This class handles log output to the Editor output container
         *
         * @class Logger
         */
        class Logger {

            /**
             * Referent to the log container
             *
             * @private
             * @type {HTMLElement}
             * @memberof Logger
             */
            private target: HTMLElement;


            /**
             * Creates an instance of Logger.
             * @param {HTMLElement} el target container
             * @memberof Logger
             */
            constructor(el: HTMLElement) {
                this.target = el;
            }

            /**
             * Log level info
             *
             * @param {string|FormattedString} s
             * @memberof Logger
             */
            info(s: string | FormattedString): void {
                this.log("info", s, true);
            }

            /**
             * Log level warning
             *
             * @param {string|FormattedString} s
             * @memberof Logger
             */
            warn(s: string | FormattedString): void {
                this.log("warn", s, true);
            }

            /**
             * Log level error
             *
             * @param {string|FormattedString} s
             * @memberof Logger
             */
            error(s: string | FormattedString): void {
                this.log("error", s, true);
            }


            /**
             * Log a string to target container
             *
             * @private
             * @param {string} c class name of the appended log element
             * @param {string|FormattedString} s log string
             * @param {boolean} showtime define whether the logger should insert datetime prefix
             * in the log string
             * @memberof Logger
             */
            private log(c: string, s: string | FormattedString, showtime: boolean): void {
                let el = $("<pre></pre>")
                    .attr("class", `code-pad-log-${c}`);
                if (showtime) {
                    let date = new Date();
                    let prefix = date.getDate() + "/"
                        + (date.getMonth() + 1) + "/"
                        + date.getFullYear() + " "
                        + date.getHours() + ":"
                        + date.getMinutes() + ":"
                        + date.getSeconds();
                    el.text(`[${prefix}]: ${s.__()}`);
                }
                else {
                    el.text(s.__());
                }
                $(this.target).append(el);
                $(this.target).scrollTop($(this.target)[0].scrollHeight);
            }

            /**
             * Print a log message without prefix
             *
             * @param {string|FormattedString} s text to print
             * @memberof Logger
             */
            print(s: string | FormattedString): void {
                this.log("info", s, false);
            }

            /**
             * Empty the log container
             *
             * @memberof Logger
             */
            clear(): void {
                $(this.target).empty();
            }
        }

        CodePad.CMDMenu = CMDMenu;
        CodePad.Logger = Logger;

        CodePad.dependencies = [
            "os://scripts/ace/ace.js",
            "os://scripts/ace/ext-language_tools.js",
            "os://scripts/ace/ext-modelist.js",
            "os://scripts/ace/ext-themelist.js"
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
                    $(document).unbind("mousedown", cb);
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
                this.quit();
                el.selected = false;
                if (this.handle) {
                    this.handle({ data: { item: el } });
                }
            }
        }

        CommandPalette.scheme = `\
<afx-app-window data-id = "cmd-win"
    apptitle="" minimizable="false"
    resizable = "false" width="200" height="200">
    <afx-vbox>
        <input data-height="25" type = "text" data-id="searchbox"></input>
        <afx-list-view data-id="container"></afx-list-view>
    </afx-vbox>
</afx-app-window>\
        `;
    }
}
