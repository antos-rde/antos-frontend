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
     * @class AppAndServiceHandle
     * @extends {App.SettingHandle}
     */
    class AppAndServiceHandle extends App.SettingHandle {
        private srvlist: GUI.tag.ListViewTag;
        private applist: GUI.tag.ListViewTag;

        /**
         *Creates an instance of AppAndServiceHandle.
         * @param {HTMLElement} scheme
         * @param {OS.application.Setting} parent
         * @memberof AppAndServiceHandle
         */
        constructor(scheme: HTMLElement, parent: OS.application.Setting) {
            super(scheme, parent);
            this.srvlist = this.find("sys-srvlist") as GUI.tag.ListViewTag;
            this.applist = this.find("sys-applist") as GUI.tag.ListViewTag;
            let services = [];
            for (var k in setting.system.packages) {
                const v = setting.system.packages[k];
                if (v.services) {
                    const srvs = v.services.map((x) => {
                        return {
                            text: `${k}/${x}`,
                            iconclass: "fa fa-tasks",
                        }
                    }
                    );
                    services = services.concat(srvs);
                }
            }
            this.srvlist.data = services;
            this.srvlist.buttons = [
                {
                    text: "Start",
                    onbtclick: () => {
                        const item = this.srvlist.selectedItem;
                        if (!item) {
                            return;
                        }
                        GUI
                            .pushService(item.data.text)
                            .catch((e) => this.parent.error(e.toString(), e));
                    },
                },
                {
                    text: "Stop",
                    onbtclick: () => {
                        const item = this.srvlist.selectedItem;
                        if (!item) {
                            return;
                        }
                        const arr = item.data.text.split("/");
                        const srv = arr[1];
                        PM.killAll(srv, true);
                    },
                },
            ];

            this.applist.buttons = [
                {
                    text: "+",
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
                                if (!setting.system.startup.pinned) {
                                    setting.system.startup.pinned = [];
                                }
                                if (!setting.system.startup.pinned.includes(d.app)) {
                                    setting.system.startup.pinned.push(d.app);
                                    return this.refresh();
                                }
                            });
                    },
                },
                {
                    text: "-",
                    onbtclick: () => {
                        const item = this.applist.selectedItem;
                        if (!item) {
                            return;
                        }
                        const selidx = $(item).index();
                        setting.system.startup.pinned.splice(selidx, 1);
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
         * @memberof AppAndServiceHandle
         */
        private refresh(): void {
            let v;
            if (!setting.system.startup.pinned) {
                return;
            }
            this.applist.data = (() => {
                const result1 = [];
                for (v of Array.from(setting.system.startup.pinned)) {
                    result1.push({ text: v, iconclass: "fa fa-adn" });
                }
                return result1;
            })();
            announcer.ostrigger("app-pinned", "app-pinned", this.applist.data);
        }
    }
    App.AppAndServiceHandle = AppAndServiceHandle;
}
