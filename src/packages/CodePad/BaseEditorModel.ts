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


            /**
             * Referent to the parent app
             *
             * @private
             * @type {CodePad}
             * @memberof CodePadBaseEditorModel
             */
            private app: CodePad;

            /**
             * Reference to the editor tab bar UI
             *
             * @private
             * @type {GUI.tag.TabBarTag}
             * @memberof CodePad
             */
            private tabbar: GUI.tag.TabBarTag;


            /**
             * Referent to the editor container
             *
             * @private
             * @type {HTMLElement}
             * @memberof CodePadBaseEditorModel
             */
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


            /**
             * Creates an instance of CodePadBaseEditorModel.
             * 
             * @param {CodePad} app parent app
             * @param {GUI.tag.TabBarTag} tabbar tabbar DOM element
             * @param {HTMLElement} editorarea editor container DOM element
             * @memberof CodePadBaseEditorModel
             */
            constructor(app: CodePad, tabbar: GUI.tag.TabBarTag, editorarea: HTMLElement) {
                this.container = editorarea;
                this.currfile = "Untitled".asFileHandle() as CodePadFileHandle;
                this.tabbar = tabbar;
                this.editorSetup(editorarea);
                this.app = app;
                this.editormux = false;
                this.onstatuschange = undefined;

                this.on("focus", () => {
                    if (this.onstatuschange)
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


            /**
             * Select an opened file, this will select the corresponding tab
             *
             * @param {(CodePadFileHandle | string)} file
             * @memberof CodePadBaseEditorModel
             */
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


            /**
             * Save the current opened file
             *
             * @return {*}  {void}
             * @memberof CodePadBaseEditorModel
             */
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

            /**
             * Get all dirty file handles in the editor
             *
             * @return {*}  {CodePadFileHandle[]}
             * @memberof CodePadBaseEditorModel
             */
            dirties(): CodePadFileHandle[] {
                const result = [];
                for (let v of Array.from(this.tabbar.items)) {
                    if (v.dirty) {
                        result.push(v);
                    }
                }
                return result;
            }

            /**
             * Context menu handle for the editor
             *
             * @memberof CodePadBaseEditorModel
             */
            set contextmenuHandle(cb: (e: any, m: any) => void) {
                this.container.contextmenuHandle = cb;
            }


            /**
             * Close all opened files
             *
             * @memberof CodePadBaseEditorModel
             */
            closeAll(): void {
                this.tabbar.items = [];
                this.setValue("");
                this.setUndoManager(this.newUndoManager());
            }

            /**
             * Check whether the editor is dirty
             *
             * @return {*}  {boolean}
             * @memberof CodePadBaseEditorModel
             */
            isDirty(): boolean {
                return this.dirties().length > 0;
            }


            /**
             * Set up the editor instance
             * Should be implemented by subclass
             *
             * @protected
             * @abstract
             * @param {HTMLElement} el
             * @memberof CodePadBaseEditorModel
             */
            protected abstract editorSetup(el: HTMLElement): void;


            /**
             * Listen to editor event
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @param {string} evt_str
             * @param {() => void} callback
             * @memberof CodePadBaseEditorModel
             */
            abstract on(evt_str: string, callback: () => void): void;


            /**
             * Resize the editor
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @memberof CodePadBaseEditorModel
             */
            abstract resize(): void;


            /**
             * Make the editor focused
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @memberof CodePadBaseEditorModel
             */
            abstract focus(): void;


            /**
             * Get language mode from file extension
             * 
             * Should be implemented by subclasses
             *
             * @protected
             * @abstract
             * @param {string} path
             * @return {*}  {GenericObject<any>}
             * @memberof CodePadBaseEditorModel
             */
            protected abstract getModeForPath(path: string): GenericObject<any>;


            /**
             * Query the editor status
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @return {*}  {GenericObject<any>}
             * @memberof CodePadBaseEditorModel
             */
            abstract getEditorStatus(): GenericObject<any>;


            /**
             * Get the editor value
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @return {*}  {string}
             * @memberof CodePadBaseEditorModel
             */
            abstract getValue(): string;


            /**
             * Set the editor value
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @param {string} value
             * @memberof CodePadBaseEditorModel
             */
            abstract setValue(value: string): void;


            /**
             * Get the current editor position
             * 
             * Should be implemented by subclasses
             *
             * @protected
             * @abstract
             * @return {*}  {GenericObject<any>}
             * @memberof CodePadBaseEditorModel
             */
            protected abstract getCursor(): GenericObject<any>;


            /**
             * Create new instance of UndoManager
             * 
             * This is specific to each editor, so
             * it should be implemented by subclasses
             *
             * @protected
             * @abstract
             * @return {*}  {GenericObject<any>}
             * @memberof CodePadBaseEditorModel
             */
            protected abstract newUndoManager(): GenericObject<any>;


            /**
             * Set the editor UndoManager
             * 
             * Should be implemented by subclasses
             *
             * @protected
             * @abstract
             * @param {GenericObject<any>} um
             * @memberof CodePadBaseEditorModel
             */
            protected abstract setUndoManager(um: GenericObject<any>): void;


            /**
             * Set the editor language mode
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @param {GenericObject<any>} m
             * @memberof CodePadBaseEditorModel
             */
            abstract setMode(m: GenericObject<any>): void;


            /**
             * Set current editor cursor position
             * 
             * Should be implemented by subclasses
             *
             * @protected
             * @abstract
             * @param {GenericObject<any>} c
             * @memberof CodePadBaseEditorModel
             */
            protected abstract setCursor(c: GenericObject<any>): void;


            /**
             * Set the current editor theme
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @param {string} theme
             * @memberof CodePadBaseEditorModel
             */
            abstract setTheme(theme: string): void;


            /**
             * Get all language modes supported by the editor
             *
             * @abstract
             * @return {*}  {GenericObject<any>[]}
             * @memberof CodePadBaseEditorModel
             */
            abstract getModes(): GenericObject<any>[];
        }
    }
}