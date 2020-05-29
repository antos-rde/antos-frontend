/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
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
    export namespace API {
        /**
         *
         *
         * @export
         * @interface ObservableEntryType
         */
        export interface ObservableEntryType {
            one: Set<(d: any) => void>;
            many: Set<(d: any) => void>;
        }

        /**
         *
         *
         * @export
         * @interface AnnouncerListenerType
         */
        export interface AnnouncerListenerType {
            [index: number]: {
                e: string;
                f: (d: any) => void;
            }[];
        }

        /**
         *
         *
         * @export
         * @class Announcer
         */
        export class Announcer {
            observable: GenericObject<ObservableEntryType>;
            enable: boolean;
            constructor() {
                this.observable = {};
                this.enable = true;
            }

            /**
             *
             *
             * @returns
             * @memberof Announcer
             */
            disable() {
                this.off("*");
                return (this.enable = false);
            }

            /**
             *
             *
             * @param {string} evtName
             * @param {(d: any) => void} callback
             * @returns {void}
             * @memberof Announcer
             */
            on(evtName: string, callback: (d: any) => void): void {
                if (!this.enable) {
                    return;
                }
                if (!this.observable[evtName]) {
                    this.observable[evtName] = {
                        one: new Set(),
                        many: new Set(),
                    };
                }
                this.observable[evtName].many.add(callback);
            }

            /**
             *
             *
             * @param {string} evtName
             * @param {(d: any) => void} callback
             * @returns {void}
             * @memberof Announcer
             */
            one(evtName: string, callback: (d: any) => void): void {
                if (!this.enable) {
                    return;
                }
                if (!this.observable[evtName]) {
                    this.observable[evtName] = {
                        one: new Set(),
                        many: new Set(),
                    };
                }
                this.observable[evtName].one.add(callback);
            }

            /**
             *
             *
             * @param {string} evtName
             * @param {(d: any) => void} [callback]
             * @memberof Announcer
             */
            off(evtName: string, callback?: (d: any) => void): void {
                const fn = (evt: string, cb: (d: any) => void) => {
                    if (!this.observable[evt]) {
                        return;
                    }
                    if (cb) {
                        this.observable[evt].one.delete(cb);
                        return this.observable[evt].many.delete(cb);
                    } else {
                        if (this.observable[evt]) {
                            return delete this.observable[evt];
                        }
                    }
                };
                if (evtName === "*") {
                    for (let k in this.observable) {
                        fn(k, callback);
                    }
                } else {
                    fn(evtName, callback);
                }
            }

            /**
             *
             *
             * @param {string} evtName
             * @param {*} data
             * @returns {void}
             * @memberof Announcer
             */
            trigger(evtName: string, data: any): void {
                const trig = (name: string, d: any) => {
                    const names = [name, "*"];
                    for (let evt of Array.from(names)) {
                        if (!this.observable[evt]) {
                            continue;
                        }
                        this.observable[evt].one.forEach((f) => f(d));
                        this.observable[evt].one = new Set();
                        this.observable[evt].many.forEach((f) => f(d));
                    }
                };
                if (evtName === "*") {
                    for (let k in this.observable) {
                        const v = this.observable[k];
                        if (k !== "*") {
                            trig(k, data);
                        }
                    }
                } else {
                    return trig(evtName, data);
                }
            }
        }
    }
    export namespace announcer {
        export var observable: API.Announcer = new API.Announcer();
        export var quota: 0;
        export var listeners: API.AnnouncerListenerType = {};

        /**
         *
         *
         * @export
         * @param {string} e
         * @param {(d: any) => void} f
         * @param {GUI.BaseModel} a
         */
        export function on(
            e: string,
            f: (d: any) => void,
            a: BaseModel
        ): void {
            if (!announcer.listeners[a.pid]) {
                announcer.listeners[a.pid] = [];
            }
            announcer.listeners[a.pid].push({ e, f });
            announcer.observable.on(e, f);
        }

        /**
         *
         *
         * @export
         * @param {string} e
         * @param {*} d
         */
        export function trigger(e: string, d: any): void {
            announcer.observable.trigger(e, d);
        }

        /**
         *
         *
         * @export
         * @param {(string | FormatedString)} m
         * @param {Error} e
         */
        export function osfail(m: string | FormatedString, e: Error): void {
            announcer.ostrigger("fail", { m, e });
        }

        /**
         *
         *
         * @export
         * @param {(string | FormatedString)} m
         * @param {Error} e
         */
        export function oserror(m: string | FormatedString, e: Error): void {
            announcer.ostrigger("error", { m, e });
        }

        /**
         *
         *
         * @export
         * @param {(string | FormatedString)} m
         */
        export function osinfo(m: string | FormatedString): void {
            announcer.ostrigger("info", { m, e: null });
        }

        /**
         *
         *
         * @export
         * @param {string} e
         * @param {*} d
         */
        export function ostrigger(e: string, d: any): void {
            announcer.trigger(e, { id: 0, data: d, name: "OS" });
        }

        /**
         *
         *
         * @export
         * @param {GUI.BaseModel} app
         * @returns {void}
         */
        export function unregister(app: BaseModel): void {
            if (
                !announcer.listeners[app.pid] ||
                !(announcer.listeners[app.pid].length > 0)
            ) {
                return;
            }
            for (let i of Array.from(announcer.listeners[app.pid])) {
                announcer.observable.off(i.e, i.f);
            }
            delete announcer.listeners[app.pid];
        }

        /**
         *
         *
         * @export
         * @returns {number}
         */
        export function getMID(): number {
            announcer.quota += 1;
            return announcer.quota;
        }
    }
}
