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
         * Services are processes that run in the background and
         * are waken up in certain circumstances such as global
         * events or user interactions.
         *
         * Each service takes an entry in the system tray menu
         * located on the system panel. This menu entry is used
         * to access to service visual contents such as: options,
         * task performing based on user interaction, etc.
         *
         * @export
         * @abstract
         * @class BaseService
         * @extends {BaseModel}
         */
        export abstract class BaseService extends BaseModel {
            /**
             * The service icon shown in the system tray
             *
             * @type {string}
             * @memberof BaseService
             */
            icon: string;

            /**
             * CSS class of the service icon shown in the system tray
             *
             * @type {string}
             * @memberof BaseService
             */
            iconclass: string;

            /**
             * Text of the service shown in the system tray
             *
             * @type {string}
             * @memberof BaseService
             */
            text: string;

            /**
             * Reference to the menu entry DOM element attached
             * to the service
             *
             * @type {HTMLElement}
             * @memberof BaseService
             */
            domel: HTMLElement;

            /**
             * Reference to the timer that periodically execute the callback
             * defined in [[watch]].
             *
             * @private
             * @type {number}
             * @memberof BaseService
             */
            private timer: number;

            /**
             * Reference to th system tray menu
             *
             * @type {HTMLElement}
             * @memberof BaseService
             */
            holder: HTMLElement;

            /**
             * Place holder for service select callback
             *
             * @memberof BaseService
             */
            onmenuselect: (
                d: OS.GUI.TagEventType<GUI.tag.MenuEventData>
            ) => void;

            /**
             *Creates an instance of BaseService.
             * @param {string} name service class name
             * @param {AppArgumentsType[]} args service arguments
             * @memberof BaseService
             */
            constructor(name: string, args: AppArgumentsType[]) {
                super(name, args);
                this.icon = undefined;
                this.iconclass = "fa-paper-plane-o";
                this.text = "";
                this.timer = undefined;
                this.holder = undefined;
                this.onmenuselect = (d) => {
                    return this.awake(d);
                };
            }

            /**
             * Do nothing
             *
             * @memberof BaseService
             */
            hide(): void {}

            /**
             * Init the service before attaching it to
             * the system tray: event subscribe, scheme
             * loading.
             *
             * Should be implemented by all subclasses
             *
             * @abstract
             * @memberof BaseService
             */
            abstract init(): void;

            /**
             * Refresh the service menu entry in the
             * system tray
             *
             * @memberof BaseService
             */
            update(): void {
                (this.domel as GUI.tag.MenuEntryTag).data = this;
            }

            /**
             * Get the service meta-data
             *
             * @returns {API.PackageMetaType}
             * @memberof BaseService
             */
            meta(): API.PackageMetaType {
                return application[this.name].meta;
            }

            /**
             * Attach the service to a menu element
             * such as the system tray menu
             *
             * @param {HTMLElement} h
             * @memberof BaseService
             */
            attach(h: HTMLElement): void {
                this.holder = h;
            }

            /**
             * Set the callback that will be called periodically
             * after a period of time.
             *
             * Each service should only have at most one watcher
             *
             * @protected
             * @param {number} t period time in seconds
             * @param {() => void} f callback function
             * @returns {number}
             * @memberof BaseService
             */
            protected watch(t: number, f: () => void): number {
                var func = () => {
                    f();
                    if (this.timer) {
                        clearTimeout(this.timer);
                    }
                    return (this.timer = setTimeout(() => func(), t));
                };
                return func();
            }

            /**
             * This function is called when the service
             * is exited
             *
             * @protected
             * @param {BaseEvent} evt exit event
             * @returns
             * @memberof BaseService
             */
            protected onexit(evt: BaseEvent) {
                if (this.timer) {
                    console.log("clean timer");
                }
                if (this.timer) {
                    clearTimeout(this.timer);
                }
                this.cleanup(evt);
                if (this.scheme) {
                    return $(this.scheme).remove();
                }
            }

            /**
             * Do nothing
             *
             * @memberof BaseService
             */
            main(): void {}

            /**
             * Do nothing
             *
             * @memberof BaseService
             */
            show(): void {}

            /**
             * Awake the service, this function is usually called when
             * the system tray menu entry attached to the service is
             * selected.
             *
             * This function should be implemented by all subclasses
             *
             * @abstract
             * @param {GUI.TagEventType} e
             * @memberof BaseService
             */
            abstract awake(e: GUI.TagEventType<GUI.tag.MenuEventData>): void;

            /**
             * Do nothing
             *
             * @protected
             * @param {BaseEvent} evt
             * @memberof BaseService
             */
            protected cleanup(evt: BaseEvent) {}
        }

        BaseService.type = ModelType.Service;
        BaseService.singleton = true;
    }
}
