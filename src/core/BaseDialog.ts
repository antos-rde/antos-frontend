/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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
         *
         *
         * @export
         * @abstract
         * @class SubWindow
         * @extends {BaseModel}
         */
        export abstract class SubWindow extends BaseModel {
            modal: false;
            parent: BaseModel | typeof GUI;

            /**
             *Creates an instance of SubWindow.
             * @param {string} name
             * @memberof SubWindow
             */
            constructor(name: string) {
                super(name, null);
                this.parent = undefined;
                this.modal = false;
            }

            /**
             *
             *
             * @returns {void}
             * @memberof SubWindow
             */
            quit(): void {
                const evt = new BaseEvent("exit", false);
                this.onexit(evt);
                if (!evt.prevent) {
                    delete this.observable;
                    if (this.scheme) {
                        $(this.scheme).remove();
                    }
                    if (this.dialog) {
                        return this.dialog.quit();
                    }
                }
            }

            /**
             *
             *
             * @abstract
             * @memberof SubWindow
             */
            abstract init(): void;

            /**
             *
             *
             * @abstract
             * @memberof SubWindow
             */
            abstract main(): void;

            /**
             *
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
             *
             *
             * @memberof SubWindow
             */
            show(): void {
                this.trigger("focus");
                $(this.scheme).css("z-index", GUI.zindex + 2);
            }

            /**
             *
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
         *
         *
         * @export
         * @abstract
         * @class BaseDialog
         * @extends {SubWindow}
         */
        export abstract class BaseDialog extends SubWindow {
            handle: (d: any) => void;
            data: GenericObject<any>;
            title: string;

            /**
             *Creates an instance of BaseDialog.
             * @param {string} name
             * @memberof BaseDialog
             */
            constructor(name: string) {
                super(name);
                this.handle = undefined;
            }

            /**
             *
             *
             * @param {BaseEvent} e
             * @returns {void}
             * @memberof BaseDialog
             */
            onexit(e: BaseEvent): void {
                if (this.parent) {
                    return (this.parent.dialog = undefined);
                }
            }
        }

        /**
         *
         *
         * @export
         * @class BasicDialog
         * @extends {BaseDialog}
         */
        export class BasicDialog extends BaseDialog {
            markup: string | OS.API.VFS.BaseFileHandle;
            static scheme: string;

            /**
             *Creates an instance of BasicDialog.
             * @param {string} name
             * @param {(string | OS.API.VFS.BaseFileHandle)} [markup]
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
             *
             *
             * @returns {void}
             * @memberof BasicDialog
             */
            init(): void {
                if (this.markup) {
                    if (typeof this.markup === "string") {
                        return GUI.htmlToScheme(
                            this.markup,
                            this,
                            this.host
                        );
                    } else {
                        // a file handle
                        return this.render(this.markup.path);
                    }
                } else if (
                    GUI.dialogs[this.name] &&
                    GUI.dialogs[this.name].scheme
                ) {
                    const html: string = GUI.dialogs[this.name].scheme;
                    return GUI.htmlToScheme(
                        html.trim(),
                        this,
                        this.host
                    );
                }
                else
                {
                    this.error(__("Unable to find dialog scheme"));
                }
            }

            /**
             *
             *
             * @memberof BasicDialog
             */
            main(): void {
                const win = this.scheme as tag.WindowTag;
                if (this.data && this.data.title) {
                    win.apptitle = this.data.title;
                }
                win.resizable = false;
                win.minimizable = false;
            }
        }

        export namespace dialogs {
            /**
             *
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
                 *
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

                    (this.find("btnOk") as tag.ButtonTag).onbtclick = (e) => {
                        if (this.handle) {
                            this.handle($input.val());
                        }
                        return this.quit();
                    };

                    (this.find("btnCancel") as tag.ButtonTag).onbtclick = (
                        e
                    ) => {
                        return this.quit();
                    };

                    $input.keyup((e) => {
                        if (e.which !== 13) {
                            return;
                        }
                        if (this.handle) {
                            this.handle($input.val());
                        }
                        return this.quit();
                    });

                    $input.focus();
                }
            }

            PromptDialog.scheme = `\
<afx-app-window  width='200' height='150' apptitle = "Prompt">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-label data-id = "lbl" />
                <input type = "text" data-id= "txtInput" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             *
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
                 *
                 *
                 * @memberof TextDialog
                 */
                main(): void {
                    super.main();
                    const $input = $(this.find("txtInput"));
                    if (this.data && this.data.value) {
                        $input.val(this.data.value);
                    }

                    (this.find("btnOk") as tag.ButtonTag).onbtclick = (e) => {
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
                        e
                    ): void => {
                        return this.quit();
                    };

                    $input.focus();
                }
            }

            TextDialog.scheme = `\
<afx-app-window data-id = "TextDialog" width='400' height='300'>
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <textarea data-id= "txtInput" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             *
             *
             * @export
             * @class CalendarDialog
             * @extends {BasicDialog}
             */
            export class CalendarDialog extends BasicDialog {
                /**
                 *Creates an instance of CalendarDialog.
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
                        e
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
                        e
                    ): void => {
                        return this.quit();
                    };
                }
            }

            CalendarDialog.scheme = `\
<afx-app-window  width='300' height='230' apptitle = "Calendar" >
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-calendar-view data-id = "cal" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
                <div data-height="10" />
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             *
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
                        e
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
                        e
                    ): void => {
                        return this.quit();
                    };
                }
            }

            ColorPickerDialog.scheme = `\
<afx-app-window  width='320' height='250' apptitle = "Color picker" >
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-color-picker data-id = "cpicker" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
                <div data-height="10" />
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             *
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
                        e
                    ): void => {
                        return this.quit();
                    };
                }
            }

            InfoDialog.scheme = `\
<afx-app-window  width='250' height='300' apptitle = "Info" >
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-grid-view data-id = "grid" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
                <div data-height="10" />
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            export class YesNoDialog extends BasicDialog {
                /**
                 *Creates an instance of YesNoDialog.
                 * @memberof YesNoDialog
                 */
                constructor() {
                    super("YesNoDialog");
                }

                /**
                 *
                 *
                 * @memberof YesNoDialog
                 */
                main(): void {
                    super.main();
                    if (this.data) {
                        (this.find("lbl") as tag.LabelTag).set(this.data);
                    }
                    (this.find("btnYes") as tag.ButtonTag).onbtclick = (
                        e
                    ): void => {
                        if (this.handle) {
                            this.handle(true);
                        }
                        return this.quit();
                    };
                    (this.find("btnNo") as tag.ButtonTag).onbtclick = (
                        e
                    ): void => {
                        if (this.handle) {
                            this.handle(false);
                        }
                        return this.quit();
                    };
                }
            }

            YesNoDialog.scheme = `\
<afx-app-window  width='200' height='150' apptitle = "Prompt">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-label data-id = "lbl" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnYes" text = "__(Yes)" data-width = "40" />
                    <afx-button data-id = "btnNo" text = "__(No)" data-width = "40" />
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             *
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
                 *
                 *
                 * @memberof SelectionDialog
                 */
                main(): void {
                    super.main();
                    const listview = this.find("list") as tag.ListViewTag;
                    if (this.data && this.data.data) {
                        listview.data = this.data.data;
                    }
                    const fn = (e: TagEventType) => {
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
                        e
                    ): void => {
                        return this.quit();
                    };
                }
            }

            SelectionDialog.scheme = `\
<afx-app-window  width='250' height='300' apptitle = "Selection">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-list-view data-id = "list" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             *
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
                 *
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
                        e
                    ): void => {
                        return this.quit();
                    };
                }
            }

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
            <div />
            <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "60" />
        </afx-hbox>
        <div data-height = "10"/>
    </afx-vbox>
</afx-app-window>\
            `;

            /**
             *
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
                                return resolve();
                            }
                            return path
                                .asFileHandle()
                                .read()
                                .then(function (d) {
                                    if (d.error) {
                                        return reject(d);
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
                        );
                        if (location.selectedItem === undefined) {
                            location.selected = 0;
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
                    (this.find("bt-ok") as tag.ButtonTag).onbtclick = (e) => {
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
                        e
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

            FileDialog.scheme = `\
<afx-app-window width='400' height='300'>
    <afx-hbox>
        <afx-list-view data-id = "location" dropdown = "false" data-width = "120"></afx-list-view>
        <afx-vbox>
            <afx-file-view data-id = "fileview" view="tree" status = "false"></afx-file-view>
            <input data-height = '26' type = "text" data-id = "filename" style="margin-left:5px; margin-right:5px;display:none;" /> 
            <div data-height = '30' style=' text-align:right;padding:3px;'>
                <afx-button data-id = "bt-ok" text = "__(Ok)"></afx-button>
                <afx-button data-id = "bt-cancel" text = "__(Cancel)"></afx-button>
            </div>
        </afx-vbox>
    </afx-hbox>
</afx-app-window>\
            `;
        }
    }
}
