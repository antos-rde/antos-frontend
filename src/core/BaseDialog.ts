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
        declare var showdown: any;
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
             * Purge the model from the system
             *
             * @protected
             * @memberof BaseModel
             */
            protected destroy(): void
            {
                if (this.scheme) {
                    $(this.scheme).remove();
                }
            }

            /**
             * Init the sub-window, this function is called
             * on creation of the sub-window object. It is used
             * to render the sub-window UI.
             *
             * Need to be implemented by subclasses
             *
             * 
             * @returns {void}
             * @memberof BaseDialog
             */
            init(): void {
                // show the app if it is not active
                this.on("focus",() => {
                    if((this.pid == -1) || (PM.pidactive == this.pid))
                    {
                        return;
                    }
                    
                    const app = PM.appByPid(this.pid);
                    if(app)
                    {
                        app.show();
                    }
                });
                
            }

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
                this.trigger("focus", undefined);
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
                this.trigger("hide", undefined);
                if (this.dialog) {
                    this.dialog.hide();
                }
            }

            /**
             * blur the sub-window
             *
             * @returns {void}
             * @memberof SubWindow
             */
            blur(): void {
                this.trigger("blur", undefined);
                if (this.dialog) {
                    this.dialog.blur();
                }
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

             /**
             * Show the dialog
             *
             * @memberof BaseDialog
             */
            show(): void {
                this.trigger("focus", undefined);
                this.trigger("focused", undefined);
                if (this.dialog) {
                    this.dialog.show();
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
            ['constructor']: typeof BasicDialog
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
             * the {@link init} function will find the scheme definition
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
                super.init();
                //this._onenter = undefined;
                if (this.markup) {
                    if (typeof this.markup === "string") {
                        return GUI.htmlToScheme(this.markup, this, this.host);
                    } else {
                        // a file handle
                        this.render(this.markup.path);
                    }
                } else if (
                    this.constructor.scheme
                ) {
                    const html: string = this.constructor.scheme;
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
                win.menu = undefined;
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
                    const input = this.find("txtInput") as GUI.tag.InputTag;
                    if(this.data)
                    {
                        input.set(this.data);
                    }

                    (this.find("btnOk") as tag.ButtonTag).onbtclick = (_e) => {
                        if (this.handle) {
                            this.handle(input.value);
                        }
                        return this.quit();
                    };

                    (this.find("btnCancel") as tag.ButtonTag).onbtclick = (
                        _e
                    ) => {
                        return this.quit();
                    };

                    input.on("keyup", (e) => {
                        if (e.which !== 13) {
                            return;
                        }
                        if (this.handle) {
                            this.handle(input.value);
                        }
                        return this.quit();
                    });

                    input.trigger("focus");
                }
            }
            /**
             * Scheme definition of the Prompt dialog
             */
            PromptDialog.scheme = `\
<afx-app-window  width='250' height='200' apptitle = "Prompt">
    <afx-vbox padding = "10">
        <afx-input data-id= "txtInput"></afx-input>
        <div data-height="35" style="text-align: right;">
            <afx-button data-id = "btnOk" text = "__(Ok)"></afx-button>
            <afx-button data-id = "btnCancel" text = "__(Cancel)"></afx-button>
        </div>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             * A text dialog is similar to a {@link PromptDialog} nut allows
             * user to input multi-line text.
             *
             * Refer to {@link PromptDialog} for the definition of input and callback data
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
                    const input = this.find("txtInput") as tag.InputTag;
                    if(this.data)
                        input.set(this.data);
                    (this.find("btn-Ok") as tag.ButtonTag).onbtclick = (_e) => {
                        const value = input.value;
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

                    input.trigger("focus");
                }
            }
            /**
             * Scheme definition
             */
            TextDialog.scheme = `\
<afx-app-window data-id = "TextDialog" width='400' height='300'>
    <afx-vbox padding="10">
        <afx-input data-id= "txtInput" verbose="true"></afx-input>
        <div data-height="40" style="text-align:right;padding-top:5px;">
            <afx-button data-id = "btn-Ok" text = "__(Ok)" ></afx-button>
            <afx-button data-id = "btnCancel" text = "__(Cancel)" ></afx-button>
        </div>
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
<afx-app-window  width='350' height='380' apptitle = "Calendar" >
    <afx-vbox padding="10">
        <afx-calendar-view data-id = "cal" ></afx-calendar-view>
        <div data-height="35" style = 'text-align: right;'>
            <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" ></afx-button>
            <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" ></afx-button>
        </div>
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
             * Callback data: {@link ColorType} object
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
<afx-app-window  width='320' height='300' apptitle = "Color picker" >
    <afx-vbox padding = "10">
        <afx-color-picker data-id = "cpicker" ></afx-color-picker>
        <div data-height="35" style = "text-align: right;">
            <afx-button data-id = "btnOk" text = "__(Ok)"  ></afx-button>
            <afx-button data-id = "btnCancel" text = "__(Cancel)" ></afx-button>
        </div>
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
                        rows.push([{ text: k }, { text: v, selectable: true }]);
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
<afx-app-window  width='300' height='350' apptitle = "Info" >
    <afx-vbox padding = "10">
        <afx-grid-view data-id = "grid" focusable="true"></afx-grid-view>
        <div data-height="35" style="text-align: right;">
            <afx-button data-id = "btnCancel" text = "__(Cancel)"></afx-button>
        </div>
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
<afx-app-window  width='250' height='200' apptitle = "Warning">
    <afx-vbox padding = "10">
        <afx-label data-id = "lbl" valign="top" ></afx-label>
        <div data-height="35" style = "text-align: right;">
            <afx-button data-id = "btnYes" text = "__(Yes)" ></afx-button>
            <afx-button data-id = "btnNo" text = "__(No)"></afx-button>
        </div>
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
<afx-app-window  width='350' height='300' apptitle = "Selection">
    <afx-vbox padding = "10">
        <afx-list-view data-id = "list" focusable="true"></afx-list-view>
        <div data-height="35" style = "text-align: right;">
            <afx-button data-id = "btnOk" text = "__(Ok)" ></afx-button>
            <afx-button data-id = "btnCancel" text = "__(Cancel)"></afx-button>
        </div>
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
                    $(this.find("mydesc")).html(`${mt.description} <br/> ${mt.info.author} (${mt.info.email})`);
                    // grid data for author info
                    if (!mt.info) {
                        return;
                    }
                    `pkg://${mt.pkgname?mt.pkgname:mt.app}/README.md`
                        .asFileHandle()
                        .read()
                        .then(async (data) => {
                            let _ = await API.requires("os://scripts/showdown.min.js");
                            const converter = new showdown.Converter();
                            const html = converter.makeHtml(data);
                            const el = this.find("read-me");
                            $(el).html(html);
                            $("img", el).css("width", "100%");
                        })
                        .catch(e => {});
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
<afx-app-window data-id = 'about-window'  width='550' height='450'>
    <afx-vbox padding = "5">
        <div style="text-align:center; margin-top:10px;" data-height="50">
            <h3 style = "margin:0;padding:0;">
                <afx-label data-id = 'mylabel' style="display: inline-block;"></afx-label>
            </h3>
            <i><p style = "margin:0; padding:0" data-id = 'mydesc'></p></i>
        </div>
        <div data-id="read-me" style="overflow-x: hidden; overflow-y: auto;"></div>
        <div data-height="10"></div>
        <div data-height="35" style = "text-align: right;">
            <afx-button data-id = "btnCancel" text = "__(Cancel)" ></afx-button>
        </div>
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
                    const filename = this.find("filename") as tag.InputTag;
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
                        fileview.path = path;
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
                            return filename.value = e.data.filename;
                        }
                    };
                    (this.find("btnOk") as tag.ButtonTag).onbtclick = (_e) => {
                        let f = fileview.selectedFile;
                        if (!f) {
                            const sel = location.selectedItem;
                            if(!sel)
                                return this.notify(
                                    __("Please select a file/fofler")
                                );
                            f = sel.data as API.FileInfoType;
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

                        const name = filename.value;
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
                        $(filename).show();
                        filename.value = (this.data.file.basename || "Untitled");
                        this.trigger("resize");
                    }
                    else
                    {
                        $(filename).hide();
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
<afx-app-window width='400' height='450'>
    <afx-vbox>
        <afx-list-view data-id = "location" dropdown = "true" data-height = "35"></afx-list-view>
        <afx-file-view data-id = "fileview" view="tree" status = "false"></afx-file-view>
        <afx-input data-height = '52' label = "__(Target file/folder)" type = "text" data-id = "filename" ></afx-input> 
        <div style=' text-align:right;' data-height="35">
            <afx-button data-id = "btnOk" text = "__(Ok)"></afx-button>
            <afx-button data-id = "bt-cancel" text = "__(Cancel)"></afx-button>
        </div>
    </afx-vbox>
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
                    let height = 85;
                    let html = "";
                    if (this.data && this.data.model) {
                        const model = this.data.model;
                        for (const key in model) {
                            html += `\
                            <afx-input data-height="52" text="{0}" type="text" name = {1} ></afx-input>
                            `.format(model[key], key);
                            height += 52;
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
    <afx-vbox padding = "5">
        {1}
        <div data-height="35" style = "text-align: right;">
            <afx-button data-id = "btnOk" text = "__(Ok)"></afx-button>
            <afx-button data-id = "btnCancel" text = "__(Cancel)"></afx-button>
        </div>
    </afx-vbox>
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
                        .css("display", "flex")
                        .css("flex-direction", "row")
                        .appendTo(this.container);
                    $("<input>")
                        .attr("type", "text")
                        .css("flex", "1")
                        .val(key)
                        .appendTo(div);
                    $("<input>")
                        .attr("type", "text")
                        .css("flex", "1")
                        .val(value)
                        .appendTo(div);
                    if (removable) {
                        const btn = $("<afx-button>");
                        btn[0].uify(undefined);
                        (btn[0] as tag.ButtonTag).iconclass = "fa fa-minus";
                        btn
                            .on("click", () => {
                                div.remove();
                            })
                            .appendTo(div);
                    }
                    else
                    {
                        $("<div>")
                        .css("width", "40px")
                        .css("height", "35px")
                        .appendTo(div);
                    }
                }

            }

            /**
             * Scheme definition
             */
            KeyValueDialog.scheme = `\
             <afx-app-window width='400' height='350'>
                    <afx-vbox padding = "10">
                        <afx-label text="__(Enter key-value data)" data-height="30"></afx-label>
                        <div data-id="container"></div>
                        <afx-hbox data-height="35">
                            <afx-button data-id = "btnAdd" iconclass="fa fa-plus" data-width = "35" ></afx-button>
                            <div style = "text-align: right;">
                                <afx-button data-id = "btnOk" text = "__(Ok)"></afx-button>
                                <afx-button data-id = "btnCancel" text = "__(Cancel)"></afx-button>
                            </div>
                        </afx-hbox>
                    </afx-vbox>
             </afx-app-window>`;
        }
    }
}
