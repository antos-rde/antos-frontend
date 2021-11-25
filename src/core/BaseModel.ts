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
     * Application argument type definition
     *
     * @export
     * @interface AppArgumentsType
     */
    export interface AppArgumentsType {
        /**
         * File type to be open by the app
         *
         * @type {string}
         * @memberof AppArgumentsType
         */
        type?: string;

        /**
         * File path to be opened
         *
         * @type {string}
         * @memberof AppArgumentsType
         */
        path: string;
        /**
         * Any other object
         */
        [propName: string]: any;
    }

    /**
     * Enum definition of different model types
     *
     * @export
     * @enum {number}
     */
    export enum ModelType {
        /**
         * Applications
         */
        Application,

        /**
         * Services
         */
        Service,

        /**
         * Sub-window such as dialogs
         */
        SubWindow,
    }
    /**
     * Base AntOS event definition
     *
     * @export
     * @class BaseEvent
     */
    export class BaseEvent {
        /**
         * The event name placeholder
         *
         * @type {string}
         * @memberof BaseEvent
         */
        name: string;

        /**
         * Placeholder indicates whether the event is forced to
         * be happen
         *
         * @private
         * @type {boolean}
         * @memberof BaseEvent
         */
        private force: boolean;

        /**
         * Placeholder indicates whether the event is prevented.
         * This value has not effect if `force` is set to `true`
         *
         * @type {boolean}
         * @memberof BaseEvent
         */
        prevent: boolean;

        /**
         *Creates an instance of BaseEvent.
         * @param {string} name event name
         * @param {boolean} force indicates whether the event is forced
         * @memberof BaseEvent
         */
        constructor(name: string, force: boolean) {
            this.name = name;
            this.force = force;
            this.prevent = false;
        }

        /**
         * Prevent the current event. This function
         * has no effect if `force` is set to true
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
     * The root model of all applications, dialogs or services
     * in the system
     *
     * @export
     * @abstract
     * @class BaseModel
     */
    export abstract class BaseModel {
        /**
         * The class name
         *
         * @type {string}
         * @memberof BaseModel
         */
        name: string;

        /**
         * The argument of the model
         *
         * @type {AppArgumentsType[]}
         * @memberof BaseModel
         */
        args: AppArgumentsType[];

        /**
         * Each model has its own local announcement system
         * to handle all local events inside that model.
         *
         * This observable object is propagate to all the
         * UI elements ([[AFXTag]]) inside the model
         *
         * @protected
         * @type {API.Announcer}
         * @memberof BaseModel
         */
        protected _observable: API.Announcer;

        /**
         * Reference to the core API namespace
         *
         * @protected
         * @type {typeof API}
         * @memberof BaseModel
         */
        protected _api: typeof API;

        /**
         * Reference to the core GUI namespace
         *
         * @protected
         * @type {typeof GUI}
         * @memberof BaseModel
         */
        protected _gui: typeof GUI;

        /**
         * Reference to the model's dialog
         *
         * @type {GUI.BaseDialog}
         * @memberof BaseModel
         */
        dialog: GUI.BaseDialog;

        /**
         * The HTML element ID of the virtual desktop
         *
         * @protected
         * @type {HTMLElement}
         * @memberof BaseModel
         */
        protected host: HTMLElement;

        /**
         * The process number of the current model.
         * For sub-window this number is the number
         * of the parent window
         *
         * @type {number}
         * @memberof BaseModel
         */
        pid: number;

        /**
         * Reference the DOM element of the UI scheme belong to
         * this model
         *
         * @type {HTMLElement}
         * @memberof BaseModel
         */
        scheme: HTMLElement;

        /**
         * Reference to the system setting
         *
         * @protected
         * @type {typeof setting}
         * @memberof BaseModel
         */
        protected systemsetting: typeof setting;

        /**
         * Placeholder for the process creation timestamp
         *
         * @type {number}
         * @memberof BaseModel
         */
        birth: number;

        /**
         * Different model type
         *
         * @static
         * @type {ModelType}
         * @memberof BaseModel
         */
        static type: ModelType;

        /**
         * Allow singleton on this model
         *
         * @static
         * @type {boolean}
         * @memberof BaseModel
         */
        static singleton: boolean;

        /**
         * The javascript or css files that the model depends on. All dependencies
         * will be loaded before the model is rendered
         *
         * @static
         * @type {string[]} list of VFS paths of dependencies
         * @memberof BaseModel
         */
        static dependencies: string[];

        /**
         * Reference to the CSS Element of the model
         *
         * @static
         * @type {(HTMLElement | string)}
         * @memberof BaseModel
         */
        static style: HTMLElement | string;

        /**
         * Place holder for model meta-data
         *
         * @static
         * @type {API.PackageMetaType}
         * @memberof BaseModel
         */
        static meta: API.PackageMetaType;

        /**
         *Creates an instance of BaseModel.
         * @param {string} name class name
         * @param {AppArgumentsType[]} args arguments
         * @memberof BaseModel
         */
        constructor(name: string, args: AppArgumentsType[]) {
            this.name = name;
            this.args = args;
            this._observable = new API.Announcer();
            this._api = API;
            this._gui = GUI;
            this.systemsetting = setting;
            this.on("exit", () => this.quit(false));
            this.host = this._gui.desktop();
            this.dialog = undefined;
        }

        /**
         * Getter: get the local announcer object
         *
         * @readonly
         * @type {API.Announcer}
         * @memberof BaseModel
         */
        get observable(): API.Announcer {
            return this._observable;
        }
        /**
         * Update the model locale
         *
         * @param {string} name
         * @memberof BaseModel
         */
        updateLocale(name: string) {}
        /**
         * Render the model's UI
         *
         * @protected
         * @param {string} p VFS path to the UI scheme definition
         * @returns {void}
         * @memberof BaseModel
         */
        protected render(p: string): void {
            return GUI.loadScheme(p, this, this.host);
        }

        /**
         * Exit the model
         *
         * @param {boolean} force set this value to `true` will bypass the prevented exit event by user
         * @returns {void}
         * @memberof BaseModel
         */
        quit(force: boolean): void {
            const evt = new BaseEvent("exit", force);
            this.onexit(evt);
            if (!evt.prevent) {
                if(this.observable)
                {
                    this.observable.off("*");
                    delete this._observable;
                }
                if (this.dialog) {
                    this.dialog.quit();
                }
                return PM.kill(this);
            }
        }

        /**
         * Model meta data, need to be implemented by
         * subclasses
         *
         * @abstract
         * @returns {API.PackageMetaType}
         * @memberof BaseModel
         */
        abstract meta(): API.PackageMetaType;

        /**
         * VFS path to the model asset
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

        /**
         * Execute a server side script and get back the result
         *
         * @protected
         * @param {GenericObject<any>} cmd execution indication, should be:
         *
         * ```
         * {
         *      path?: string, // VFS path to the server side script
         *      code: string, // or server side code to be executed
         *      parameters: any // the parameters of the server side execution
         * }
         * ```
         *
         * @returns {Promise<any>}
         * @memberof BaseModel
         */
        protected call(cmd: GenericObject<any>): Promise<any> {
            return this._api.apigateway(cmd, false);
        }

        /**
         * Connect to the server side api using a websocket connection
         *
         * Server side script can be execute inside the stream by writing
         * data in JSON format with the following interface
         *
         * ```
         * {
         *      path?: string, // VFS path to the server side script
         *      code: string, // or server side code to be executed
         *      parameters: any // the parameters of the server side execution
         * }
         * ```
         *
         * @protected
         * @returns {Promise<WebSocket>}
         * @memberof BaseModel
         */
        protected stream(): Promise<WebSocket> {
            return this._api.apigateway(null, true) as Promise<WebSocket>;
        }

        /**
         * Init the model before  UI rendering
         *
         * @abstract
         * @memberof BaseModel
         */
        abstract init(): void;

        /**
         * Main entry point after UI rendering
         *
         * @abstract
         * @memberof BaseModel
         */
        abstract main(): void;

        /**
         * Show the model
         *
         * @abstract
         * @memberof BaseModel
         */
        abstract show(): void;

        /**
         * Hide the model
         *
         * @abstract
         * @memberof BaseModel
         */
        abstract hide(): void;

        /**
         * Function called when the model exits
         *
         * @protected
         * @abstract
         * @param {BaseEvent} e exit event
         * @memberof BaseModel
         */
        protected abstract onexit(e: BaseEvent): void;

        /**
         * subscribe once to a local event
         *
         * @protected
         * @param {string} e name of the event
         * @param {(d: any) => void} f event callback
         * @returns {void}
         * @memberof BaseModel
         */
        protected one(e: string, f: (d: any) => void): void {
            return this.observable.one(e, f);
        }

        /**
         * Subscribe to a local event
         *
         * @protected
         * @param {string} e event name
         * @param {(d: any) => void} f event callback
         * @returns {void}
         * @memberof BaseModel
         */
        protected on(e: string, f: (d: any) => void): void {
            return this.observable.on(e, f);
        }

        /**
         * Unsubscribe an event
         *
         * @protected
         * @param {string} e event name or `*` (all events)
         * @param {(d: any) => void} [f] callback to be unsubscribed, can be `undefined`
         * @returns {void}
         * @memberof BaseModel
         */
        protected off(e: string, f?: (d: any) => void): void {
            if (!f) {
                return this.observable.off(e);
            }
            return this.observable.off(e, f);
        }

        /**
         * trigger a local event
         *
         * @param {string} e event name
         * @param {*} [d] event data
         * @returns {void}
         * @memberof BaseModel
         */
        trigger(e: string, d?: any): void {
            if (!this.observable) return;
            this.observable.trigger(e, d);
        }

        /**
         * subscribe to an event on the global announcement system
         *
         * @protected
         * @param {string} e event name
         * @param {(d: API.AnnouncementDataType<any>) => void} f event callback
         * @returns {void}
         * @memberof BaseModel
         */
        subscribe(e: string, f: (d: API.AnnouncementDataType<any>) => void): void {
            return announcer.on(e, f, this);
        }
        
        /**
         * Open a dialog
         *
         * @param {(GUI.BaseDialog | string)} d a dialog object or a dialog class name
         * @param {GenericObject<any>} [data] input data of the dialog, refer to each
         * dialog definition for the format of the input data
         * @returns {Promise<any>} A promise on the callback data of the dialog, refer
         * to each dialog definition for the format of the callback data
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
                return this.dialog.init();
            });
        }

        /**
         * Open a [[YesNoDialog]] to confirm a task
         *
         * @protected
         * @param {GenericObject<any>} data [[YesNoDialog]] input data
         * @returns {Promise<boolean>}
         * @memberof BaseModel
         */
        protected ask(data: GenericObject<any>): Promise<boolean> {
            return this._gui.openDialog("YesNoDialog", data);
        }

        /**
         * Trigger a global event
         *
         * @protected
         * @param {string} t event name
         * @param {(string | FormattedString)} m event message
         * @param {any} u_data user data object if any
         * @returns {void}
         * @memberof BaseModel
         */
        protected publish(
            t: string,
            m: string | FormattedString,
            u_data?: any
        ): void {
            const mt = this.meta();
            const data: API.AnnouncementDataType<any> = {} as API.AnnouncementDataType<any>;
            data.icon = undefined;
            if (mt && mt.icon) {
                data.icon = `${mt.path}/${mt.icon}`;
            }
            data.id = this.pid;
            data.name = this.name;
            data.message = m;
            data.iconclass = mt?mt.iconclass:undefined;
            data.u_data = u_data;
            return announcer.trigger(t, data);
        }

        /**
         * Publish a global notification
         *
         * @param {(string | FormattedString)} m notification string
         * @param {any} u_data user data object if any
         * @returns {void}
         * @memberof BaseModel
         */
        notify(m: string | FormattedString, data?: any): void {
            return this.publish("notification", m, data);
        }

        /**
         * Publish a global warning
         *
         * @param {(string | FormattedString)} m warning string
         * @returns {void}
         * @memberof BaseModel
         */
        warn(m: string | FormattedString): void {
            return this.publish("warning", m);
        }

        /**
         * Report a global error
         *
         * @param {(string | FormattedString)} m error message
         * @param {Error} [e] error object if any
         * @returns
         * @memberof BaseModel
         */
        error(m: string | FormattedString, e?: Error) {
            return this.publish("error", m, e ? e : this._api.throwe(m));
        }

        /**
         * Report a global fail event
         *
         * @param {string} m fail message
         * @param {Error} [e] error object if any
         * @returns
         * @memberof BaseModel
         */
        fail(m: string, e?: Error) {
            return this.publish("fail", m, e ? e : this._api.throwe(m));
        }

        /**
         * Throw an error inside the model
         *
         * @returns {Error}
         * @memberof BaseModel
         */
        throwe(): Error {
            return this._api.throwe(this.name);
        }

        /**
         * Update the model, this will update all its UI elements
         *
         * @returns {void}
         * @memberof BaseModel
         */
        update(): void {
            if (this.scheme) {
                this.scheme.update();
            }
            if(this.dialog)
            {
                this.dialog.update();
            }
        }

        /**
         * Find a HTMLElement in the UI of the model
         * using the `data-id` attribute of the element
         *
         * @protected
         * @param {string} id
         * @returns {HTMLElement}
         * @memberof BaseModel
         */
        protected find(id: string): HTMLElement {
            if (this.scheme) {
                return $(`[data-id='${id}']`, this.scheme)[0];
            }
        }

        /**
         * Select all DOM Element inside the UI of the model
         * using JQuery selector
         *
         * @protected
         * @param {string} sel
         * @returns {HTMLElement}
         * @memberof BaseModel
         */
        protected select(sel: string): JQuery<HTMLElement> {
            if (this.scheme) {
                return $(sel, this.scheme);
            }
        }
    }
}
