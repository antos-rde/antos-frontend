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
         * @class SettingHandle
         */
        class SettingHandle {
            protected scheme: HTMLElement;
            protected parent: Setting;

            /**
             *Creates an instance of SettingHandle.
             * @param {HTMLElement} scheme
             * @param {Setting} parent
             * @memberof SettingHandle
             */
            constructor(scheme: HTMLElement, parent: Setting) {
                this.scheme = scheme;
                this.parent = parent;
            }

            /**
             *
             *
             * @protected
             * @param {string} id
             * @returns
             * @memberof SettingHandle
             */
            protected find(id: string) {
                if (this.scheme) {
                    return $(`[data-id='${id}']`, this.scheme)[0];
                }
            }

            /**
             *
             *
             * @protected
             * @memberof SettingHandle
             */
            protected render() : void {};
        }

        /**
         *
         *
         * @export
         * @class Setting
         * @extends {BaseApplication}
         */
        export class Setting extends BaseApplication {
            //private containter: GUI.tag.TabContainerTag;
            static AppearanceHandle: typeof SettingHandle;
            static VFSHandle: typeof SettingHandle;
            static LocaleHandle: typeof SettingHandle;
            static StartupHandle: typeof SettingHandle;
            static SettingHandle: typeof SettingHandle;
            static AppAndServiceHandle: typeof SettingHandle;

            /**
             *Creates an instance of Setting.
             * @param {AppArgumentsType[]} args
             * @memberof Setting
             */
            constructor(args: AppArgumentsType[]) {
                super("Setting", args);
            }

            /**
             *
             *
             * @memberof Setting
             */
            main(): void{
                const containter = this.find("container") as GUI.tag.TabContainerTag;

                new Setting.AppearanceHandle(this.find("appearance"), this);
                new Setting.VFSHandle(this.find("vfs"), this);
                new Setting.LocaleHandle(this.find("locale"), this);
                new Setting.StartupHandle(this.find("startup"), this);
                new Setting.AppAndServiceHandle(this.find("app-services"), this);
                containter.selectedIndex = 0;
                (this.find("btnsave") as GUI.tag.ButtonTag ).onbtclick = (e) => {
                    this._api
                        .setting()
                        .then((d) => {
                            if (d.error) {
                                return this.error(
                                    __(
                                        "Cannot save system setting: {0}",
                                        d.error
                                    )
                                );
                            }
                            return this.notify(__("System setting saved"));
                        })
                        .catch((e) => {
                            return this.error(
                                __(
                                    "Cannot save system setting: {0}",
                                    e.toString()
                                ),
                                e
                            );
                        });
                };
            }
        }
        Setting.singleton = true;
        Setting.SettingHandle = SettingHandle;
    }
}
