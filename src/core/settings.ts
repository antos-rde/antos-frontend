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
    /**
     * This namespace is dedicated to everything related to the
     * global system settings
     */
    export namespace setting {
        /**
         * User setting type definition
         *
         * @export
         * @interface UserSettingType
         */
        export interface UserSettingType {
            /**
             * User full name
             *
             * @type {string}
             * @memberof UserSettingType
             */
            name: string;

            /**
             * User name
             *
             * @type {string}
             * @memberof UserSettingType
             */
            username: string;

            /**
             * User id
             *
             * @type {number}
             * @memberof UserSettingType
             */
            id: number;

            /**
             * User groups
             *
             * @type {{ [index: number]: string }}
             * @memberof UserSettingType
             */
            group?: { [index: number]: string };
            [propName: string]: any;
        }

        /**
         * Virtual desktop setting data type
         *
         * @export
         * @interface DesktopSettingType
         */
        export interface DesktopSettingType {
            /**
             * Desktop VFS path
             *
             * @type {string}
             * @memberof DesktopSettingType
             */
            path: string;

            /**
             * Desktop menu, can be added automatically by applications
             *
             * @type {GUI.BasicItemType[]}
             * @memberof DesktopSettingType
             */
            menu: GUI.BasicItemType[];

            /**
             * Show desktop hidden files
             *
             * @type {boolean}
             * @memberof DesktopSettingType
             */
            showhidden: boolean;
            [propName: string]: any;
        }

        /**
         * Wallpaper setting data type
         *
         * @export
         * @interface WPSettingType
         */
        export interface WPSettingType {
            /**
             * Repeat wallpaper:
             * - `repeat`
             * - `repeat-x`
             * - `repeat-y`
             * - `no-repeat`
             *
             * @type {string}
             * @memberof WPSettingType
             */
            repeat: string;

            /**
             * Wallpaper size
             * - `contain`
             * - `cover`
             * - `auto`
             *
             * @type {string}
             * @memberof WPSettingType
             */
            size: string;

            /**
             * VFS path to the wallpaper image
             *
             * @type {string}
             * @memberof WPSettingType
             */
            url: string;
        }

        /**
         * Theme setting data type
         *
         * @export
         * @interface ThemeSettingType
         */
        export interface ThemeSettingType {
            /**
             * Theme name, this value is used for looking
             * theme file in system asset
             *
             * @type {string}
             * @memberof ThemeSettingType
             */
            name: string;

            /**
             * Theme user-friendly text
             *
             * @type {string}
             * @memberof ThemeSettingType
             */
            text: string;
        }

        /**
         * Appearance setting data type
         *
         * @export
         * @interface AppearanceSettingType
         */
        export interface AppearanceSettingType {
            /**
             * Current theme name
             *
             * @type {string}
             * @memberof AppearanceSettingType
             */
            theme: string;

            /**
             * All themes available in the system
             *
             * @type {ThemeSettingType[]}
             * @memberof AppearanceSettingType
             */
            themes: ThemeSettingType[];

            /**
             * Current wallpaper setting
             *
             * @type {WPSettingType}
             * @memberof AppearanceSettingType
             */
            wp: WPSettingType;

            /**
             * All wallpapers available in the system
             *
             * @type {string[]}
             * @memberof AppearanceSettingType
             */
            wps: string[];
        }

        /**
         * VFS Mount points setting data type
         *
         * @export
         * @interface VFSMountPointSettingType
         */
        export interface VFSMountPointSettingType {
            /**
             * Path to the mount point
             *
             * @type {string}
             * @memberof VFSMountPointSettingType
             */
            path: string;

            /**
             * User friendly mount point name
             *
             * @type {string}
             * @memberof VFSMountPointSettingType
             */
            text: string;
            [propName: string]: any;
        }

        /**
         * VFS setting data type
         *
         * @export
         * @interface VFSSettingType
         */
        export interface VFSSettingType {
            /**
             * mount points setting
             *
             * @type {VFSMountPointSettingType[]}
             * @memberof VFSSettingType
             */
            mountpoints: VFSMountPointSettingType[];
            [propName: string]: any;
        }

        /**
         * Global system setting data type
         *
         * @export
         * @interface SystemSettingType
         */
        export interface SystemSettingType {
            /**
             * System error report URL
             *
             * @type {string}
             * @memberof SystemSettingType
             */
            error_report: string;

            /**
             * Current system locale e.g. `en_GB`
             *
             * @type {string}
             * @memberof SystemSettingType
             */
            locale: string;

            /**
             * System menus
             *
             * @type {API.PackageMetaType[]}
             * @memberof API.PackageMetaType
             */
            menu: API.PackageMetaType[];

            /**
             * Packages meta-data
             *
             * @type {{ [index: string]: API.PackageMetaType }}
             * @memberof SystemSettingType
             */
            packages: { [index: string]: API.PackageMetaType };

            /**
             * Path to the installed packages
             *
             * @type {{
             *                 user: string;
             *                 system: string;
             *             }}
             * @memberof SystemSettingType
             */
            pkgpaths: {
                /**
                 * User specific packages install location
                 *
                 * @type {string}
                 */
                user: string;

                /**
                 * System packages install location
                 *
                 * @type {string}
                 */
                system: string;
            };

            /**
             * Package repositories setting.
             * This configuration is used by {@link OS.application.MarketPlace}
             * for package management
             *
             * @type {{
             *                 text: string;
             *                 url: string;
             *             }[]}
             * @memberof SystemSettingType
             */
            repositories: {
                /**
                 * Repository name
                 *
                 * @type {string}
                 */
                text: string;

                /**
                 * Repository uri
                 *
                 * @type {string}
                 */
                url: string;
            }[];

            /**
             * Startup applications and services
             *
             * @type {{
             *                 apps: string[];
             *                 services: string[];
             *             }}
             * @memberof SystemSettingType
             */
            startup: {
                /**
                 * List of application names
                 *
                 * @type {string[]}
                 */
                apps: string[];

                /**
                 * List of service names
                 *
                 * @type {string[]}
                 */
                services: string[];

                /**
                 * List of pinned applications
                 *
                 * @type {string[]}
                 */
                pinned: string[];
            };
        }
        /**
         * User settings
         */
        export var user: UserSettingType;
        /**
         * Application settings
         */
        export var applications: GenericObject<any> = {};
        /**
         * Desktop settings
         */
        export var desktop: DesktopSettingType;
        /**
         * Appearance settings
         */
        export var appearance: AppearanceSettingType;
        /**
         * VFS settings
         */
        export var VFS: VFSSettingType;
        /**
         * System settings
         */
        export var system: SystemSettingType;
    }

    /**
     * Reset the system settings to default values
     *
     * @export
     */
    export function resetSetting(): void {
        setting.desktop = {
            path: "home://.antos/desktop",
            menu: [],
            showhidden: false,
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
                //TODO: multi app try to write to this object, it need to be cloned
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
                user: "home://.antos/packages",
                system: "os://packages",
            },
            repositories: [],
            startup: {
                apps: [],
                services: ["SystemServices/PushNotification", "SystemServices/Calendar"],
                pinned: [],
            },
        };
    }

    /**
     * Apply the input parameter object to system settings.
     * This object could be an object loaded from
     * setting JSON file saved on the server.
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
        // default repo
        if(!setting.system.repositories || setting.system.repositories.length === 0)
       {
           setting.system.repositories = [
                {
                    text: "Github",
                    url: "https://raw.githubusercontent.com/lxsang/antosdk-apps/2.0.x/packages.json"
                }
           ]
       } 

        setting.applications.categories = [
            {
                text: "__(Media)",
                iconclass: "bi bi-disc"
            },
            {
                text: "__(Development)",
                iconclass: "bi bi-hammer"
            },
            {
                text: "__(Education)",
                iconclass: "fa fa-graduation-cap"
            },
            {
                text: "__(Game)",
                iconclass: "fa fa-gamepad"
            },
            {
                text: "__(Graphics)",
                iconclass: "bi bi-palette-fill"
            },
            {
                text: "__(Internet)",
                iconclass: "fa fa-globe"
            },
            {
                text: "__(Office)",
                iconclass: "bi bi-building"
            },
            {
                text: "__(System)",
                iconclass: "fa bi-gear-wide-connected"
            },
            {
                text: "__(Utility)",
                iconclass: "bi bi-tools"
            },
        ]
    }

    // Register handle for application search
    API.onsearch("__(Applications)", function (t) {
        const ar = [];
        const term = new RegExp(t, "i");
        for (let k in setting.system.packages) {
            const v = setting.system.packages[k];
            if (v.app) {
                var e: any, k1: string, v1: { [x: string]: any; detail?: any; path?: any; complex?: any; };
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
                    for (let m of v.mimes) {
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
