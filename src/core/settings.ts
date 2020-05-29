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
    export namespace setting {

        /**
         *
         *
         * @export
         * @interface UserSettingType
         */
        export interface UserSettingType {
            name: string;
            username: string;
            id: number;
            group?: { [index: number]: string };
            [propName: string]: any;
        }

        /**
         *
         *
         * @export
         * @interface DesktopSettingType
         */
        export interface DesktopSettingType {
            path: string;
            menu: any[];
            showhidden: boolean;
            [propName: string]: any;
        }

        /**
         *
         *
         * @export
         * @interface WPSettingType
         */
        export interface WPSettingType {
            repeat: string;
            size: string;
            url: string;
        }

        /**
         *
         *
         * @export
         * @interface ThemeSettingType
         */
        export interface ThemeSettingType {
            name: string;
            text: string;
        }

        /**
         *
         *
         * @export
         * @interface AppearanceSettingType
         */
        export interface AppearanceSettingType {
            theme: string;
            themes: ThemeSettingType[];
            wp: WPSettingType;
            wps: string[];
        }

        /**
         *
         *
         * @export
         * @interface VFSMountPointSettingType
         */
        export interface VFSMountPointSettingType {
            path: string;
            text: string;
            [propName: string]: any;
        }

        /**
         *
         *
         * @export
         * @interface VFSSettingType
         */
        export interface VFSSettingType {
            mountpoints: VFSMountPointSettingType[];
            [propName: string]: any;
        }

        /**
         *
         *
         * @export
         * @interface SystemSettingType
         */
        export interface SystemSettingType {
            error_report: string;
            locale: string;
            menu: any[];
            packages: { [index: string]: API.PackageMetaType };
            pkgpaths: {
                user: string;
                system: string;
            };
            repositories: {
                text: string;
                url: string;
            }[];
            startup: {
                apps: string[];
                services: string[];
            };
        }

        export var user: UserSettingType;

        export var applications: GenericObject<any> = {};

        export var desktop: DesktopSettingType;

        export var appearance: AppearanceSettingType;

        export var VFS: VFSSettingType;

        export var system: SystemSettingType;
    }

    /**
     *
     *
     * @export
     */
    export function resetSetting(): void {
        setting.desktop = {
            path: "home://.desktop",
            menu: [],
            showhidden: false
        };
        setting.user = {
            name: undefined,
            username: undefined,
            id: 0,
        };

        setting.appearance = {
            theme: "antos_dark",
            themes: [
                {
                    text: "AntOS light",
                    name: "antos_light",
                },
                {
                    text: "AntOS dark",
                    name: "antos_dark",
                },
            ],
            wp: {
                url: "os://resources/themes/system/wp/wp3.jpg",
                size: "cover",
                repeat: "repeat",
            },
            wps: [],
        };

        setting.VFS = {
            mountpoints: [
                //TODO: multi app try to write to this object, it neet to be cloned
                {
                    text: "__(Applications)",
                    path: "app://",
                    iconclass: "fa  fa-adn",
                    type: "app",
                },
                {
                    text: "__(Home)",
                    path: "home://",
                    iconclass: "fa fa-home",
                    type: "fs",
                },
                {
                    text: "__(Desktop)",
                    path: setting.desktop.path,
                    iconclass: "fa fa-desktop",
                    type: "fs",
                },
                {
                    text: "__(OS)",
                    path: "os://",
                    iconclass: "fa fa-inbox",
                    type: "fs",
                },
                {
                    text: "__(Google Drive)",
                    path: "gdv://",
                    iconclass: "fa fa-inbox",
                    type: "fs",
                },
                {
                    text: "__(Shared)",
                    path: "shared://",
                    iconclass: "fa fa-share-square",
                    type: "fs",
                },
            ],
        };

        OS.setting.system = {
            error_report: "https://os.iohub.dev/report",
            locale: "en_GB",
            menu: [],
            packages: {},
            pkgpaths: {
                user: "home://.packages",
                system: "os://packages",
            },
            repositories: [],
            startup: {
                apps: [],
                services: [
                    "Syslog/PushNotification", "Syslog/Calendar"
                ],
            },
        };
    }

    /**
     *
     *
     * @export
     * @param {*} conf
     */
    export function systemSetting(conf: any) {
        resetSetting();
        if (conf.desktop) {
            setting.desktop = conf.desktop;
        }
        if (conf.applications) {
            setting.applications = conf.applications;
        }
        if (conf.appearance) {
            setting.appearance = conf.appearance;
        }
        if (conf.user) {
            setting.user = conf.user;
        }
        if (conf.VFS) {
            setting.VFS = conf.VFS;
        }

        if (conf.system) {
            setting.system = conf.system;
        }

        if (!setting.VFS.gdrive) {
            setting.VFS.gdrive = {
                CLIENT_ID: "",
                API_KEY: "",
                apilink: "https://apis.google.com/js/api.js",
                DISCOVERY_DOCS: [
                    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
                ],
                SCOPES: "https://www.googleapis.com/auth/drive",
            };
        }
    }

    //search for app
    API.onsearch("__(Applications)", function (t) {
        const ar = [];
        const term = new RegExp(t, "i");
        for (let k in setting.system.packages) {
            const v = setting.system.packages[k];
            if (v.app) {
                var e, k1, v1;
                if (
                    v.name.match(term) ||
                    (v.description && v.description.match(term))
                ) {
                    v1 = {};
                    for (k1 in v) {
                        e = v[k1];
                        if (k1 !== "selected") {
                            v1[k1] = e;
                        }
                    }
                    v1.detail = [{ text: v1.path }];
                    v1.complex = true;
                    ar.push(v1);
                } else if (v.mimes) {
                    for (let m of Array.from(v.mimes)) {
                        if (t.match(new RegExp(m, "g"))) {
                            v1 = {};
                            for (k1 in v) {
                                e = v[k1];
                                if (k1 !== "selected") {
                                    v1[k1] = v[k1];
                                }
                            }
                            v1.detail = [{ text: v1.path }];
                            v1.complex = true;
                            ar.push(v1);
                            break;
                        }
                    }
                }
            }
        }
        return ar;
    });
}
