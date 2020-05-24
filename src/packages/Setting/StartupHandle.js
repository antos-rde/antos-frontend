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

class StartupHandle extends SettingHandle {
    constructor(scheme, parent) {
        super(scheme, parent);
        this.srvlist = this.find("srvlist");
        this.applist = this.find("applist");
        this.srvlist.set("buttons", [
            {
                text: "+", onbtclick: e => {
                    let services = [];
                    for (var k in this.parent.systemsetting.system.packages) {
                        const v = this.parent.systemsetting.system.packages[k];
                        if (v.services) {
                            const srvs = (Array.from(v.services).map((x) => ({ text: `${k}/${x}`, iconclass: "fa fa-tasks" })));
                            services = services.concat(srvs);
                        }
                    }
                    return this.parent.openDialog("SelectionDialog", {
                        title: "__(Add service)",
                        data: services
                    }).then(d => {
                       this.parent.systemsetting.system.startup.services.push(d.text);
                       return this.refresh();
                    });
                }
            },
            {
                text: "-", onbtclick: e => {
                    const item = this.srvlist.get("selectedItem");
                    if (!item) { return; }
                    const selidx = $(item).index();
                    this.parent.systemsetting.system.startup.services.splice(selidx, 1);
                    return this.refresh();
                }
            }
        ]);

        this.applist.set("buttons", [
            {
                text: "+", onbtclick: e => {
                    const apps = ((() => {
                        const result = [];
                         for (let k in  this.parent.systemsetting.system.packages) {
                            const v = this.parent.systemsetting.system.packages[k];
                            result.push({ text: k, iconclass: v.iconclass });
                        } 
                        return result;
                    })());
                    return this.parent.openDialog("SelectionDialog", {
                        title: "__(Add application)",
                        data: apps
                    }).then(d => {
                       this.parent.systemsetting.system.startup.apps.push(d.text);
                       return this.refresh();
                    });
                }
            },
            {
                text: "-", onbtclick: e => {
                    const item = this.applist.get("selectedItem");
                    if (!item) { return; }
                    const selidx = $(item).index();
                    this.parent.systemsetting.system.startup.apps.splice(selidx, 1);
                    return this.refresh();
                }
            }
        ]);
        this.refresh();
    }
       
    refresh() {
        let v;
        this.srvlist.set("data", ((() => {
            const result = [];
             for (v of Array.from(this.parent.systemsetting.system.startup.services)) {                 result.push({ text:v });
            } 
            return result;
        })()));
        return this.applist.set("data", ((() => {
            const result1 = [];
             for (v of Array.from(this.parent.systemsetting.system.startup.apps)) {                 result1.push({ text:v });
            } 
            return result1;
        })()));
    }
}
