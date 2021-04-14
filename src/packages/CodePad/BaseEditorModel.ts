namespace OS {
    export namespace application {

        /**
         * Extends the [[RemoteFileHandle]] interface with some useful
         * properties used by the Editor API
         */
         export type EditorFileHandle = API.VFS.RemoteFileHandle & {
            /**
             * The text will be displayed on the tab bar when opened
             *
             * @type {string}
             */
            text: string;

            /**
             * Editor text model attached to the file
             * modification history of the file
             *
             * @type {any}
             */
            textModel: any;

            /**
             * Indicate whether the file is selected
             *
             * @type {boolean}
             */
            selected: boolean;

        };

        export abstract class BaseEditorModel {
            /**
             * Reference to the current editing file handle
             *
             * @protected
             * @type {EditorFileHandle}
             * @memberof BaseEditorModel
             */
            protected currfile: EditorFileHandle;


            /**
             * Referent to the parent app
             *
             * @private
             * @type {BaseApplication}
             * @memberof BaseEditorModel
             */
            private app: BaseApplication;

            /**
             * Reference to the editor tab bar UI
             *
             * @private
             * @type {GUI.tag.TabBarTag}
             * @memberof BaseEditorModel
             */
            private tabbar: GUI.tag.TabBarTag;


            /**
             * Referent to the editor container
             *
             * @private
             * @type {HTMLElement}
             * @memberof BaseEditorModel
             */
            private container: HTMLElement;

            onstatuschange: (stat: GenericObject<any>) => void;

            /**
             * Editor mutex
             *
             * @private
             * @type {boolean}
             * @memberof BaseEditorModel
             */
            private editormux: boolean;


            /**
             * Creates an instance of BaseEditorModel.
             * 
             * @param {Antedit} app parent app
             * @param {GUI.tag.TabBarTag} tabbar tabbar DOM element
             * @param {HTMLElement} editorarea editor container DOM element
             * @memberof BaseEditorModel
             */
            constructor(app: BaseApplication, tabbar: GUI.tag.TabBarTag, editorarea: HTMLElement) {
                this.container = editorarea;
                this.currfile = "Untitled".asFileHandle() as EditorFileHandle;
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
             * @param {EditorFileHandle} file then file handle to search
             * @returns {number}
             * @memberof BaseEditorModel
             */
            private findTabByFile(file: EditorFileHandle): number {
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
             * @param {EditorFileHandle} file
             * @memberof BaseEditorModel
             */
            private newTab(file: EditorFileHandle): void {
                file.text = file.basename ? file.basename : file.path;
                if (!file.cache) {
                    file.cache = "";
                }
                file.textModel = this.newTextModelFrom(file);
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
             * @memberof BaseEditorModel
             */
            private closeTab(it: GUI.tag.ListViewItemTag): boolean {
                this.tabbar.delete(it);
                const cnt = this.tabbar.items.length;

                if (cnt === 0) {
                    this.openFile(
                        "Untitled".asFileHandle() as EditorFileHandle
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
             * @memberof BaseEditorModel
             */
            private selecteTab(i: number): void {
                //return if i is @tabbar.get "selidx"
                const file = this.tabbar.items[i] as EditorFileHandle;
                if (!file) {
                    return;
                }
                //return if file is @currfile
                if (this.currfile !== file) {
                    this.currfile.textModel = this.getTexModel();
                    this.currfile.selected = false;
                    this.currfile = file;
                }

                this.editormux = true;
                this.setTextModel(file.textModel);
                if (this.onstatuschange)
                    this.onstatuschange(this.getEditorStatus());
                this.focus();
            }


            /**
             * Select an opened file, this will select the corresponding tab
             *
             * @param {(EditorFileHandle | string)} file
             * @memberof BaseEditorModel
             */
            selectFile(file: EditorFileHandle | string): void {
                const i = this.findTabByFile(
                    file.asFileHandle() as EditorFileHandle
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
             * @param {EditorFileHandle} file file to open
             * @returns {void}
             * @memberof BaseEditorModel
             */
            openFile(file: EditorFileHandle): void {
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
             * @param {EditorFileHandle} file
             * @memberof BaseEditorModel
             */
            private write(file: EditorFileHandle): void {
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
             * @memberof BaseEditorModel
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
             * @memberof BaseEditorModel
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
             * @return {*}  {EditorFileHandle[]}
             * @memberof BaseEditorModel
             */
            dirties(): EditorFileHandle[] {
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
             * @memberof BaseEditorModel
             */
            set contextmenuHandle(cb: (e: any, m: any) => void) {
                this.container.contextmenuHandle = cb;
            }


            /**
             * Close all opened files
             *
             * @memberof BaseEditorModel
             */
            closeAll(): void {
                this.tabbar.items = [];
                this.resetEditor();
            }

            /**
             * Check whether the editor is dirty
             *
             * @return {*}  {boolean}
             * @memberof BaseEditorModel
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
             * @memberof BaseEditorModel
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
             * @memberof BaseEditorModel
             */
            abstract on(evt_str: string, callback: () => void): void;


            /**
             * Resize the editor
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @memberof BaseEditorModel
             */
            abstract resize(): void;


            /**
             * Make the editor focused
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @memberof BaseEditorModel
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
             * @memberof BaseEditorModel
             */
            protected abstract getModeForPath(path: string): GenericObject<any>;


            /**
             * Query the editor status
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @return {*}  {GenericObject<any>}
             * @memberof BaseEditorModel
             */
            abstract getEditorStatus(): GenericObject<any>;


            /**
             * Get the editor value
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @return {*}  {string}
             * @memberof BaseEditorModel
             */
            abstract getValue(): string;


            /**
             * Set the editor value
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @param {string} value
             * @memberof BaseEditorModel
             */
            abstract setValue(value: string): void;

            /**
             * Set the editor language mode
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @param {GenericObject<any>} m
             * @memberof BaseEditorModel
             */
            abstract setMode(m: GenericObject<any>): void;


            /**
             * Get textModel from the current editor session
             *
             * @protected
             * @abstract
             * @return {*}  {*}
             * @memberof BaseEditorModel
             */
            protected abstract getTexModel(): any;
            

            /**
             * Set text model to the current editor session
             *
             * @protected
             * @abstract
             * @param {*} model
             * @memberof BaseEditorModel
             */
            protected abstract setTextModel(model: any): void;
            

            /**
             * Create new text model from the VFS file
             *
             * @protected
             * @abstract
             * @param {EditorFileHandle} file
             * @return {*}  {*}
             * @memberof BaseEditorModel
             */
            protected abstract newTextModelFrom(file: EditorFileHandle): any;


            /**
             * Reset the editor
             *
             * @protected
             * @abstract
             * @memberof BaseEditorModel
             */
            protected abstract resetEditor(): void;
            
            /**
             * Set the current editor theme
             * 
             * Should be implemented by subclasses
             *
             * @abstract
             * @param {string} theme
             * @memberof BaseEditorModel
             */
            abstract setTheme(theme: string): void;


            /**
             * Get all language modes supported by the editor
             *
             * @abstract
             * @return {*}  {GenericObject<any>[]}
             * @memberof BaseEditorModel
             */
            abstract getModes(): GenericObject<any>[];
        }
    }
}