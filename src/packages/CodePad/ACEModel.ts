var ace: any;
namespace OS {
    export namespace application {


        export class CodePadACEModel extends CodePadBaseEditorModel {
            private modes: GenericObject<any>;
            constructor(app: CodePad, tabbar: GUI.tag.TabBarTag, editorarea: HTMLElement) {
                ace.config.set("basePath", "scripts/ace");
                ace.require("ace/ext/language_tools");
                super(app,tabbar,editorarea);
                this.modes = ace.require("ace/ext/modelist");
            }


            getModes(): GenericObject<any>[] {
                const list = [];
                let v: GenericObject<any>;
                for (v of Array.from(this.modes.modes)) {
                    list.push({ text: v.caption, mode: v.mode });
                }
                return list;
            }
            setTheme(theme: string): void {
                this.editor.setTheme(theme);
            }
            protected setUndoManager(um: GenericObject<any>): void {
                this.editor.getSession().setUndoManager(um);
            }
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
            setMode(m: GenericObject<any>): void {
                this.currfile.langmode = m;
                this.editor.getSession().setMode(m.mode);
            }
            protected getCursor(): GenericObject<any> {
                return this.editor.getCursorPosition();
            }
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
            resize(): void {
                this.editor.resize();
            }
            focus(): void {
                this.editor.focus();
            }
            protected getModeForPath(path: string): GenericObject<any> {
                const m = this.modes.getModeForPath(path);
                return {
                    text: m.caption,
                    mode: m.mode
                }
            }
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

            getValue(): string {
                return this.editor.getValue();
            }
            setValue(value: string): void {
                this.editor.setValue(value, -1);
            }

        }
    }
}