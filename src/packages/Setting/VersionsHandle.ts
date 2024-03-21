/*
 * decaffeinate suggestions:
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
     * @class VFSHandle
     * @extends {App.SettingHandle}
     */
    class VersionsHandle extends App.SettingHandle {
        private grid: GUI.tag.GridViewTag;

        /**
         *Creates an instance of VFSHandle.
         * @param {HTMLElement} scheme
         * @param {OS.application.Setting} parent
         * @memberof VFSHandle
         */
        constructor(scheme: HTMLElement, parent: OS.application.Setting) {
            super(scheme, parent);
            this.grid = this.find("grid-version") as GUI.tag.GridViewTag;
            this.grid.resizable = true;
            this.grid.header = [{ text: __("Component")}, { text: __("Version")}];
            this.display_versions();
        }

       /**
        * Display versions of all system components 
        */
        private async display_versions() : Promise<any>
        {
            try {
                let result = await API.handle.versions();
                if(result.error)
                {
                    throw API.throwe(__("Unable to fetch system version information"));
                }
                let data = result.result as GenericObject<any>;
                let records = [[{text:"AntOS"}, {text: `${OS.VERSION.version_string}`}]];
                for (const key in data) {
                    const element = data[key];
                    records.push([
                        { text: key },
                        { text: `${element["version"]}-${element["ref"]}` }
                    ])
                }
                this.grid.rows = records;
            }
            catch(e)
            {
                this.parent.error(e.toString());
            }
        }
    }

    App.VersionsHandle = VersionsHandle;
}
