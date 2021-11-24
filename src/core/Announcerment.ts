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
        * Data type exchanged via
        * the global Announcement interface
        *
        * @export
        * @interface AnnouncementDataType
        */
        export interface AnnouncementDataType {

            /**
             *  message string
             *
             * @type {string| FormattedString}
             * @memberof AppAnnouncementDataType
             */
            message: string | FormattedString;

            /**
             * Process ID
             *
             * @type {number}
             * @memberof AppAnnouncementDataType
             */
            id: number;

            /**
             * App name
             *
             * @type {string | FormattedString}
             * @memberof AppAnnouncementDataType
             */
            name: string | FormattedString;

            /**
             * Icon file
             *
             * @type {string}
             * @memberof AppAnnouncementDataType
             */
            icon?: string;


            /**
             * App icon class
             *
             * @type {string}
             * @memberof AppAnnouncementDataType
             */
            iconclass?: string;
            /**
             * User specific data
             *
             * @type {*}
             * @memberof AppAnnouncementDataType
             */
            u_data?: any;
        }
        /**
         * Observable entry type definition
         *
         * @export
         * @interface ObservableEntryType
         */
        export interface ObservableEntryType {
            /**
             * A Set of callbacks that should be called only once.
             * These callbacks will be removed after the first
             * occurrence of the corresponding event
             *
             * @memberof ObservableEntryType
             */
            one: Set<(d: any) => void>;

            /**
             * A Set of callbacks that should be called
             * every time the corresponding event is triggered
             *
             * @memberof ObservableEntryType
             */
            many: Set<(d: any) => void>;
        }

        /**
         * Announcement listener type definition
         *
         * @export
         * @interface AnnouncerListenerType
         */
        export interface AnnouncerListenerType {
            [index: number]: {
                /**
                 * The event name
                 *
                 * @type {string}
                 */
                e: string;

                /**
                 * The event callback
                 *
                 */
                f: (d: any) => void;
            }[];
        }

        /**
         * This class is the based class used in AntOS event
         * announcement system.
         * It implements the observer pattern using simple
         * subscribe/publish mechanism
         * @export
         * @class Announcer
         */
        export class Announcer {
            /**
             * The observable object that stores event name
             * and its corresponding callback in [[ObservableEntryType]]
             *
             * @type {GenericObject<ObservableEntryType>}
             * @memberof Announcer
             */
            observable: GenericObject<ObservableEntryType>;

            /**
             * Enable/disable the announcer
             *
             * @type {boolean}
             * @memberof Announcer
             */
            enable: boolean;

            /**
             *Creates an instance of Announcer.
             * @memberof Announcer
             */
            constructor() {
                this.observable = {};
                this.enable = true;
            }

            /**
             * Disable the announcer, when this function is called
             * all events and their callbacks will be removed
             *
             * @returns
             * @memberof Announcer
             */
            disable() {
                this.off("*");
                return (this.enable = false);
            }

            /**
             * Subscribe to an event, the callback will be called
             * every time the corresponding event is trigged
             *
             * @param {string} evtName event name
             * @param {(d: any) => void} callback The corresponding callback
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
             * Subscribe to an event, the callback will
             * be called only once and then removed from the announcer
             *
             * @param {string} evtName event name
             * @param {(d: any) => void} callback the corresponding callback
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
             * Unsubscribe the callback from an event
             *
             * @param {string} evtName event name
             * @param {(d: any) => void} [callback] the callback to be unsubscribed.
             * When the `callback` is `*`, all callbacks related to `evtName` will be
             * removed
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
             * Trigger an event
             *
             * @param {string} evtName event name
             * @param {*} data data object that will be send to all related callback
             * @returns {void}
             * @memberof Announcer
             */
            trigger(evtName: string, data: any): void {
                const trig = (name: string, d: any) => {
                    const names = [name, "*"];
                    for (let evt of names) {
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
    /**
     * This namespace defines every thing related to the system announcement.
     *
     * The system announcement provides a global way to communicate between
     * processes (applications/services) using the subscribe/publish
     * mechanism
     */
    export namespace announcer {
        /**
         * The global announcer object that manages global events
         * and callbacks
         */
        export var observable: API.Announcer = new API.Announcer();
        /**
         * This variable is used to allocate the `id` of all messages
         * passing between publishers and subscribers in the
         * system announcement
         */
        export var quota: 0;
        /**
         * Placeholder of all global events listeners
         */
        export var listeners: API.AnnouncerListenerType = {};

        /**
         * Subscribe to a global event
         *
         * @export
         * @param {string} e event name
         * @param {(d: API.AnnouncementDataType) => void} f event callback
         * @param {GUI.BaseModel} a the process  (Application/service) related to the callback
         */
        export function on(e: string, f: (d: API.AnnouncementDataType) => void, a: BaseModel): void {
            if (!announcer.listeners[a.pid]) {
                announcer.listeners[a.pid] = [];
            }
            announcer.listeners[a.pid].push({ e, f });
            announcer.observable.on(e, f);
        }

        /**
         * Trigger a global event
         *
         * @export
         * @param {string} e event name
         * @param {*} d data passing to all related callback
         */
        export function trigger(e: string, d: any): void {
            announcer.observable.trigger(e, d);
        }

        /**
         * Report system fail. This will trigger the global `fail`
         * event
         *
         * @export
         * @param {(string | FormattedString)} m message string
         * @param {Error} e error to be reported
         */
        export function osfail(m: string | FormattedString, e: Error): void {
            announcer.ostrigger("fail", m, e );
        }

        /**
         * Report system error. This will trigger the global `error`
         * event
         *
         * @export
         * @param {(string | FormattedString)} m message string
         * @param {Error} e error to be reported
         */
        export function oserror(m: string | FormattedString, e: Error): void {
            announcer.ostrigger("error",  m, e );
        }

        /**
         * Trigger system notification (`info` event)
         *
         * @export
         * @param {(string | FormattedString)} m notification message
         */
        export function osinfo(m: string | FormattedString): void {
            announcer.ostrigger("info", m);
        }

        /**
         *
         *
         * @export
         * @param {string} e event name
         * @param {(string| FormattedString)} m event message
         * @param {*} [d] user data
         */
        export function ostrigger(e: string, m: string| FormattedString, d?: any): void {
            const aob: API.AnnouncementDataType = {} as API.AnnouncementDataType;
            aob.id = 0;
            aob.message = m;
            aob.u_data = d;
            aob.name = "OS";
            announcer.trigger(e, aob);
        }

        /**
         * Unregister a process (application/service) from
         * the global announcement system
         *
         * @export
         * @param {GUI.BaseModel} app reference to the process
         * @returns {void}
         */
        export function unregister(app: BaseModel): void {
            if (
                !announcer.listeners[app.pid] ||
                !(announcer.listeners[app.pid].length > 0)
            ) {
                return;
            }
            for (let i of announcer.listeners[app.pid]) {
                announcer.observable.off(i.e, i.f);
            }
            delete announcer.listeners[app.pid];
        }

        /**
         * Allocate message id
         *
         * @export
         * @returns {number}
         */
        export function getMID(): number {
            quota += 1;
            return quota;
        }
    }
}
