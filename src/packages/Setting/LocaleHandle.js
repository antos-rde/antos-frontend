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

class LocaleHandle extends SettingHandle {
    constructor(scheme, parent) {
        super(scheme, parent);
        this.lglist = this.find("lglist");
        this.localelist = undefined;
        this.lglist.set("onlistselect", e => {
            return this.parent._api.setLocale(e.data.item.get("data").text);
        });
        if (!this.localelist) {
            const path = "os://resources/languages";
            path.asFileHandle().read()
            .then(d => {
                if (d.derror) { return this.parent.error(__("Cannot fetch system locales: {0}", d.error)); }
                for (let v of Array.from(d.result)) {
                    v.text = v.filename.replace(/\.json$/g, "");
                    v.selected = v.text === this.parent.systemsetting.system.locale;
                }
                this.localelist = d.result;
                return this.lglist.set("data", this.localelist);
        }).catch(e => this.parent.error(__("Unable to read: {0}", path), e));
        } else {
            this.lglist.set("data", this.localelist);
        }
    }
}
