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
namespace OS {
    const App = OS.application.Setting;

    /**
     *
     *
     * @class StartupHandle
     * @extends {App.SettingHandle}
     */
    class StartupHandle extends App.SettingHandle {
        private srvlist: GUI.tag.ListViewTag;
        private applist: GUI.tag.ListViewTag;

        /**
         *Creates an instance of StartupHandle.
         * @param {HTMLElement} scheme
         * @param {OS.application.Setting} parent
         * @memberof StartupHandle
         */
        constructor(scheme: HTMLElement, parent: OS.application.Setting) {
            super(scheme, parent);
            this.srvlist = this.find("srvlist") as GUI.tag.ListViewTag;
            this.applist = this.find("applist") as GUI.tag.ListViewTag;
            this.srvlist.buttons = [
                {
                    iconclass: "bi bi-plus",
                    onbtclick: () => {
                        let services = [];
                        for (var k in setting.system.packages) {
                            const v = setting.system.packages[k];
                            if (v.services) {
                                const srvs = v.services.map((x) => ({
                                    text: `${k}/${x}`,
                                    iconclass: "fa fa-tasks",
                                }));
                                services = services.concat(srvs);
                            }
                        }
                        this.parent
                            .openDialog("SelectionDialog", {
                                title: "__(Add service)",
                                data: services,
                            })
                            .then((d) => {
                                if(!setting.system.startup.services.includes(d.text))
                                {
                                    setting.system.startup.services.push(d.text);
                                    return this.refresh();
                                }
                            });
                    },
                },
                {
                    iconclass: "bi bi-dash",
                    onbtclick: () => {
                        const item = this.srvlist.selectedItem;
                        if (!item) {
                            return;
                        }
                        const selidx = $(item).index();
                        setting.system.startup.services.splice(selidx, 1);
                        return this.refresh();
                    },
                },
            ];

            this.applist.buttons = [
                {
                    iconclass: "bi bi-plus",
                    onbtclick: () => {
                        const apps = (() => {
                            const result = [];
                            for (let k in setting.system.packages) {
                                const v = setting.system.packages[k];
                                if(v.app)
                                {
                                    result.push({
                                        text: v.name,
                                        app: k,
                                        iconclass: v.iconclass,
                                        icon: v.icon
                                    });
                                }
                            }
                            return result.sort((a,b) =>{
                                if(a.text >b.text) return 1;
                                if(a.text < b.text) return -1;
                                return 0;
                            });
                        })();
                        this.parent
                            .openDialog("SelectionDialog", {
                                title: "__(Add application)",
                                data: apps,
                            })
                            .then((d) => {
                                if(!setting.system.startup.apps.includes(d.app))
                                {
                                    setting.system.startup.apps.push(d.app);
                                    return this.refresh();
                                }
                            });
                    },
                },
                {
                    iconclass: "bi bi-dash",
                    onbtclick: () => {
                        const item = this.applist.selectedItem;
                        if (!item) {
                            return;
                        }
                        const selidx = $(item).index();
                        setting.system.startup.apps.splice(selidx, 1);
                        return this.refresh();
                    },
                },
            ];
            this.refresh();
        }

        /**
         *
         *
         * @private
         * @memberof StartupHandle
         */
        private refresh(): void {
            let v;
            this.srvlist.data = (() => {
                const result = [];
                for (v of setting.system.startup.services) {
                    result.push({ text: v});
                }
                return result;
            })();
            this.applist.data = (() => {
                const result1 = [];
                for (v of Array.from(setting.system.startup.apps)) {
                    result1.push({ text: v });
                }
                return result1;
            })();
        }
    }
    App.StartupHandle = StartupHandle;
}
