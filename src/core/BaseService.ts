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
    export namespace application {
        /**
         *
         *
         * @export
         * @abstract
         * @class BaseService
         * @extends {BaseModel}
         */
        export abstract class BaseService extends BaseModel {
            icon: string;
            iconclass: string;
            text: string;
            domel: HTMLElement;
            private timer: number;
            holder: HTMLElement;
            onmenuselect: (d: OS.GUI.TagEventType) => void;

            /**
             *Creates an instance of BaseService.
             * @param {string} name
             * @param {AppArgumentsType[]} args
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
             *
             *
             * @memberof BaseService
             */
            hide(): void {}

            /**
             *
             *
             * @abstract
             * @memberof BaseService
             */
            abstract init(): void;
            //implement by user
            // event registe, etc
            // scheme loader

            /**
             *
             *
             * @memberof BaseService
             */
            update(): void {
                (this.domel as GUI.tag.MenuEntryTag).data = this;
            }

            /**
             *
             *
             * @returns {API.PackageMetaType}
             * @memberof BaseService
             */
            meta(): API.PackageMetaType {
                return application[this.name].meta;
            }

            /**
             *
             *
             * @param {HTMLElement} h
             * @memberof BaseService
             */
            attach(h: HTMLElement): void {
                this.holder = h;
            }

            /**
             *
             *
             * @param {number} t
             * @param {() => void} f
             * @returns {number}
             * @memberof BaseService
             */
            watch(t: number, f: () => void): number {
                var func = () => {
                    f();
                    return (this.timer = setTimeout(() => func(), t));
                };
                return func();
            }

            /**
             *
             *
             * @param {BaseEvent} evt
             * @returns
             * @memberof BaseService
             */
            onexit(evt: BaseEvent) {
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
             *
             *
             * @memberof BaseService
             */
            main(): void {}

            /**
             *
             *
             * @memberof BaseService
             */
            show(): void {}

            /**
             *
             *
             * @abstract
             * @param {GUI.TagEventType} e
             * @memberof BaseService
             */
            abstract awake(e: GUI.TagEventType): void;
            //implement by user to tart the service

            /**
             *
             *
             * @param {BaseEvent} evt
             * @memberof BaseService
             */
            cleanup(evt: BaseEvent) {}
        }
        //implemeted by user
        BaseService.type = ModelType.Service;
        BaseService.singleton = true;
    }
}
