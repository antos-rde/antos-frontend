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
namespace OS {
    export namespace GUI {
        /**
         * the SubWindow class is the abstract prototype of all
         * modal windows or dialogs definition in AntOS
         *
         * @export
         * @abstract
         * @class SubWindow
         * @extends {BaseModel}
         */
        export abstract class SubWindow extends BaseModel {
            /**
             * Placeholder indicates whether the sub window is in
             * modal mode. This value is reserver for future use
             *
             * @type {boolean}
             * @memberof SubWindow
             */
            modal: boolean;

            /**
             * Reference to the parent of the current sub-window
             *
             * @type {(BaseModel | typeof GUI)}
             * @memberof SubWindow
             */
            parent: BaseModel | typeof GUI;

            /**
             *Creates an instance of SubWindow.
             * @param {string} name SubWindow (class) name
             * @memberof SubWindow
             */
            constructor(name: string) {
                super(name, null);
                this.parent = undefined;
                this.modal = false;
            }

            /**
             * Exit the sub-window
             *
             * @returns {void}
             * @memberof SubWindow
             */
            quit(): void {
                const evt = new BaseEvent("exit", false);
                this.onexit(evt);
                if (!evt.prevent) {
                    delete this._observable;
                    if (this.scheme) {
                        $(this.scheme).remove();
                    }
                    if (this.dialog) {
                        return this.dialog.quit();
                    }
                }
            }

            /**
             * Init the sub-window, this function is called
             * on creation of the sub-window object. It is used
             * to render the sub-window UI.
             *
             * Need to be implemented by subclasses
             *
             * @abstract
             * @memberof SubWindow
             */
            abstract init(): void;

            /**
             * Main entry point after rendering of the sub-window
             *
             * @abstract
             * @memberof SubWindow
             */
            abstract main(): void;

            /**
             * Return the parent meta-data of the current
             * sub-window
             *
             * @returns {API.PackageMetaType}
             * @memberof SubWindow
             */
            meta(): API.PackageMetaType {
                const p = this.parent as BaseModel;
                if (p && p.meta) {
                    return p.meta();
                }
            }

            /**
             * Show the sub-window
             *
             * @memberof SubWindow
             */
            show(): void {
                this.trigger("focus");
                this.trigger("focused", undefined);
                if (this.dialog) {
                    this.dialog.show();
                }
            }

            /**
             * Hide the sub-window
             *
             * @returns {void}
             * @memberof SubWindow
             */
            hide(): void {
                return this.trigger("hide");
            }
        }

        SubWindow.type = ModelType.SubWindow;

        /**
         * Abstract prototype of all AntOS dialogs widget
         *
         * @export
         * @abstract
         * @class BaseDialog
         * @extends {SubWindow}
         */
        export abstract class BaseDialog extends SubWindow {
            /**
             * Placeholder for the dialog callback on exit
             *
             * @memberof BaseDialog
             */
            handle: (d: any) => void;

            /**
             * Placeholder of the dialog input data
             *
             * @type {GenericObject<any>}
             * @memberof BaseDialog
             */
            data: GenericObject<any>;

            /**
             *Creates an instance of BaseDialog.
             * @param {string} name Dialog (class) name
             * @memberof BaseDialog
             */
            constructor(name: string) {
                super(name);
                this.handle = undefined;
            }

            /**
             * Function called when dialog exits
             *
             * @protected
             * @param {BaseEvent} _e
             * @returns {void}
             * @memberof BaseDialog
             */
            protected onexit(_e: BaseEvent): void {
                if (this.parent) {
                    return (this.parent.dialog = undefined);
                }
            }
        }

        /**
         * A basic dialog renders a dialog widget using the UI
         * scheme provided in it constructor or defined in its
         * class variable `scheme`
         *
         * @export
         * @class BasicDialog
         * @extends {BaseDialog}
         */
        export class BasicDialog extends BaseDialog {
            /**
             * Placeholder for the UI scheme to be rendered. This can
             * be either the string definition of the scheme or
             * the VFS file handle of the scheme file
             *
             * @protected
             * @type {(string | OS.API.VFS.BaseFileHandle)}
             * @memberof BasicDialog
             */
            protected markup: string | OS.API.VFS.BaseFileHandle;

            /**
             * If the `markup` variable is not provided, then
             * the [[init]] function will find the scheme definition
             * in this class variable
             *
             * @static
             * @type {string}
             * @memberof BasicDialog
             */
            static scheme: string;

            /**
             *Creates an instance of BasicDialog.
             * @param {string} name dialog name
             * @param {(string | OS.API.VFS.BaseFileHandle)} [markup] UI scheme definition
             * @memberof BasicDialog
             */
            constructor(
                name: string,
                markup?: string | OS.API.VFS.BaseFileHandle
            ) {
                super(name);
                this.markup = markup;
            }

            /**
             * Render the dialog using the UI scheme provided by either
             * the `markup` instance variable or the `scheme` class variable
             *
             * @returns {void}
             * @memberof BasicDialog
             */
            init(): void {
                //this._onenter = undefined;
                if (this.markup) {
                    if (typeof this.markup === "string") {
                        return GUI.htmlToScheme(this.markup, this, this.host);
                    } else {
                        // a file handle
                        return this.render(this.markup.path);
                    }
                } else if (
                    GUI.dialogs[this.name] &&
                    GUI.dialogs[this.name].scheme
                ) {
                    const html: string = GUI.dialogs[this.name].scheme;
                    return GUI.htmlToScheme(html.trim(), this, this.host);
                } else {
                    this.error(__("Unable to find dialog scheme"));
                }
            }

            /**
             * Main entry point for the dialog
             *
             * @memberof BasicDialog
             */
            main(): void {
                const win = this.scheme as tag.WindowTag;
                $(win).attr("tabindex", 0);
                $(win).on('keydown', (e) => {
                    switch (e.which) {
                        case 27:
                            return this.quit();
                        case 13:
                            const btn = $("afx-button", win).filter(function () {
                                const did = $(this).attr('data-id').toLowerCase();
                                return did === "btnok" || did === "btnyes";
                            });
                            return $("button", btn).trigger("click");
                        default:
                            return;
                    }
                });
                if (this.data && this.data.title) {
                    win.apptitle = this.data.title;
                }
                win.resizable = false;
                win.minimizable = false;
                $(win).trigger("focus");
            }
        }

        /**
         * The namespace `dialogs` is dedicated to all Dialog definition
         * in AntOS
         */
        export namespace dialogs {
            /**
             * Simple prompt dialog to get user input text.
             * The input data of the dialog:
             *
             * ```typescript
             * {
             *      title: string, // window title
             *      label: string, // label text
             *      value: string,   // user input text
             *      type: string // input type: text or password
             * }
             * ```
             *
             * The data passing from the dialog to the callback function is
             * in the string text of the user input value
             *
             * @export
             * @class PromptDialog
             * @extends {BasicDialog}
             */
            export class PromptDialog extends BasicDialog {
                /**
                 *Creates an instance of PromptDialog.
                 * @memberof PromptDialog
                 */
                constructor() {
                    super("PromptDialog");
                }

                /**
                 * Main entry point
                 *
                 * @memberof PromptDialog
                 */
                main(): void {
                    super.main();
                    const $input = $(this.find("txtInput"));
                    if (this.data && this.data.label) {
                        (this.find(
                            "lbl"
                        ) as tag.LabelTag).text = this.data.label;
                    }
                    if (this.data && this.data.value) {
                        $input.val(this.data.value);
                    }

                    if (this.data && this.data.type) {
                        ($input[0] as HTMLInputElement).type = this.data.type
                    }

                    (this.find("btnOk") as tag.ButtonTag).onbtclick = (_e) => {
                        if (this.handle) {
                            this.handle($input.val());
                        }
                        return this.quit();
                    };

                    (this.find("btnCancel") as tag.ButtonTag).onbtclick = (
                        _e
                    ) => {
                        return this.quit();
                    };

                    $input.on("keyup", (e) => {
                        if (e.which !== 13) {
                            return;
                        }
                        if (this.handle) {
                            this.handle($input.val());
                        }
                        return this.quit();
                    });

                    $input.trigger("focus");
                }
            }
            /**
             * Scheme definition of the Prompt dialog
             */
            PromptDialog.scheme = `\
<afx-app-window  width='200' height='150' apptitle = "Prompt">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" ></div>
            <afx-vbox>
                <div data-height="10" ></div>
                <afx-label data-id = "lbl" ></afx-label>
                <input type = "text" data-id= "txtInput" ></input>
                <div data-height="10" ></div>
                <afx-hbox data-height="30">
                    <div ></div>
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" ></afx-button>
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" ></afx-button>
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" ></div>
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             * A text dialog is similar to a [[PromptDialog]] nut allows
             * user to input multi-line text.
             *
             * Refer to [[PromptDialog]] for the definition of input and callback data
             * of the dialog
             *
             * @export
             * @class TextDialog
             * @extends {BasicDialog}
             */
            export class TextDialog extends BasicDialog {
                /**
                 *Creates an instance of TextDialog.
                 * @memberof TextDialog
                 */
                constructor() {
                    super("TextDialog");
                }

                /**
                 * Main entry point
                 *
                 * @memberof TextDialog
                 */
                main(): void {
                    super.main();
                    const $input = $(this.find("txtInput"));
                    if (this.data && this.data.value) {
                        $input.val(this.data.value);
                    }
                    if (this.data && this.data.disable) {
                        $input.prop('disabled', true);
                    }
                    (this.find("btn-Ok") as tag.ButtonTag).onbtclick = (_e) => {
                        const value = $input.val();
                        if (!value || value === "") {
                            return;
                        }
                        if (this.handle) {
                            this.handle(value);
                        }
                        return this.quit();
                    };

                    (this.find("btnCancel") as tag.ButtonTag).onbtclick = (
                        _e
                    ): void => {
                        return this.quit();
                    };

                    $input.focus();
                }
            }
            /**
             * Scheme definition
             */
            TextDialog.scheme = `\
<afx-app-window data-id = "TextDialog" width='400' height='300'>
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" ></div>
            <afx-vbox>
                <div data-height="10" ></div>
                <textarea data-id= "txtInput" ></textarea>
                <div data-height="10" ></div>
                <afx-hbox data-height="30">
                    <div ></div>
                    <afx-button data-id = "btn-Ok" text = "__(Ok)" data-width = "40" ></afx-button>
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" ></afx-button>
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" ></div>
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             * A Calendar dialog allows user to select a date
             *
             * Input data:
             *
             * ```typescript
             * {
             *      title: string // window title
             * }
             * ```
             * 
             * @export
             * @class CalendarDialog
             * @extends {BasicDialog}
             */
            export class CalendarDialog extends BasicDialog {
                /**
                 * Creates an instance of CalendarDialog.
                 *
                 * Callback data: a Date object represent the selected date
                 *
                 *
                 * @memberof CalendarDialog
                 */
                constructor() {
                    super("CalendarDialog");
                }

                /**
                 *
                 *
                 * @memberof CalendarDialog
                 */
                main(): void {
                    super.main();
                    (this.find("btnOk") as tag.ButtonTag).onbtclick = (
                        _e
                    ): void => {
                        const date = (this.find("cal") as tag.CalendarTag)
                            .selectedDate;
                        if (!date) {
                            return this.notify(__("Please select a day"));
                        }
                        if (this.handle) {
                            this.handle(date);
                        }
                        return this.quit();
                    };

                    (this.find("btnCancel") as tag.ButtonTag).onbtclick = (
                        _e
                    ): void => {
                        return this.quit();
                    };
                }
            }
            /**
             * Scheme definition
             */
            CalendarDialog.scheme = `\
<afx-app-window  width='300' height='230' apptitle = "Calendar" >
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" ></div>
            <afx-vbox>
                <div data-height="10" ></div>
                <afx-calendar-view data-id = "cal" ></afx-calendar-view>
                <div data-height="10" ></div>
                <afx-hbox data-height="30">
                    <div ></div>
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" ></afx-button>
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" ></afx-button>
                </afx-hbox>
                <div data-height="10" ></div>
            </afx-vbox>
            <div data-width = "10" ></div>
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             * Color picker dialog
             *
             * Input data:
             *
             * ```typescript
             * {
             *      title: string // window title
             * }
             * ```
             * Callback data: [[ColorType]] object
             *
             * @export
             * @class ColorPickerDialog
             * @extends {BasicDialog}
             */
            export class ColorPickerDialog extends BasicDialog {
                /**
                 *Creates an instance of ColorPickerDialog.
                 * @memberof ColorPickerDialog
                 */
                constructor() {
                    super("ColorPickerDialog");
                }

                /**
                 *
                 *
                 * @memberof ColorPickerDialog
                 */
                main(): void {
                    super.main();
                    (this.find("btnOk") as tag.ButtonTag).onbtclick = (
                        _e
                    ): void => {
                        const color = (this.find(
                            "cpicker"
                        ) as tag.ColorPickerTag).selectedColor;
                        if (!color) {
                            return this.notify(__("Please select color"));
                        }
                        if (this.handle) {
                            this.handle(color);
                        }
                        return this.quit();
                    };

                    (this.find("btnCancel") as tag.ButtonTag).onbtclick = (
                        _e
                    ): void => {
                        return this.quit();
                    };
                }
            }
            /**
             * Scheme definition
             */
            ColorPickerDialog.scheme = `\
<afx-app-window  width='320' height='250' apptitle = "Color picker" >
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" ></div>
            <afx-vbox>
                <div data-height="10" ></div>
                <afx-color-picker data-id = "cpicker" ></afx-color-picker>
                <div data-height="10" ></div>
                <afx-hbox data-height="30">
                    <div ></div>
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" ></afx-button>
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" ></afx-button>
                </afx-hbox>
                <div data-height="10" ></div>
            </afx-vbox>
            <div data-width = "10" ></div>
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             * Show key-value pair of the input object
             *
             * Input data:
             *
             * ```typescript
             * {
             *      title: string, // window title
             *      [propName:string]: any
             * }
             * ```
             *
             * No data for callback
             *
             * @export
             * @class InfoDialog
             * @extends {BasicDialog}
             */
            export class InfoDialog extends BasicDialog {
                /**
                 *Creates an instance of InfoDialog.
                 * @memberof InfoDialog
                 */
                constructor() {
                    super("InfoDialog");
                }

                /**
                 *
                 *
                 * @memberof InfoDialog
                 */
                main(): void {
                    super.main();
                    const rows = [];
                    if (this.data && this.data.title) {
                        delete this.data.title;
                    }
                    for (let k in this.data) {
                        const v = this.data[k];
                        rows.push([{ text: k }, { text: v }]);
                    }
                    const grid = this.find("grid") as tag.GridViewTag;
                    grid.header = [
                        { text: __("Name"), width: 70 },
                        { text: __("Value") },
                    ];
                    grid.rows = rows;
                    (this.find("btnCancel") as tag.ButtonTag).onbtclick = (
                        _e
                    ): void => {
                        return this.quit();
                    };
                }
            }
            /**
             * Scheme definition
             */
            InfoDialog.scheme = `\
<afx-app-window  width='250' height='300' apptitle = "Info" >
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" ></div>
            <afx-vbox>
                <div data-height="10" ></div>
                <afx-grid-view data-id = "grid" ></afx-grid-view>
                <div data-height="10" ></div>
                <afx-hbox data-height="30">
                    <div ></div>
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" ></afx-button>
                </afx-hbox>
                <div data-height="10" ></div>
            </afx-vbox>
            <div data-width = "10" ></div>
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             * A simple confirm dialog
             *
             * Input data:
             *
             * ```typescript
             * {
             *      title: string, // window title
             *      icon?: string, // label icon
             *      iconclass?: string, // label iconclass
             *      text: string // label text
             * }
             * ```
             *
             * Callback data: `boolean`
             *
             * @export
             * @class YesNoDialog
             * @extends {BasicDialog}
             */
            export class YesNoDialog extends BasicDialog {
                /**
                 *Creates an instance of YesNoDialog.
                 * @memberof YesNoDialog
                 */
                constructor() {
                    super("YesNoDialog");
                }

                /**
                 * Main entry point
                 *
                 * @memberof YesNoDialog
                 */
                main(): void {
                    super.main();
                    if (this.data) {
                        (this.find("lbl") as tag.LabelTag).set(this.data);
                    }
                    (this.find("btnYes") as tag.ButtonTag).onbtclick = (
                        _e
                    ): void => {
                        if (this.handle) {
                            this.handle(true);
                        }
                        return this.quit();
                    };
                    (this.find("btnNo") as tag.ButtonTag).onbtclick = (
                        _e
                    ): void => {
                        if (this.handle) {
                            this.handle(false);
                        }
                        return this.quit();
                    };
                }
            }
            /**
             * Scheme definition
             */
            YesNoDialog.scheme = `\
<afx-app-window  width='200' height='150' apptitle = "Prompt">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" ></div>
            <afx-vbox>
                <div data-height="10" ></div>
                <afx-label data-id = "lbl" ></afx-label>
                <div data-height="10" ></div>
                <afx-hbox data-height="30">
                    <div ></div>
                    <afx-button data-id = "btnYes" text = "__(Yes)" data-width = "40" ></afx-button>
                    <afx-button data-id = "btnNo" text = "__(No)" data-width = "40" ></afx-button>
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" ></div>
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             * A selection dialog provide user with a list of options to
             * select.
             *
             * Input data:
             *
             * ```typescript
             * {
             *      title: string, // window title
             *      data:
             *      {
             *          text: string,
             *          [propName:string]: any
             *      } [] // list data
             * ```
             *
             * Callback data: the selected data in the input list
             *
             * @export
             * @class SelectionDialog
             * @extends {BasicDialog}
             */
            export class SelectionDialog extends BasicDialog {
                /**
                 *Creates an instance of SelectionDialog.
                 * @memberof SelectionDialog
                 */
                constructor() {
                    super("SelectionDialog");
                }

                /**
                 * Main entry
                 *
                 * @memberof SelectionDialog
                 */
                main(): void {
                    super.main();
                    const listview = this.find("list") as tag.ListViewTag;
                    if (this.data && this.data.data) {
                        listview.data = this.data.data;
                    }
                    const fn = (_e: TagEventType<GUI.tag.ListItemEventData>) => {
                        const data = listview.selectedItem;
                        if (!data) {
                            return this.notify(__("Please select an item"));
                        }
                        if (this.handle) {
                            this.handle(data.data);
                        }
                        return this.quit();
                    };
                    listview.onlistdbclick = fn;
                    (this.find("btnOk") as tag.ButtonTag).onbtclick = fn;

                    (this.find("btnCancel") as tag.ButtonTag).onbtclick = (
                        _e
                    ): void => {
                        return this.quit();
                    };
                }
            }
            /**
             * Scheme definition
             */
            SelectionDialog.scheme = `\
<afx-app-window  width='250' height='300' apptitle = "Selection">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" ></div>
            <afx-vbox>
                <div data-height="10" ></div>
                <afx-list-view data-id = "list" ></afx-list-view>
                <div data-height="10" ></div>
                <afx-hbox data-height="30">
                    <div ></div>
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" ></afx-button>
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" ></afx-button>
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" ></div>
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             * An About dialog is dedicated to show the parent
             * application meta-data
             *
             * Input data: no
             *
             * Callback data: no
             *
             * @export
             * @class AboutDialog
             * @extends {BasicDialog}
             */
            export class AboutDialog extends BasicDialog {
                /**
                 *Creates an instance of AboutDialog.
                 * @memberof AboutDialog
                 */
                constructor() {
                    super("AboutDialog");
                }

                /**
                 * Main entry point
                 *
                 * @returns {void}
                 * @memberof AboutDialog
                 */
                main(): void {
                    super.main();
                    const mt = this.meta();
                    (this.scheme as tag.WindowTag).apptitle = __(
                        "About: {0}",
                        mt.name
                    );
                    (this.find("mylabel") as tag.LabelTag).set({
                        icon: mt.icon,
                        iconclass: mt.iconclass,
                        text: `${mt.name}(v${mt.version})`,
                    });
                    $(this.find("mydesc")).html(mt.description);
                    // grid data for author info
                    if (!mt.info) {
                        return;
                    }
                    const rows = [];
                    for (let k in mt.info) {
                        const v = mt.info[k];
                        rows.push([{ text: k }, { text: v }]);
                    }
                    const grid = this.find("mygrid") as tag.GridViewTag;
                    grid.header = [{ text: "", width: 100 }, { text: "" }];
                    grid.rows = rows;
                    (this.find("btnCancel") as tag.ButtonTag).onbtclick = (
                        _e
                    ): void => {
                        return this.quit();
                    };
                }
            }
            /**
             * Scheme definition
             */
            AboutDialog.scheme = `\
<afx-app-window data-id = 'about-window'  width='300' height='200'>
    <afx-vbox>
        <div style="text-align:center; margin-top:10px;" data-height="50">
            <h3 style = "margin:0;padding:0;">
                <afx-label data-id = 'mylabel'></afx-label>
            </h3>
            <i><p style = "margin:0; padding:0" data-id = 'mydesc'></p></i>
        </div>
        <afx-hbox>
            <div data-width="10"></div>
            <afx-grid-view data-id = 'mygrid'></afx-grid-view>
        </afx-hbox>
        
        <afx-hbox data-height="30">
            <div ></div>
            <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "60" ></afx-button>
        </afx-hbox>
        <div data-height = "10"></div>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             * File dialog allows user to select a file/folder
             *
             * Input data:
             *
             * ```typescript
             * {
             *      title: string, // window title
             *      root?: string, // the root path folder of the file view
             *      type?: "file"|"dir"|"app", // file type to be selected
             *      mimes?: string[], // mime types of file to be selected
             *      hidden?: boolean, // show/hide hidden file
             *      file?: string // file name
             *
             * }
             * ```
             * 
             * Callback data:
             * 
             * ```typescript
             * {
             *      file: string, // selected file path
             *      name: string // user input file name
             * }
             * ```
             *
             * @export
             * @class FileDialog
             * @extends {BasicDialog}
             */
            export class FileDialog extends BasicDialog {
                /**
                 *Creates an instance of FileDialog.
                 * @memberof FileDialog
                 */
                constructor() {
                    super("FileDialog");
                }

                /**
                 * Store the last opened directory
                 *
                 * @static
                 * @type {string}
                 * @memberof FileDialog
                 */
                static last_opened: string;
                /**
                 *
                 *
                 * @returns {void}
                 * @memberof FileDialog
                 */

                main(): void {
                    super.main();
                    const fileview = this.find("fileview") as tag.FileViewTag;
                    const location = this.find("location") as tag.ListViewTag;
                    const filename = this.find("filename") as HTMLInputElement;
                    fileview.fetch = (path: string) =>
                        new Promise(function (resolve, reject) {
                            if (!path) {
                                return resolve(undefined);
                            }
                            let dir = path.asFileHandle();
                            return dir
                                .read()
                                .then(function (d) {
                                    if (d.error) {
                                        return reject(d);
                                    }
                                    FileDialog.last_opened = path;
                                    if (!dir.isRoot()) {
                                        const p = dir.parent();
                                        p.filename = "[..]";
                                        p.type = "dir";
                                        d.result.unshift(p);
                                    }
                                    return resolve(d.result);
                                })
                                .catch((e: Error): void => reject(__e(e)));
                        });
                    const setroot = async (path: string) => {
                        const d = await path.asFileHandle().read();
                        if (d.error) {
                            return this.error(
                                __("Resource not found: {0}", path)
                            );
                        }
                        return (fileview.path = path);
                    };

                    if (!this.data || !this.data.root) {
                        location.onlistselect = function (e): void {
                            if (!e || !e.data.item) {
                                return;
                            }
                            setroot(e.data.item.data.path);
                        };
                        location.data = this.systemsetting.VFS.mountpoints.filter(
                            (i) => i.type !== "app"
                        ).map(
                            (i) => {
                                if (FileDialog.last_opened)
                                    i.selected = false;
                                return i;
                            }
                        );
                        if (location.selectedItem === undefined && !FileDialog.last_opened) {
                            location.selected = 0;
                        }
                        else if (FileDialog.last_opened) {
                            setroot(FileDialog.last_opened);
                        }
                    } else {
                        $(location).hide();
                        this.trigger("resize");
                        setroot(this.data.root);
                    }
                    fileview.onfileselect = function (e) {
                        if (e.data.type === "file") {
                            return $(filename).val(e.data.filename);
                        }
                    };
                    (this.find("btnOk") as tag.ButtonTag).onbtclick = (_e) => {
                        const f = fileview.selectedFile;
                        if (!f) {
                            return this.notify(
                                __("Please select a file/fofler")
                            );
                        }
                        if (
                            this.data &&
                            this.data.type &&
                            this.data.type !== f.type
                        ) {
                            return this.notify(
                                __("Please select {0} only", this.data.type)
                            );
                        }
                        if (this.data && this.data.mimes) {
                            //verify the mime
                            let m = false;
                            if (f.mime) {
                                for (let v of this.data.mimes) {
                                    if (
                                        f.mime.match(
                                            new RegExp(v as string, "g")
                                        )
                                    ) {
                                        m = true;
                                        break;
                                    }
                                }
                            }
                            if (!m) {
                                return this.notify(
                                    __(
                                        "Only {0} could be selected",
                                        this.data.mimes.join(",")
                                    )
                                );
                            }
                        }

                        const name = $(filename).val();
                        if (this.handle) {
                            this.handle({ file: f, name });
                        }
                        return this.quit();
                    };

                    (this.find("bt-cancel") as tag.ButtonTag).onbtclick = (
                        _e
                    ) => {
                        return this.quit();
                    };

                    if (this.data && this.data.file) {
                        $(filename)
                            .css("display", "block")
                            .val(this.data.file.basename || "Untitled");
                        this.trigger("resize");
                    }
                    if (this.data && this.data.hidden) {
                        return (fileview.showhidden = this.data.hidden);
                    }
                }
            }

            FileDialog.last_opened = undefined;
            /**
             * Scheme definition
             */
            FileDialog.scheme = `\
<afx-app-window width='400' height='300'>
    <afx-hbox>
        <afx-list-view data-id = "location" dropdown = "false" data-width = "120"></afx-list-view>
        <afx-vbox>
            <afx-file-view data-id = "fileview" view="tree" status = "false"></afx-file-view>
            <input data-height = '26' type = "text" data-id = "filename" style="margin-left:5px; margin-right:5px;display:none;" ></input> 
            <afx-hbox data-height = '30'>
                <div style=' text-align:right;'>
                    <afx-button data-id = "btnOk" text = "__(Ok)"></afx-button>
                    <afx-button data-id = "bt-cancel" text = "__(Cancel)"></afx-button>
                </div>
                <div data-width="5"></div>
            </afx-hbox>
        </afx-vbox>
    </afx-hbox>
</afx-app-window>\
            `;

            /**
             * Generic & dynamic key-value dialog. The content
             * of the dialog consist of an array of label and input elements
             * which are generated based on the input model
             * 
             * The input data of the dialog should be:
             *
             * ```typescript
             * {
             *      title: string, // window title
             *      model: {
             *          [propName:string]: string
             *      },
             *      data: {
             *          [propName:string]: string
             *      },
             *      allow_empty: boolean
             * }
             * ```
             * Where:
             * - keys of `model` are data fields, each key correspond to an input element
             * - values of `model` are description texts of fields, each value correspond to a label text
             * - data is the input data object in the format of model (optional)
             * 
             * ```
             * Example:
             * {
             *      title: "Greeting",
             *      model: {
             *          name: "Your name",
             *          email: "Your email"
             *      },
             *      allow_empty: false
             * }
             *```

             * The data passing from the dialog to the callback function is
             * the user input data corresponding to the input model
             * 
             * Example of callback data for the above model:
             * 
             * ```
             * {
             *      name: "John Doe",
             *      email: "jd@mail.com"
             * }
             * ```
             *
             * @export
             * @class MultiInputDialog
             * @extends {BasicDialog}
             */
            export class MultiInputDialog extends BasicDialog {

                /**
                 * References to all the input fields in the
                 * dialog
                 *
                 * @private
                 * @type {HTMLElement[]}
                 * @memberof MultiInputDialog
                 */
                private inputs: JQuery<HTMLElement>;

                /**
                 *Creates an instance of MultiInputDialog.
                 * @memberof MultiInputDialog
                 */
                constructor() {
                    super("MultiInputDialog");
                }

                /**
                 * Generate the scheme before rendering
                 *
                 * @memberof MultiInputDialog
                 */
                init(): void {
                    let height = 60;
                    let html = "";
                    if (this.data && this.data.model) {
                        const model = this.data.model;
                        for (const key in model) {
                            html += `\
                            <afx-label data-height="25" text="{0}" ></afx-label>
                            <input data-height="25" type="text" name="{1}" ></input>
                            <div data-height="10" ></div>
                            `.format(model[key], key);
                            height += 60;
                        }
                    }
                    this.markup = MultiInputDialog.scheme.format(height, html);
                    super.init();
                }
                /**
                 * Main entry point
                 *
                 * @memberof MultiInputDialog
                 */
                main(): void {
                    super.main();
                    this.inputs = $("input", this.scheme);
                    if (this.data && this.data.data) {
                        const that = this;
                        this.inputs.each(function (_i) {
                            const input = this as HTMLInputElement;
                            input.value = that.data.data[input.name];
                        });
                    }
                    (this.find("btnCancel") as tag.ButtonTag).onbtclick = (_e) => this.quit();

                    (this.find("btnOk") as tag.ButtonTag).onbtclick = (_e) => {
                        let cdata: GenericObject<string> = {};
                        for (const el of this.inputs) {
                            let input = el as HTMLInputElement;
                            if (!this.data.allow_empty && input.value.trim() == "") {
                                return this.notify(__("All fields should be filled"));
                            }
                            cdata[input.name] = input.value.trim();
                        }
                        if (this.handle)
                            this.handle(cdata);
                        this.quit();
                    }
                }
            }
            /**
             * Scheme definition
             */
            MultiInputDialog.scheme = `\
<afx-app-window width='350' height='{0}'>
    <afx-hbox>
        <div data-width="10" ></div>
        <afx-vbox>
            <div data-height="5" ></div>
            {1}
            <afx-hbox data-height="30">
                <div ></div>
                <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" ></afx-button>
                <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" ></afx-button>
            </afx-hbox>
            <div data-height="5" ></div>
        </afx-vbox>
        <div data-width="10" ></div>
    </afx-hbox>
</afx-app-window>`;


            /**
             * Generic dynamic key-value dialog
             * 
             * Allow user to input any data key-value based object:
             * 
             * {
             *      [prop:string]: string;
             * }
             *
             * @export
             * @class KeyValueDialog
             * @extends {BasicDialog}
             */
            export class KeyValueDialog extends BasicDialog {

                /**
                 * Reference to the form container
                 *
                 * @private
                 * @type {HTMLDivElement}
                 * @memberof KeyValueDialog
                 */
                private container: HTMLDivElement;

                /**
                 * Creates an instance of KeyValueDialog.
                 * @memberof KeyValueDialog
                 */
                constructor() {
                    super("KeyValueDialog");
                }

                /**
                 * Main entry point
                 *
                 * @memberof KeyValueDialog
                 */
                main(): void {
                    super.main();
                    this.container = this.find("container") as HTMLDivElement;
                    (this.find("btnCancel") as tag.ButtonTag).onbtclick = (e) => this.quit();
                    (this.find("btnAdd") as tag.ButtonTag).onbtclick = (e) => this.addField("", "", true);
                    $(this.find("wrapper"))
                    $(this.container)
                        .css("overflow-y", "auto");
                    if (this.data && this.data.data) {
                        for (const key in this.data.data) {
                            const value = this.data.data[key];
                            this.addField(key, value, false);
                        }
                    }
                    else {
                        this.addField("key", "value", false);
                    }
                    (this.find("btnOk") as tag.ButtonTag).onbtclick = (e) => {
                        const inputs = $("input", this.scheme) as JQuery<HTMLInputElement>;
                        let cdata: GenericObject<string> = {};
                        for (let i = 0; i < inputs.length; i += 2) {
                            const key = inputs[i].value.trim();
                            if (key === "") {
                                return this.notify(__("Key cannot be empty"));
                            }
                            if (cdata[key]) {
                                return this.notify(__("Duplicate key: {0}", key));
                            }
                            cdata[key] = inputs[i + 1].value.trim();
                        }
                        if (this.handle)
                            this.handle(cdata);
                        this.quit();
                    }
                }


                /**
                 * Add new input key-value field to the dialog
                 *
                 * @private
                 * @memberof KeyValueDialog
                 */
                private addField(key: string, value: string, removable: boolean): void {
                    const div = $("<div>")
                        .css("width", "100%")
                        .css("display", "flex")
                        .css("flex-direction", "row")
                        .appendTo(this.container);
                    $("<input>")
                        .attr("type", "text")
                        .css("width", "120px")
                        .css("height", "23px")
                        .val(key)
                        .appendTo(div);
                    $("<input>")
                        .attr("type", "text")
                        .css("width", "200px")
                        .css("height", "23px")
                        .val(value)
                        .appendTo(div);
                    if (removable) {
                        const btn = $("<afx-button>");
                        btn[0].uify(undefined);
                        $("button", btn)
                            .css("width", "23px")
                            .css("height", "23px");
                        (btn[0] as tag.ButtonTag).iconclass = "fa fa-minus";
                        btn
                            .on("click", () => {
                                div.remove();
                            })
                            .appendTo(div);
                    }
                    else {
                        $("<div>")
                            .css("width", "23px")
                            .appendTo(div);
                    }

                }

            }

            /**
             * Scheme definition
             */
            KeyValueDialog.scheme = `\
             <afx-app-window width='350' height='300'>
                 <afx-hbox>
                    <div data-width="10" ></div>
                    <afx-vbox>
                        <div data-height="5" ></div>
                        <afx-label text="__(Enter key-value data)" data-height="30"></afx-label>
                        <div data-id="container"></div>
                        <afx-hbox data-height="30">
                            <afx-button data-id = "btnAdd" iconclass="fa fa-plus" data-width = "30" ></afx-button>
                            <div ></div>
                            <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" ></afx-button>
                            <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" ></afx-button>
                        </afx-hbox>
                        <div data-height="5" ></div>
                    </afx-vbox>
                    <div data-width="10" ></div>
                 </afx-hbox>
             </afx-app-window>`;
        }
    }
}
