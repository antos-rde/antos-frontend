/*
 * decaffeinate suggestions:
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
    /**
     *
     *
     * @export
     * @interface AppArgumentsType
     */
    export interface AppArgumentsType {
        type?: string;
        path: string;
        [propName: string]: any;
    }
    /**
         *
         *
         * @export
         * @enum {number}
         */
        export enum ModelType {
            Application,
            Service,
            SubWindow
        };
    /**
     *
     *
     * @export
     * @class BaseEvent
     */
    export class BaseEvent {
        name: string;
        private force: boolean;
        prevent: boolean;

        /**
         *Creates an instance of BaseEvent.
         * @param {string} name
         * @param {boolean} force
         * @memberof BaseEvent
         */
        constructor(name: string, force: boolean) {
            this.name = name;
            this.force = force;
            this.prevent = false;
        }

        /**
         *
         *
         * @memberof BaseEvent
         */
        preventDefault(): void {
            if (!this.force) {
                this.prevent = true;
            }
        }
    }

    /**
     *
     *
     * @export
     * @abstract
     * @class BaseModel
     */
    export abstract class BaseModel {
        name: string;
        args: AppArgumentsType[];
        observable: API.Announcer;
        _api: typeof API;
        _gui: typeof GUI;
        dialog: GUI.BaseDialog;
        host: string;
        pid: number;
        scheme: HTMLElement;
        systemsetting: typeof setting;
        birth: number;
        static type: ModelType;
        static singleton: boolean;
        static dependencies: string[];
        static style: HTMLElement | string;
        static meta: API.PackageMetaType;

        /**
         *Creates an instance of BaseModel.
         * @param {string} name
         * @param {AppArgumentsType[]} args
         * @memberof BaseModel
         */
        constructor(name: string, args: AppArgumentsType[]) {
            this.name = name;
            this.args = args;
            this.observable = new API.Announcer();
            this._api = API;
            this._gui = GUI;
            this.systemsetting = setting;
            this.on("exit", () => this.quit(false));
            this.host = this._gui.workspace;
            this.dialog = undefined;
        }

        /**
         *
         *
         * @param {string} p
         * @returns {void}
         * @memberof BaseModel
         */
        render(p: string): void {
            return GUI.loadScheme(p, this, this.host);
        }

        /**
         *
         *
         * @param {boolean} force
         * @returns {void}
         * @memberof BaseModel
         */
        quit(force: boolean): void {
            const evt = new BaseEvent("exit", force);
            this.onexit(evt);
            if (!evt.prevent) {
                this.observable.off("*");
                delete this.observable;
                if (this.dialog) {
                    this.dialog.quit();
                }
                return PM.kill(this);
            }
        }

        /**
         *
         *
         * @abstract
         * @returns {API.PackageMetaType}
         * @memberof BaseModel
         */
        abstract meta(): API.PackageMetaType;

        /**
         *
         *
         * @returns {string}
         * @memberof BaseModel
         */
        path(): string {
            const mt = this.meta();
            if (mt && mt.path) {
                return mt.path;
            }
            return null;
        }

        // call a server side script
        /**
         *
         *
         * @param {GenericObject<any>} cmd
         * @returns {Promise<any>}
         * @memberof BaseModel
         */
        call(cmd: GenericObject<any>): Promise<any> {
            return this._api.apigateway(cmd, false);
        }

        // get a stream
        /**
         *
         *
         * @returns {Promise<WebSocket>}
         * @memberof BaseModel
         */
        stream(): Promise<WebSocket> {
            return this._api.apigateway(null, true) as Promise<WebSocket>;
        }

        /**
         *
         *
         * @abstract
         * @memberof BaseModel
         */
        abstract init(): void;

        /**
         *
         *
         * @abstract
         * @memberof BaseModel
         */
        abstract main(): void;

        /**
         *
         *
         * @abstract
         * @memberof BaseModel
         */
        abstract show(): void;

        /**
         *
         *
         * @abstract
         * @memberof BaseModel
         */
        abstract hide(): void;

        //implement by sub class
        /**
         *
         *
         * @abstract
         * @param {BaseEvent} e
         * @memberof BaseModel
         */
        abstract onexit(e: BaseEvent): void;
        //implement by subclass

        /**
         *
         *
         * @param {string} e
         * @param {(d: any) => void} f
         * @returns {void}
         * @memberof BaseModel
         */
        one(e: string, f: (d: any) => void): void {
            return this.observable.one(e, f);
        }

        /**
         *
         *
         * @param {string} e
         * @param {(d: any) => void} f
         * @returns {void}
         * @memberof BaseModel
         */
        on(e: string, f: (d: any) => void): void {
            return this.observable.on(e, f);
        }

        /**
         *
         *
         * @param {string} e
         * @param {(d: any) => void} [f]
         * @returns {void}
         * @memberof BaseModel
         */
        off(e: string, f?: (d: any) => void): void {
            if (!f) {
                return this.observable.off(e);
            }
            return this.observable.off(e, f);
        }

        /**
         *
         *
         * @param {string} e
         * @param {*} [d]
         * @returns {void}
         * @memberof BaseModel
         */
        trigger(e: string, d?: any): void {
            return this.observable.trigger(e, d);
        }

        /**
         *
         *
         * @param {string} e
         * @param {(d: any) => void} f
         * @returns {void}
         * @memberof BaseModel
         */
        subscribe(e: string, f: (d: any) => void): void {
            return announcer.on(e, f, this);
        }

        /**
         *
         *
         * @param {(BaseDialog | string)} d
         * @param {GenericObject<any>} [data]
         * @returns {Promise<any>}
         * @memberof BaseModel
         */
        openDialog(
            d: GUI.BaseDialog | string,
            data?: GenericObject<any>
        ): Promise<any> {
            return new Promise((resolve, reject) => {
                if (this.dialog) {
                    this.dialog.show();
                    return;
                }
                if (typeof d === "string") {
                    if (!GUI.dialogs[d]) {
                        this.error(__("Dialog {0} not found", d));
                        return;
                    }
                    this.dialog = new OS.GUI.dialogs[d as string]();
                } else {
                    this.dialog = d;
                }
                //@dialog.observable = riot.observable() unless @dialog
                this.dialog.parent = this;
                this.dialog.handle = resolve;
                this.dialog.pid = this.pid;
                this.dialog.data = data;
                if (data && data.title) {
                    this.dialog.title = data.title;
                }
                return this.dialog.init();
            });
        }

        /**
         *
         *
         * @param {GenericObject<any>} data
         * @returns {Promise<any>}
         * @memberof BaseModel
         */
        ask(data: GenericObject<any>): Promise<any> {
            return this._gui.openDialog("YesNoDialog", data);
        }

        /**
         *
         *
         * @param {string} t
         * @param {(string | FormatedString)} m
         * @param {Error} [e]
         * @returns {void}
         * @memberof BaseModel
         */
        publish(t: string, m: string | FormatedString, e?: Error): void {
            const mt = this.meta();
            let icon: string = undefined;
            if (mt.icon) {
                icon = `${mt.path}/${mt.icon}`;
            }
            return announcer.trigger(t, {
                id: this.pid,
                name: this.name,
                data: {
                    m: m,
                    icon: icon,
                    iconclass: mt.iconclass,
                    e: e,
                },
            });
        }

        /**
         *
         *
         * @param {(string | FormatedString)} m
         * @returns {void}
         * @memberof BaseModel
         */
        notify(m: string | FormatedString): void {
            return this.publish("notification", m);
        }

        /**
         *
         *
         * @param {(string | FormatedString)} m
         * @returns {void}
         * @memberof BaseModel
         */
        warn(m: string | FormatedString): void {
            return this.publish("warning", m);
        }

        /**
         *
         *
         * @param {(string | FormatedString)} m
         * @param {Error} [e]
         * @returns
         * @memberof BaseModel
         */
        error(m: string | FormatedString, e?: Error) {
            return this.publish("error", m, e ? e : this._api.throwe(m));
        }

        /**
         *
         *
         * @param {string} m
         * @param {Error} [e]
         * @returns
         * @memberof BaseModel
         */
        fail(m: string, e?: Error) {
            return this.publish("fail", m, e ? e : this._api.throwe(m));
        }

        /**
         *
         *
         * @returns {Error}
         * @memberof BaseModel
         */
        throwe(): Error {
            return this._api.throwe(this.name);
        }

        /**
         *
         *
         * @returns {void}
         * @memberof BaseModel
         */
        update(): void {
            if (this.scheme) {
                return this.scheme.update();
            }
        }

        /**
         *
         *
         * @param {string} id
         * @returns {HTMLElement}
         * @memberof BaseModel
         */
        find(id: string): HTMLElement {
            if (this.scheme) {
                return $(`[data-id='${id}']`, this.scheme)[0];
            }
        }

        /**
         *
         *
         * @param {string} sel
         * @returns {HTMLElement}
         * @memberof BaseModel
         */
        select(sel: string): HTMLElement {
            if (this.scheme) {
                return $(sel, this.scheme)[0];
            }
        }
    }
}
