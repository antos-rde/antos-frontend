var ace: any;
namespace OS {
    export namespace application {


        /**
         * Wrapper model for the ACE text editor
         *
         * @export
         * @class ACEModel
         * @extends {BaseEditorModel}
         */
        export class ACEModel extends BaseEditorModel {

            /**
             * Current editor mode
             *
             * @private
             * @type {GenericObject<any>}
             * @memberof ACEModel
             */
            private mode: GenericObject<any>;

            /**
             * Reference to ACE language modes
             *
             * @private
             * @type {GenericObject<any>}
             * @memberof ACEModel
             */
            private modes: GenericObject<any>;


            /**
             * Creates an instance of ACEModel.
             * @param {ACEModel} app  instance
             * @param {GUI.tag.TabBarTag} tabbar tabbar element
             * @param {HTMLElement} editorarea main editor container element
             * @memberof ACEModel
             */
            constructor(app: BaseApplication, tabbar: GUI.tag.TabBarTag, editorarea: HTMLElement) {
                ace.config.set("basePath", "scripts/ace");
                ace.require("ace/ext/language_tools");
                super(app, tabbar, editorarea);
                this.modes = ace.require("ace/ext/modelist");
            }

            /**
             * Reset the editor
             *
             * @protected
             * @memberof ACEModel
             */
            protected resetEditor(): void {
                this.setValue("");
                this.editor.getSession().setUndoManager(new ace.UndoManager());
            }


            /**
             * Get a text model from the current editor session
             *
             * @protected
             * @return {*} 
             * @memberof ACEModel
             */
            protected getTexModel() {
                const textModel = {} as any;
                textModel.cursor = this.editor.getCursorPosition();
                textModel.cache = this.getValue();
                textModel.um = this.editor.session.getUndoManager();
                textModel.langmode = this.mode;
                return textModel;
            }


            /**
             * Set text model to current editor session
             *
             * @protected
             * @param {*} model
             * @memberof ACEModel
             */
            protected setTextModel(model: any): void {
                this.editor.getSession().setUndoManager(new ace.UndoManager());
                this.setValue(model.cache);
                this.setMode(model.langmode);

                if (model.cursor) {
                    this.setCursor(model.cursor);
                }
                this.editor.getSession().setUndoManager(model.um);
            }


            /**
             * Create new editor model from file
             *
             * @protected
             * @param {EditorFileHandle} file
             * @return {*}  {*}
             * @memberof ACEModel
             */
            protected newTextModelFrom(file: EditorFileHandle): any {
                const textModel = {} as any;
                textModel.um =  new ace.UndoManager();
                textModel.cache = file.cache;
                textModel.cursor = undefined;
                if (file.path.toString() !== "Untitled") {
                    textModel.langmode = this.getModeForPath(file.path);
                } else {
                    textModel.langmode = {
                        text: "Text",
                        mode: "ace/mode/text",
                    };
                }
                return textModel;
            }

            /**
             * Get language modes
             *
             * @return {*}  {GenericObject<any>[]}
             * @memberof ACEModel
             */
            getModes(): GenericObject<any>[] {
                const list = [];
                let v: GenericObject<any>;
                for (v of Array.from(this.modes.modes)) {
                    list.push({ text: v.caption, mode: v.mode });
                }
                return list;
            }


            /**
             * Set the editor theme
             *
             * @param {string} theme theme name
             * @memberof ACEModel
             */
            setTheme(theme: string): void {
                this.editor.setTheme(theme);
            }

            /**
             * Set the editor cursor
             *
             * @private
             * @param {GenericObject<any>} c cursor option
             * @memberof ACEModel
             */
            private setCursor(c: GenericObject<any>): void {
                this.editor.renderer.scrollCursorIntoView(
                    {
                        row: c.row,
                        column: c.column,
                    },
                    0.5
                );
                this.editor.selection.moveTo(
                    c.row,
                    c.column
                );
            }


            /**
             * Set editor language mode
             *
             * The mode object should be in the following format:
             * ```ts
             * {
             *  text: string,
             *  mode: string
             * }
             * ```
             * 
             * @param {GenericObject<any>} m language mode object
             * @memberof ACEModel
             */
            setMode(m: GenericObject<any>): void {
                this.mode = m;
                this.editor.getSession().setMode(m.mode);
            }



            /**
             * Reference to the editor instance
             *
             * @protected
             * @type {GenericObject<any>}
             * @memberof ACEModel
             */
            protected editor: GenericObject<any>;


            /**
             * Setup the editor
             *
             * @protected
             * @param {HTMLElement} el editor container DOM
             * @memberof ACEModel
             */
            protected editorSetup(el: HTMLElement): void {
                this.editor = ace.edit(el);
                this.editor.setOptions({
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    enableLiveAutocompletion: true,
                    highlightActiveLine: true,
                    highlightSelectedWord: true,
                    behavioursEnabled: true,
                    wrap: true,
                    fontSize: "10pt",
                    showInvisibles: true,
                });
                this.editor.setTheme("ace/theme/monokai");
                this.editor.completers.push({
                    getCompletions(
                        editor: any,
                        session: any,
                        pos: any,
                        prefix: any,
                        callback: any
                    ) { },
                });
                this.editor.getSession().setUseWrapMode(true);

            }


            /**
             * Register to editor event
             *
             * @param {string} evt_str event name
             * @param {() => void} callback callback function
             * @memberof ACEModel
             */
            on(evt_str: string, callback: () => void): void {
                switch (evt_str) {
                    case "input":
                    case "focus":
                        this.editor.on(evt_str, callback);
                        break;
                    case "changeCursor":
                        this.editor
                            .getSession()
                            .selection.on(evt_str, callback);
                        break;
                    default:
                        break;
                }
            }


            /**
             * Resize the editor
             *
             * @memberof ACEModel
             */
            resize(): void {
                this.editor.resize();
            }


            /**
             * Focus on the editor
             *
             * @memberof ACEModel
             */
            focus(): void {
                this.editor.focus();
            }


            /**
             * Get language mode from path
             *
             * @protected
             * @param {string} path
             * @return {*}  {GenericObject<any>}
             * @memberof ACEModel
             */
             protected getModeForPath(path: string): GenericObject<any> {
                const m = this.modes.getModeForPath(path);
                return {
                    text: m.caption,
                    mode: m.mode
                }
            }

            /**
             * Get the editor status
             *
             * @return {*}  {GenericObject<any>}
             * @memberof ACEModel
             */
            getEditorStatus(): GenericObject<any> {
                const c = this.editor.session.selection.getCursor();
                const l = this.editor.session.getLength();
                return {
                    row: c.row,
                    column: c.column,
                    line: l,
                    langmode: this.mode,
                    file: this.currfile.path
                }
            }


            /**
             * Get editor value
             *
             * @return {*}  {string}
             * @memberof ACEModel
             */
            getValue(): string {
                return this.editor.getValue();
            }


            /**
             * Set editor value
             *
             * @param {string} value
             * @memberof ACEModel
             */
            setValue(value: string): void {
                this.editor.setValue(value, -1);
            }

        }
    }
}