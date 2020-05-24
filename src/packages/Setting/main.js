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

class SettingHandle {
    constructor(scheme, parent) {
        this.scheme = scheme;
        this.parent = parent;
    }

    find(id) { if (this.scheme) { return ($(`[data-id='${id}']`, this.scheme))[0]; } }

    render() {}
}

class Setting extends this.OS.GUI.BaseApplication {
    constructor(args) {
        super("Setting", args);
    }
    
    main() {
        this.container = this.find("container");

        new AppearanceHandle(this.find("appearance"), this);
        new VFSHandle(this.find("vfs"), this);
        new LocaleHandle(this.find("locale"), this);
        new StartupHandle(this.find("startup"), this);

        return (this.find("btnsave")).set("onbtclick", e => {
            return this._api.setting()
                .then(d => {
                    if (d.error) { return this.error(__("Cannot save system setting: {0}", d.error)); }
                    return this.notify(__("System setting saved"));
            }).catch(e => {
                    return this.error(__("Cannot save system setting: {0}", e.toString()), e);
            });
        });
    }
}
Setting.singleton = true;
this.OS.register("Setting", Setting);