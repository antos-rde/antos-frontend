/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
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
    export namespace application {
        /**
         *
         *
         * @export
         * @abstract
         * @class BaseApplication
         * @extends {BaseModel}
         */
        export abstract class BaseApplication extends BaseModel {
            setting: GenericObject<any>;
            protected keycomb: GUI.ShortcutType;
            sysdock: GUI.tag.AppDockTag;
            appmenu: GUI.tag.MenuTag;

            /**
             *Creates an instance of BaseApplication.
             * @param {string} name
             * @param {AppArgumentsType[]} args
             * @memberof BaseApplication
             */
            constructor(name: string, args: AppArgumentsType[]) {
                super(name, args);
                if (!setting.applications[this.name]) {
                    setting.applications[this.name] = {};
                }
                this.setting = setting.applications[this.name];
                this.keycomb = {
                    ALT: {},
                    CTRL: {},
                    SHIFT: {},
                    META: {},
                };
                this.subscribe("appregistry", (m) => {
                    if (m.name === this.name) {
                        this.applySetting(m.data.m);
                    }
                });
                
            }

            /**
             *
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
                    this.appmenu.items= this.baseMenu() || [];
                    this.appmenu.onmenuselect=(d: GUI.tag.MenuEventData): void => {
                            return this.trigger("menuselect", d);
                        }
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
             *
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
             *
             *
             * @protected
             * @param {Promise<any>} promise
             * @returns {Promise<any>}
             * @memberof BaseApplication
             */
            protected load(promise: Promise<any>): Promise<any> {
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
             *
             *
             * @protected
             * @param {string} k
             * @param {(e: JQuery.MouseDownEvent) => void} f
             * @returns {void}
             * @memberof BaseApplication
             */
            protected bindKey(k: string, f: (e: JQuery.MouseDownEvent) => void): void {
                const arr = k.split("-");
                if (arr.length !== 2) {
                    return;
                }
                const fnk = arr[0].toUpperCase();
                const c = arr[1].toUpperCase();
                if (!this.keycomb[fnk]) {
                    return;
                }
                this.keycomb[fnk][c] = f;
            }

            
            /**
             *
             *
             * @private
             * @param {string} name
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
             *
             *
             * @param {string} fnk
             * @param {string} c
             * @param {JQuery.MouseDownEvent} e
             * @returns {boolean}
             * @memberof BaseApplication
             */
            shortcut(
                fnk: string,
                c: string,
                e: JQuery.KeyDownEvent
            ): boolean {
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
             *
             *
             * @protected
             * @param {string} k
             * @memberof BaseApplication
             */
            protected applySetting(k: string): void {}

            
            /**
             *
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
             *
             *
             * @protected
             * @param {string} k
             * @param {*} v
             * @returns {void}
             * @memberof BaseApplication
             */
            protected registry(k: string, v: any): void {
                this.setting[k] = v;
                return this.publish("appregistry", k);
            }

            /**
             *
             *
             * @returns {void}
             * @memberof BaseApplication
             */
            show(): void {
                return this.trigger("focus", undefined);
            }

            /**
             *
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
             *
             *
             * @returns {void}
             * @memberof BaseApplication
             */
            hide(): void {
                return this.trigger("hide", undefined);
            }

            /**
             *
             *
             * @returns {void}
             * @memberof BaseApplication
             */
            toggle(): void {
                return this.trigger("toggle", undefined);
            }

            /**
             *
             *
             * @returns {(string| FormatedString)}
             * @memberof BaseApplication
             */
            title(): string| FormatedString {
                return (this.scheme as GUI.tag.WindowTag).apptitle;
            }

            
            /**
             *
             *
             * @protected
             * @param {BaseEvent} evt
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
             *
             *
             * @returns {API.PackageMetaType}
             * @memberof BaseApplication
             */
            meta(): API.PackageMetaType {
                return application[this.name].meta;
            }

            
            /**
             *
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
             *
             *
             * @abstract
             * @memberof BaseApplication
             */
            abstract main(): void;
            //main program
            // implement by subclasses

            
            /**
             *
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
             *
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
