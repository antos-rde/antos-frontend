/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
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
    const App = OS.application.Setting;

    /**
     *
     *
     * @class LocaleHandle
     * @extends {App.SettingHandle}
     */
    class LocaleHandle extends App.SettingHandle {
        private lglist: GUI.tag.ListViewTag;
        private localelist: GenericObject<any>[];

        /**
         *Creates an instance of LocaleHandle.
         * @param {HTMLElement} scheme
         * @param {OS.application.Setting} parent
         * @memberof LocaleHandle
         */
        constructor(scheme: HTMLElement, parent: OS.application.Setting) {
            super(scheme, parent);
            this.lglist = this.find("lglist") as GUI.tag.ListViewTag;
            this.localelist = undefined;
            this.lglist.onlistselect = (e) => {
                return API.setLocale(e.data.item.data.text);
            };
            if (!this.localelist) {
                const path = "os://resources/languages";
                path.asFileHandle()
                    .read()
                    .then((d) => {
                        if (d.derror) {
                            return this.parent.error(
                                __("Cannot fetch system locales: {0}", d.error)
                            );
                        }
                        for (let v of d.result) {
                            v.text = v.filename.replace(/\.json$/g, "");
                            v.selected = v.text === setting.system.locale;
                        }
                        this.localelist = d.result;
                        return (this.lglist.data = this.localelist);
                    })
                    .catch((e) =>
                        this.parent.error(__("Unable to read: {0}", path), e)
                    );
            } else {
                this.lglist.data = this.localelist;
            }
        }
    }
    App.LocaleHandle = LocaleHandle;
}
