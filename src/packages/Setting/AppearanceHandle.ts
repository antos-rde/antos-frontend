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
         * @class AppearanceHandle
         * @extends {App.SettingHandle}
         */
        class AppearanceHandle extends App.SettingHandle {
            private wplist: GUI.tag.ListViewTag;
            private wpreview: HTMLDivElement;
            private wprepeat: GUI.tag.ListViewTag;
            private themelist: GUI.tag.ListViewTag;
            private wpsize: GUI.tag.ListViewTag;
            private syswp: string;

            /**
             *Creates an instance of AppearanceHandle.
             * @param {HTMLElement} scheme
             * @param {OS.application.Setting} parent
             * @memberof AppearanceHandle
             */
            constructor(scheme: HTMLElement, parent: OS.application.Setting) {
                let v: GenericObject<any>;
                super(scheme, parent);
                this.wplist = this.find("wplist") as GUI.tag.ListViewTag;
                this.wpreview = this.find("wp-preview") as HTMLDivElement;
                this.wpsize = this.find("wpsize") as GUI.tag.ListViewTag;
                this.wprepeat = this.find("wprepeat") as GUI.tag.ListViewTag;
                this.themelist = this.find("theme-list") as GUI.tag.ListViewTag;
                this.syswp = undefined;
                this.wplist.onlistselect = (e) => {
                    const data = e.data.item.data;
                    $(this.wpreview)
                        .css(
                            "background-image",
                            `url(${data.path.asFileHandle().getlink()})`
                        )
                        .css("background-size", "cover");
                    OS.setting.appearance.wp.url = data.path;
                    GUI.wallpaper();
                };

                this.wplist.buttons = [
                    {
                        text: "+",
                        onbtclick: (e) => {
                            return this.parent
                                .openDialog("FileDialog", {
                                    title: __("Select image file"),
                                    mimes: ["image/.*"],
                                })
                                .then((d) => {
                                    OS.setting.appearance.wps.push(d.file.path);
                                    this.wplist.data = this.getwplist();
                                });
                        },
                    },
                ];

                this.wpsize.onlistselect = (e) => {
                    setting.appearance.wp.size = e.data.item.data.text;
                    return GUI.wallpaper();
                };

                const sizes = [
                    {
                        text: "cover",
                        selected: setting.appearance.wp.size === "cover",
                    },
                    {
                        text: "auto",
                        selected: setting.appearance.wp.size === "auto",
                    },
                    {
                        text: "contain",
                        selected: setting.appearance.wp.size === "contain",
                    },
                ];
                this.wpsize.data = sizes;

                const repeats = [
                    {
                        text: "repeat",
                        selected: setting.appearance.wp.repeat === "repeat",
                    },
                    {
                        text: "repeat-x",
                        selected: setting.appearance.wp.repeat === "repeat-x",
                    },
                    {
                        text: "repeat-y",
                        selected: setting.appearance.wp.repeat === "repeat-y",
                    },
                    {
                        text: "no-repeat",
                        selected: setting.appearance.wp.repeat === "no-repeat",
                    },
                ];
                this.wprepeat.onlistselect = (e) => {
                    setting.appearance.wp.repeat = e.data.item.data.text;
                    GUI.wallpaper();
                };
                this.wprepeat.data = repeats;
                const currtheme = setting.appearance.theme;
                for (v of setting.appearance.themes) {
                    v.selected = v.name === currtheme;
                }
                this.themelist.data = setting.appearance.themes;
                this.themelist.onlistselect = (e) => {
                    let data;
                    if (e && e.data) {
                        data = e.data.item.data;
                    }
                    if (!data) {
                        return;
                    }
                    if (data.name === setting.appearance.theme) {
                        return;
                    }
                    setting.appearance.theme = data.name;
                    GUI.loadTheme(data.name, true);
                };
                if (!this.syswp) {
                    const path = "os://resources/themes/system/wp";
                    path.asFileHandle()
                        .read()
                        .then((d) => {
                            if (d.error) {
                                return this.parent.error(
                                    __(
                                        "Cannot read wallpaper list from {0}",
                                        path
                                    )
                                );
                            }
                            for (v of Array.from(d.result)) {
                                v.text = v.filename;
                                v.iconclass = "fa fa-file-image-o";
                            }
                            this.syswp = d.result;
                            return (this.wplist.data = this.getwplist());
                        })
                        .catch((e) =>
                            this.parent.error(
                                __("Unable to read: {0}", path),
                                e
                            )
                        );
                } else {
                    this.wplist.data = this.getwplist();
                }
            }

            /**
             *
             *
             * @private
             * @returns {GenericObject<any>[]}
             * @memberof AppearanceHandle
             */
            private getwplist(): GenericObject<any>[] {
                let v;
                let list = [];
                for (v of setting.appearance.wps) {
                    const file = v.asFileHandle();
                    list.push({
                        text: file.basename,
                        path: file.path,
                        selected: file.path === setting.appearance.wp.url,
                        iconclass: "fa fa-file-image-o",
                    });
                }
                list = list.concat(this.syswp);
                for (v of list) {
                    v.selected = v.path === setting.appearance.wp.url;
                }
                return list;
            }
        }
        App.AppearanceHandle = AppearanceHandle;
}
