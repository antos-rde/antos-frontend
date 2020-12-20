namespace OS {
    export namespace application {

        export abstract class CodePadBaseEditorModel {
            /**
             * Reference to the current editing file handle
             *
             * @protected
             * @type {CodePadFileHandle}
             * @memberof CodePad
             */
            protected currfile: CodePadFileHandle;

            private app: CodePad;

            /**
             * Reference to the editor tab bar UI
             *
             * @private
             * @type {GUI.tag.TabBarTag}
             * @memberof CodePad
             */
            private tabbar: GUI.tag.TabBarTag;

            private container: HTMLElement;

            onstatuschange: (stat: GenericObject<any>) => void;

            /**
             * Editor mutex
             *
             * @private
             * @type {boolean}
             * @memberof CodePad
             */
            private editormux: boolean;

            constructor(app: CodePad, tabbar: GUI.tag.TabBarTag, editorarea: HTMLElement) {
                this.container = editorarea;
                this.currfile = "Untitled".asFileHandle() as CodePadFileHandle;
                this.tabbar = tabbar;
                this.editorSetup(editorarea);
                this.app = app;
                this.editormux = false;
                this.onstatuschange = undefined;

                this.on("focus", () =>{
                    if(this.onstatuschange)
                        this.onstatuschange(this.getEditorStatus());
                });
                this.on("input", () => {
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

                this.on("changeCursor", () => {
                    if (this.onstatuschange)
                        this.onstatuschange(this.getEditorStatus());
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
                    this.app.openDialog("YesNoDialog", {
                        title: __("Close tab"),
                        text: __("Close without saving ?"),
                    }).then((d) => {
                        if (d) {
                            return this.closeTab(it);
                        }
                        return this.focus();
                    });
                    return false;
                };
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
                file.um = this.newUndoManager();
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
                //return if file is @currfile
                if (this.currfile !== file) {
                    this.currfile.cache = this.getValue();
                    this.currfile.cursor = this.getCursor();
                    this.currfile.selected = false;
                    this.currfile = file;
                }

                if (!file.langmode) {
                    if (file.path.toString() !== "Untitled") {
                        file.langmode = this.getModeForPath(file.path);
                    } else {
                        file.langmode = {
                            text: "Text",
                            mode: "ace/mode/text",
                        };
                    }
                }
                this.editormux = true;
                this.setUndoManager(this.newUndoManager());
                this.setValue(file.cache);
                this.setMode(file.langmode);

                if (file.cursor) {
                    this.setCursor(file.cursor);
                }
                this.setUndoManager(file.um);
                if (this.onstatuschange)
                    this.onstatuschange(this.getEditorStatus());
                this.focus();
            }

            selectFile(file: CodePadFileHandle | string): void {
                const i = this.findTabByFile(
                    file.asFileHandle() as CodePadFileHandle
                );
                if (i !== -1) {
                    this.tabbar.selected = i;
                }
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
                        return this.app.error(
                            __("Unable to open: {0}", file.path),
                            e
                        );
                    });
            }

            /**
             * write a file
             *
             * @private
             * @param {CodePadFileHandle} file
             * @memberof CodePad
             */
            private write(file: CodePadFileHandle): void {
                this.currfile.cache = this.getValue();
                file.write("text/plain")
                    .then((d) => {
                        file.dirty = false;
                        file.text = file.basename;
                        this.tabbar.update(undefined);
                    })
                    .catch((e) =>
                        this.app.error(__("Unable to save file: {0}", file.path), e)
                    );
            }

            save(): void {
                this.currfile.cache = this.getValue();
                if (this.currfile.basename) {
                    return this.write(this.currfile);
                }
                return this.saveAs();
            }

            /**
             * Save the current file as another file
             *
             * @public
             * @memberof CodePad
             */
            saveAs(): void {
                this.app.openDialog("FileDialog", {
                    title: __("Save as"),
                    file: this.currfile,
                }).then((f) => {
                    let d = f.file.path.asFileHandle();
                    if (f.file.type === "file") {
                        d = d.parent();
                    }
                    this.currfile.setPath(`${d.path}/${f.name}`);
                    this.write(this.currfile);
                });
            }

            dirties(): CodePadFileHandle[] {
                const result = [];
                for (let v of Array.from(this.tabbar.items)) {
                    if (v.dirty) {
                        result.push(v);
                    }
                }
                return result;
            }

            set contextmenuHandle(cb:(e: any,m: any)=>void)
            {
                this.container.contextmenuHandle = cb;
            }

            closeAll(): void
            {
                this.tabbar.items = [];
                this.setValue("");
                this.setUndoManager(this.newUndoManager());
            }

            isDirty(): boolean
            {
                return this.dirties().length > 0;
            }

            protected abstract editorSetup(el: HTMLElement): void;
            abstract on(evt_str: string, callback: () => void): void;
            abstract resize(): void;
            abstract focus(): void;
            protected abstract getModeForPath(path: string): GenericObject<any>;
            abstract getEditorStatus(): GenericObject<any>;
            abstract getValue(): string;
            abstract setValue(value: string): void;
            protected abstract getCursor(): GenericObject<any>;
            protected abstract newUndoManager(): GenericObject<any>;
            protected abstract setUndoManager(um: GenericObject<any>): void;
            abstract setMode(m: GenericObject<any>): void;
            protected abstract setCursor(c: GenericObject<any>): void;
            abstract setTheme(theme: string): void;
            abstract getModes(): GenericObject<any>[];
        }
    }
}