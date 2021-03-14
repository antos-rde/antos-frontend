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
    /**
     * This namespace is dedicated to application and service definition.
     * When an application is loaded, its prototype definition will be
     * inserted to this namespace for reuse lately
     */
    export namespace application {
        /**
         * Abstract prototype of all AntOS applications.
         * Any new application definition should extend
         * this prototype
         *
         * @export
         * @abstract
         * @class BaseApplication
         * @extends {BaseModel}
         */
        export abstract class BaseApplication extends BaseModel {
            /**
             * Placeholder of all settings specific to the application.
             * The settings stored in this object will be saved to system
             * setting when logout and can be reused in the next login session
             *
             * @type {GenericObject<any>}
             * @memberof BaseApplication
             */
            setting: GenericObject<any>;

            /**
             * Hotkeys (shortcuts) defined for this application
             *
             * @protected
             * @type {GUI.ShortcutType}
             * @memberof BaseApplication
             */
            protected keycomb: GUI.ShortcutType;

            /**
             * Reference to the system dock
             *
             * @type {GUI.tag.AppDockTag}
             * @memberof BaseApplication
             */
            sysdock: GUI.tag.AppDockTag;

            /**
             * Reference to the system application menu located
             * on the system panel
             *
             * @type {GUI.tag.MenuTag}
             * @memberof BaseApplication
             */
            appmenu: GUI.tag.MenuTag;

            /**
             *Creates an instance of BaseApplication.
             * @param {string} name application name
             * @param {AppArgumentsType[]} args application arguments
             * @memberof BaseApplication
             */
            constructor(name: string, args: AppArgumentsType[]) {
                super(name, args);
                if (!setting.applications[this.name]) {
                    setting.applications[this.name] = {};
                }
                this.setting = setting.applications[this.name];
                this.keycomb = {};
                this.subscribe("appregistry", (m) => {
                    if (m.name === this.name) {
                        this.applySetting(m.data.m);
                    }
                });
            }

            /**
             * Init the application, this function is called when the
             * application process is created and docked in the application
             * dock.
             *
             * The application UI will be rendered after the execution
             * of this function.
             *
             * @returns {void}
             * @memberof BaseApplication
             */
            init(): void {
                this.off("*");
                this.on("exit", () => this.quit(false));
                // first register some base event to the app
                this.on("focus", () => {
                    this.sysdock.selectedApp = this;
                    this.appmenu.pid = this.pid;
                    this.appmenu.items = this.baseMenu() || [];
                    this.appmenu.onmenuselect = (
                        d: GUI.tag.MenuEventData
                    ): void => {
                        return this.trigger("menuselect", d);
                    };
                    if (this.dialog) {
                        return this.dialog.show();
                    }
                });
                this.on("hide", () => {
                    this.sysdock.selectedApp = null;
                    this.appmenu.items = [];
                    this.appmenu.pid = -1;
                    if (this.dialog) {
                        return this.dialog.hide();
                    }
                });
                this.on("menuselect", (d) => {
                    switch (d.data.item.data.dataid) {
                        case `${this.name}-about`:
                            return this.openDialog("AboutDialog");
                        case `${this.name}-exit`:
                            return this.trigger("exit", undefined);
                    }
                });
                this.on("apptitlechange", () => this.sysdock.update(undefined));
                this.updateLocale(this.systemsetting.system.locale);
                return this.loadScheme();
            }

            /**
             * Render the application UI by first loading its scheme
             * and then mount this scheme to the DOM tree
             *
             * @protected
             * @returns {void}
             * @memberof BaseApplication
             */
            protected loadScheme(): void {
                //now load the scheme
                const path = `${this.meta().path}/scheme.html`;
                return this.render(path);
            }

            /**
             * API function to perform an heavy task.
             * This function will trigger the global `loading`
             * event at the beginning of the task, and the `loaded`
             * event after finishing the task
             *
             * @protected
             * @param {Promise<any>} promise the promise on a task to be performed
             * @returns {Promise<void>}
             * @memberof BaseApplication
             */
            protected load(promise: Promise<any>): Promise<void> {
                const q = this._api.mid();
                return new Promise(async (resolve, reject) => {
                    this._api.loading(q, this.name);
                    try {
                        await promise;
                        this._api.loaded(q, this.name, "OK");
                        return resolve();
                    } catch (e) {
                        this._api.loaded(q, this.name, "FAIL");
                        return reject(__e(e));
                    }
                });
            }

            /**
             * Bind a hotkey to the application, this function
             * is used to define application keyboard shortcut
             *
             * @protected
             * @param {string} k the hotkey to bind, should be in the following
             * format: `[ALT|SHIFT|CTRL|META]-KEY`, e.g. `CTRL-S`
             * @param {(e: JQuery.KeyboardEventBase) => void} f the callback function
             * @returns {void}
             * @memberof BaseApplication
             */
            protected bindKey(
                k: string,
                f: (e: JQuery.KeyboardEventBase) => void
            ): void {
                const arr = k.toUpperCase().split("-");
                const c = arr.pop();
                let fnk = "";
                if (arr.includes("META")) {
                    fnk += "META";
                }
                if (arr.includes("CTRL")) {
                    fnk += "CTRL";
                }
                if (arr.includes("ALT")) {
                    fnk += "ALT";
                }
                if (arr.includes("SHIFT")) {
                    fnk += "SHIFT";
                } 

                if ( fnk == "") {
                    return;
                }
                fnk = `fn_${fnk.hash()}`;

                if (!this.keycomb[fnk]) {
                    this.keycomb[fnk] = {};
                }
                this.keycomb[fnk][c] = f;
            }

            /**
             * Update the application local from the system
             * locale or application specific locale configuration
             *
             * @private
             * @param {string} name locale name e.g. `en_GB`
             * @returns {void}
             * @memberof BaseApplication
             */
            protected updateLocale(name: string): void {
                const meta = this.meta();
                if (!meta || !meta.locales) {
                    return;
                }
                if (!meta.locales[name]) {
                    return;
                }

                const result = [];
                for (let k in meta.locales[name]) {
                    const v = meta.locales[name][k];
                    result.push((this._api.lang[k] = v));
                }
            }

            /**
             * Execute the callback subscribed to a
             * keyboard shortcut
             *
             * @param {string} fnk meta or modifier key e.g. `CTRL`, `ALT`, `SHIFT` or `META`
             * @param {string} c a regular key
             * @param {JQuery.KeyboardEventBase} e JQuery keyboard event
             * @returns {boolean} return whether the shortcut is executed
             * @memberof BaseApplication
             */
            shortcut(fnk: string, c: string, e: JQuery.KeyUpEvent): boolean {
                if (!this.keycomb[fnk]) {
                    return true;
                }
                if (!this.keycomb[fnk][c]) {
                    return true;
                }
                this.keycomb[fnk][c](e);
                return false;
            }

            /**
             * Apply a setting to the application
             *
             * @protected
             * @param {string} k the setting name
             * @memberof BaseApplication
             */
            protected applySetting(k: string): void {}

            /**
             * Apply all settings to the application
             *
             * @protected
             * @memberof BaseApplication
             */
            protected applyAllSetting(): void {
                for (let k in this.setting) {
                    const v = this.setting[k];
                    this.applySetting(k);
                }
            }

            /**
             * Set a setting value to the application setting
             * registry
             *
             * @protected
             * @param {string} k setting name
             * @param {*} v setting value
             * @returns {void}
             * @memberof BaseApplication
             */
            protected registry(k: string, v: any): void {
                this.setting[k] = v;
                return this.publish("appregistry", k);
            }

            /**
             * Show the appliation
             *
             * @returns {void}
             * @memberof BaseApplication
             */
            show(): void {
                this.trigger("focus", undefined);
            }

            /**
             * Blur the application
             *
             * @returns {void}
             * @memberof BaseApplication
             */
            blur(): void {
                if (this.appmenu && this.pid === this.appmenu.pid) {
                    this.appmenu.items = [];
                }
                return this.trigger("blur", undefined);
            }

            /**
             * Hide the application
             *
             * @returns {void}
             * @memberof BaseApplication
             */
            hide(): void {
                return this.trigger("hide", undefined);
            }

            /**
             * Maximize or restore the application window size
             * and its position
             *
             * @returns {void}
             * @memberof BaseApplication
             */
            toggle(): void {
                return this.trigger("toggle", undefined);
            }

            /**
             * Get the application title
             *
             * @returns {(string| FormattedString)}
             * @memberof BaseApplication
             */
            title(): string | FormattedString {
                return (this.scheme as GUI.tag.WindowTag).apptitle;
            }

            /**
             * Function called when the application exit.
             * If the input exit event is prevented, the application
             * process will not be killed
             *
             *
             * @protected
             * @param {BaseEvent} evt exit event
             * @memberof BaseApplication
             */
            protected onexit(evt: BaseEvent): void {
                this.cleanup(evt);
                if (!evt.prevent) {
                    if (this.pid === this.appmenu.pid) {
                        this.appmenu.items = [];
                    }
                    $(this.scheme).remove();
                }
            }

            /**
             * Get the application meta-data
             *
             * @returns {API.PackageMetaType}
             * @memberof BaseApplication
             */
            meta(): API.PackageMetaType {
                return application[this.name].meta;
            }

            /**
             * Base menu definition. This function
             * returns the based menu definition of all applications.
             * Other application specific menu entries
             * should be defined in [[menu]] function
             *
             * @protected
             * @returns {GUI.BasicItemType[]}
             * @memberof BaseApplication
             */
            protected baseMenu(): GUI.BasicItemType[] {
                let mn: GUI.BasicItemType[] = [
                    {
                        text: application[this.name].meta.name,
                        nodes: [
                            { text: "__(About)", dataid: `${this.name}-about` },
                            { text: "__(Exit)", dataid: `${this.name}-exit` },
                        ],
                    },
                ];
                mn = mn.concat(this.menu() || []);
                return mn;
            }

            /**
             * The main application entry that is called after
             * the application UI is rendered. This application
             * must be implemented by all subclasses
             *
             * @abstract
             * @memberof BaseApplication
             */
            abstract main(): void;

            /**
             * Application specific menu definition
             *
             * @protected
             * @returns {GUI.BasicItemType[]}
             * @memberof BaseApplication
             */
            protected menu(): GUI.BasicItemType[] {
                // implement by subclasses
                // to add menu to application
                return [];
            }

            /**
             * The cleanup function that is called by [[onexit]] function.
             * Application need to override this function to perform some
             * specific task before exiting or to prevent the application
             * to be exited
             *
             * @protected
             * @param {BaseEvent} e
             * @memberof BaseApplication
             */
            protected cleanup(e: BaseEvent): void {}
        }

        BaseApplication.type = ModelType.Application;
    }
}
