var ace: any;
namespace OS {
    export namespace application {


        /**
         * Wrapper model for the ACE text editor
         *
         * @export
         * @class CodePadACEModel
         * @extends {CodePadBaseEditorModel}
         */
        export class CodePadACEModel extends CodePadBaseEditorModel {

            /**
             * Reference to ACE language modes
             *
             * @private
             * @type {GenericObject<any>}
             * @memberof CodePadACEModel
             */
            private modes: GenericObject<any>;


            /**
             * Creates an instance of CodePadACEModel.
             * @param {CodePad} app CodePad instance
             * @param {GUI.tag.TabBarTag} tabbar tabbar element
             * @param {HTMLElement} editorarea main editor container element
             * @memberof CodePadACEModel
             */
            constructor(app: CodePad, tabbar: GUI.tag.TabBarTag, editorarea: HTMLElement) {
                ace.config.set("basePath", "scripts/ace");
                ace.require("ace/ext/language_tools");
                super(app, tabbar, editorarea);
                this.modes = ace.require("ace/ext/modelist");
            }


            /**
             * Get language modes
             *
             * @return {*}  {GenericObject<any>[]}
             * @memberof CodePadACEModel
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
             * @memberof CodePadACEModel
             */
            setTheme(theme: string): void {
                this.editor.setTheme(theme);
            }


            /**
             * Set the editor undo manager
             *
             * @protected
             * @param {GenericObject<any>} um
             * @memberof CodePadACEModel
             */
            protected setUndoManager(um: GenericObject<any>): void {
                this.editor.getSession().setUndoManager(um);
            }


            /**
             * Set the editor cursor
             *
             * @protected
             * @param {GenericObject<any>} c cursor option
             * @memberof CodePadACEModel
             */
            protected setCursor(c: GenericObject<any>): void {
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
             * @memberof CodePadACEModel
             */
            setMode(m: GenericObject<any>): void {
                this.currfile.langmode = m;
                this.editor.getSession().setMode(m.mode);
            }


            /**
             * Get current editor cursor position
             *
             * @protected
             * @return {*}  {GenericObject<any>}
             * @memberof CodePadACEModel
             */
            protected getCursor(): GenericObject<any> {
                return this.editor.getCursorPosition();
            }


            /**
             * create a new UndoManage instance
             *
             * @protected
             * @return {*}  {GenericObject<any>}
             * @memberof CodePadACEModel
             */
            protected newUndoManager(): GenericObject<any> {
                return new ace.UndoManager();
            }

            /**
             * Reference to the editor instance
             *
             * @protected
             * @type {GenericObject<any>}
             * @memberof CodePad
             */
            protected editor: GenericObject<any>;


            /**
             * Setup the editor
             *
             * @protected
             * @param {HTMLElement} el editor container DOM
             * @memberof CodePadACEModel
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
             * @memberof CodePadACEModel
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
             * @memberof CodePadACEModel
             */
            resize(): void {
                this.editor.resize();
            }


            /**
             * Focus on the editor
             *
             * @memberof CodePadACEModel
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
             * @memberof CodePadACEModel
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
             * @memberof CodePadACEModel
             */
            getEditorStatus(): GenericObject<any> {
                const c = this.editor.session.selection.getCursor();
                const l = this.editor.session.getLength();
                return {
                    row: c.row,
                    column: c.column,
                    line: l,
                    langmode: this.currfile.langmode,
                    file: this.currfile.path
                }
            }


            /**
             * Get editor value
             *
             * @return {*}  {string}
             * @memberof CodePadACEModel
             */
            getValue(): string {
                return this.editor.getValue();
            }


            /**
             * Set editor value
             *
             * @param {string} value
             * @memberof CodePadACEModel
             */
            setValue(value: string): void {
                this.editor.setValue(value, -1);
            }

        }
    }
}