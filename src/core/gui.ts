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
// along with this program. If not, see https://www.gnu.org/licenses/.
namespace OS {
    /**
     * 
     */
    export namespace GUI {
        /**
         *
         *
         * @export
         * @interface ShortcutType
         */
        export interface ShortcutType {
            ALT: GenericObject<(e: JQuery.MouseDownEvent) => void>;
            CTRL: GenericObject<(e: JQuery.MouseDownEvent) => void>;
            SHIFT: GenericObject<(e: JQuery.MouseDownEvent) => void>;
            META: GenericObject<(e: JQuery.MouseDownEvent) => void>;
        }

        /**
         *
         *
         * @export
         * @interface BasicItemType
         */
        export interface BasicItemType {
            text: string | FormattedString;
            children?: BasicItemType[];
            nodes?: BasicItemType[];
            [propName: string]: any;
        }

        export var workspace: string = "#desktop";

        export var fullscreen = false;

        export var dialog: BaseDialog;

        var shortcut: ShortcutType = {
            ALT: {},
            CTRL: {},
            SHIFT: {},
            META: {},
        };

        /**
         *
         *
         * @export
         * @param {string} html
         * @param {BaseModel} app
         * @param {(Element | string)} parent
         */
        export function htmlToScheme(
            html: string,
            app: BaseModel,
            parent: Element | string
        ): void {
            const scheme = $.parseHTML(html);

            if (app.scheme) {
                $(app.scheme).remove();
            }
            $(parent as GenericObject<any>).append(scheme);
            app.scheme = scheme[0] as HTMLElement;
            app.scheme.uify(app.observable, true);
            app.main();
            app.show();
        }

        /**
         *
         *
         * @export
         * @param {string} path
         * @param {BaseModel} app
         * @param {(HTMLElement | string)} parent
         */
        export function loadScheme(
            path: string,
            app: BaseModel,
            parent: HTMLElement | string
        ): void {
            path.asFileHandle()
                .read()
                .then(function (x) {
                    if (!x) {
                        return;
                    }
                    htmlToScheme(x, app, parent);
                })
                .catch((e) => {
                    announcer.oserror(__("Cannot load scheme: {0}", path), e);
                });
        }

        /**
         *
         *
         * @export
         */
        export function clearTheme(): void {
            $("head link#ostheme").attr("href", "");
        }

        /**
         *
         *
         * @export
         * @param {string} name
         * @param {boolean} force
         */
        export function loadTheme(name: string, force: boolean): void {
            if (force) {
                clearTheme();
            }
            const path = `resources/themes/${name}/${name}.css`;
            $("head link#ostheme").attr("href", path);
        }

        /**
         *
         *
         * @export
         * @param {(string | BaseDialog)} d
         * @param {GenericObject<any>} data
         * @returns {Promise<any>}
         */
        export function openDialog(
            d: string | BaseDialog,
            data: GenericObject<any>
        ): Promise<any> {
            return new Promise(function (resolve, reject) {
                if (dialog) {
                    dialog.show();
                    return resolve();
                }
                if (typeof d === "string") {
                    if (!dialogs[d]) {
                        const ex = API.throwe("Dialog");
                        return reject(ex);
                    }
                    dialog = new dialogs[d]();
                } else {
                    dialog = d as GUI.BaseDialog;
                }

                dialog.parent = GUI;
                dialog.handle = resolve;
                dialog.pid = -1;
                dialog.data = data;
                return dialog.init();
            });
        }

        /**
         *
         *
         * @export
         * @param {string} mime
         * @returns {API.PackageMetaType[]}
         */
        export function appsByMime(mime: string): API.PackageMetaType[] {
            const metas: API.PackageMetaType[] = [];
            for (let k in setting.system.packages) {
                const v = setting.system.packages[k];
                if (v && v.app) {
                    metas.push(v);
                }
            }
            let m: API.PackageMetaType;
            const mimes: Array<string[]> = [];
            for (m of metas) {
                if (m) {
                    mimes.push(m.mimes);
                }
            }
            const apps: API.PackageMetaType[] = [];
            // search app by mimes
            const f = function (arr: string[], idx: number) {
                try {
                    return arr.filter(function (m, i) {
                        if (mime.match(new RegExp(m, "g"))) {
                            if (apps.indexOf(metas[idx]) >= 0) {
                                return false;
                            }
                            apps.push(metas[idx]);
                            return false;
                        }
                        return false;
                    });
                } catch (e) {
                    return announcer.osfail(
                        __("Error find app by mimes {0}", mime),
                        e
                    );
                }
            };
            let arr: string[];
            for (let i = 0; i < mimes.length; i++) {
                arr = mimes[i];
                if (arr) {
                    f(arr, i);
                }
            }
            return apps;
        }

        /**
         *
         *
         * @export
         * @returns {{
         *             [index: string]: API.PackageMetaType;
         *         }}
         */
        export function appsWithServices(): {
            [index: string]: API.PackageMetaType;
        } {
            const o: { [index: string]: API.PackageMetaType } = {};
            for (let k in setting.system.packages) {
                const v = setting.system.packages[k];
                if (v && v.services && v.services.length > 0) {
                    o[k] = v;
                }
            }
            return o;
        }

        /**
         *
         *
         * @export
         * @param {AppArgumentsType} it
         * @returns {void}
         */
        export function openWith(it: AppArgumentsType): void {
            if (!it) {
                return;
            }
            if (it.type === "app" && it.app) {
                return launch(it.app, []);
            }
            if (it.type === "app") {
                return announcer.osinfo(
                    __("Application {0} is not executable", it.text)
                );
            }
            const apps = appsByMime(it.type === "dir" ? "dir" : it.mime);
            if (apps.length === 0) {
                return announcer.osinfo(
                    __("No application available to open {0}", it.filename)
                );
            }
            if (apps.length === 1) {
                return launch(apps[0].app, [it]);
            }
            const list = apps.map((e) => ({
                text: e.app,
                icon: e.icon,
                iconclass: e.iconclass,
            }));
            openDialog("SelectionDialog", {
                title: __("Open with"),
                data: list,
            }).then((d) => launch(d.text, [it]));
        }

        /**
         *
         *
         * @export
         * @param {string} app
         * @param {AppArgumentsType[]} args
         * @returns {void}
         */
        export function forceLaunch(
            app: string,
            args: AppArgumentsType[]
        ): void {
            console.warn(
                "This method is used for developing only, please use the launch method instead"
            );
            unloadApp(app);
            return launch(app, args);
        }

        
        /**
         *
         *
         * @export
         * @param {string} app
         */
        export function unloadApp(app: string): void {
            PM.killAll(app, true);
            if (application[app] && application[app].style) {
                $(application[app].style).remove();
            }
            delete application[app];
        }

        /**
         *
         *
         * @param {string} app
         * @returns {Promise<string>}
         */
        function loadApp(app: string): Promise<string> {
            return new Promise(async function (resolve, reject) {
                let path: string;
                if (setting.system.packages[app].path) {
                    path = setting.system.packages[app].path;
                }
                const js = path + "/main.js";
                try {
                    const d = await js.asFileHandle().read("script");
                    try {
                        const data: API.PackageMetaType = await `${path}/package.json`
                            .asFileHandle()
                            .read("json");
                        data.path = path;
                        if (application[app]) {
                            application[app].meta = data;
                        }
                        if (data.services) {
                            for (let v of data.services) {
                                application[v].meta = data;
                            }
                        }
                        //load css file
                        const css = `${path}/main.css`;
                        try {
                            const d_1 = await css.asFileHandle().onready();
                            const stamp = new Date().timestamp();
                            const el = $("<link>", {
                                rel: "stylesheet",
                                type: "text/css",
                                href: `${API.handle.get}/${css}?stamp=${stamp}`,
                            }).appendTo("head");
                            if (application[app]) {
                                application[app].style = el[0];
                            }
                            return resolve(app);
                        } catch (e) {
                            return resolve(app);
                        }
                    } catch (e_1) {
                        return reject(__e(e_1));
                    }
                } catch (e_2) {
                    return reject(__e(e_2));
                }
            });
        }

        /**
         *
         *
         * @export
         * @param {string} ph
         * @returns {Promise<PM.ProcessType>}
         */
        export function pushService(ph: string): Promise<PM.ProcessType> {
            return new Promise(async function (resolve, reject) {
                const arr = ph.split("/");
                const srv = arr[1];
                const app = arr[0];
                if (application[srv]) {
                    try {
                        const d = await OS.PM.createProcess(
                            srv,
                            application[srv]
                        );
                        return resolve(d);
                    } catch (e) {
                        return reject(__e(e));
                    }
                } else {
                    try {
                        await loadApp(app);
                        if (!application[srv]) {
                            return reject(
                                API.throwe(__("Service not found: {0}", ph))
                            );
                        }
                        try {
                            const d_1 = await PM.createProcess(
                                srv,
                                application[srv]
                            );
                            return resolve(d_1);
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    } catch (e_2) {
                        return reject(__e(e_2));
                    }
                }
            });
        }

        /**
         *
         *
         * @export
         * @param {string[]} srvs
         * @returns {Promise<any>}
         */
        export function pushServices(srvs: string[]): Promise<any> {
            return new Promise(function (resolve, reject) {
                if (!(srvs.length > 0)) {
                    return resolve();
                }
                const srv = srvs.splice(0, 1)[0];
                return pushService(srv)
                    .then((d: any) =>
                        pushServices(srvs)
                            .then(() => resolve())
                            .catch((e) => reject(__e(e)))
                    )
                    .catch(function (e: Error) {
                        announcer.osfail(__("Unable to load: {0}", srv), e);
                        return pushServices(srvs)
                            .then(() => resolve())
                            .catch((e) => reject(__e(e)));
                    });
            });
        }

        /**
         *
         *
         * @export
         * @param {string} app
         * @param {AppArgumentsType[]} args
         */
        export function launch(app: string, args: AppArgumentsType[]): void {
            if (!application[app]) {
                // first load it
                loadApp(app)
                    .then((a) =>
                        PM.createProcess(app, application[app], args)
                            .catch((e) =>
                            announcer.osfail(
                                __("Unable to launch: {0}", app),
                                e
                            )
                        )
                    )
                    .catch((e) =>
                        announcer.osfail(__("Unable to launch: {0}", app), e)
                    );
            } else {
                // now launch it
                if (application[app]) {
                    PM.createProcess(
                        app,
                        application[app],
                        args
                    ).catch((e: Error) =>
                        announcer.osfail(__("Unable to launch: {0}", app), e)
                    );
                } else {
                    announcer.osfail(
                        __("Unable to find: {0}", app),
                        API.throwe("Application not found")
                    );
                }
            }
        }

        /**
         *
         *
         * @export
         * @param {BaseApplication} app
         * @param {API.PackageMetaType} meta
         * @returns {void}
         */
        export function dock(
            app: OS.application.BaseApplication,
            meta: API.PackageMetaType
        ): void {
            // dock an application to a dock
            // create a data object
            const data = {
                icon: null,
                iconclass: meta.iconclass || "",
                app,
                onbtclick() {
                    return app.toggle();
                },
            };
            // TODO: this path is not good, need to create a blob of it
            if (meta.icon) {
                data.icon = `${meta.path}/${meta.icon}`;
            }
            // TODO: add default app icon class in system setting
            // so that it can be themed
            if (!meta.icon && !meta.iconclass) {
                data.iconclass = "fa fa-cogs";
            }
            const dock = $("#sysdock")[0] as tag.AppDockTag;
            app.init();
            app.observable.one("rendered", function () {
                app.sysdock = dock;
                app.appmenu = $(
                    "[data-id = 'appmenu']",
                    "#syspanel"
                )[0] as tag.MenuTag;
                    dock.newapp(data);
            });
        }

        /**
         *
         *
         * @export
         */
        export function toggleFullscreen(): void {
            const el = document.documentElement;
            if (fullscreen) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                }
                if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
                if (document.cancelFullScreen) {
                    document.cancelFullScreen();
                }
            } else {
                if (el.requestFullscreen) {
                    el.requestFullscreen();
                }
                if (el.mozRequestFullScreen) {
                    el.mozRequestFullScreen();
                }
                if (el.webkitRequestFullscreen) {
                    el.webkitRequestFullscreen();
                }
                if (el.msRequestFullscreen) {
                    el.msRequestFullscreen();
                }
            }
        }

        /**
         *
         *
         * @export
         * @param {BaseApplication} app
         * @returns
         */
        export function undock(app: application.BaseApplication) {
            return ($("#sysdock")[0] as tag.AppDockTag).removeapp(app);
        }

        /**
         *
         *
         * @export
         * @param {BaseService} srv
         * @returns {void}
         */
        export function attachservice(srv: application.BaseService): void {
            ($("#syspanel")[0] as tag.SystemPanelTag).attachservice(srv);
            srv.init();
        }

        /**
         *
         *
         * @export
         * @param {BaseService} srv
         * @returns {void}
         */
        export function detachservice(srv: application.BaseService): void {
            return ($("#syspanel")[0] as tag.SystemPanelTag).detachservice(srv);
        }

        /**
         *
         *
         * @param {JQuery.MouseEventBase} event
         * @returns {void}
         */
        function bindContextMenu(event: JQuery.MouseEventBase): void {
            var handle = function (e: HTMLElement) {
                if (e.contextmenuHandle) {
                    const m = $("#contextmenu")[0] as tag.MenuTag;
                    m.onmenuselect = () => {}
                    return e.contextmenuHandle(
                        event,
                        m
                    );
                } else {
                    const p = $(e).parent().get(0);
                    if (p !== $("#workspace").get(0)) {
                        return handle(p);
                    }
                }
            };
            handle(event.target);
            return event.preventDefault();
        }

        /**
         *
         *
         * @export
         * @param {string} k
         * @param {(e: JQuery.MouseDownEvent) => void} f
         * @returns {void}
         */
        export function bindKey(
            k: string,
            f: (e: JQuery.MouseDownEvent) => void
        ): void {
            const arr = k.split("-");
            if (arr.length !== 2) {
                return;
            }
            const fnk = arr[0].toUpperCase();
            const c = arr[1].toUpperCase();
            if (!shortcut[fnk]) {
                return;
            }
            shortcut[fnk][c] = f;
        }

        /**
         *
         *
         * @export
         * @param {setting.WPSettingType} obj
         */
        export function wallpaper(obj?: setting.WPSettingType): void {
            if (obj) {
                setting.appearance.wp = obj;
            }
            const wp = setting.appearance.wp;
            $("body")
                .css("background-image", `url(${API.handle.get}/${wp.url})`)
                .css("background-size", wp.size)
                .css("background-repeat", wp.repeat);
        }

        /**
         *
         *
         * @param {JQuery<HTMLElement>} el
         * @param {string} text
         * @param {JQuery.MouseEventBase} e
         * @returns {void}
         */
        function showTooltip(
            el: JQuery<HTMLElement>,
            text: string,
            e: JQuery.MouseEventBase
        ): void {
            let left: number, top: number;
            const label = $("#systooltip")[0] as tag.LabelTag;
            var cb = function (ev: JQuery.MouseEventBase) {
                if ($(ev.target).closest(el).length === 0) {
                    $(label).hide();
                    return $(document).off("mousemove", cb);
                }
            };
            $(document).on("mousemove", cb);
            const arr = text.split(/:(.+)/);
            let tip = text;
            if (arr.length > 1) {
                tip = arr[1];
            }
            const offset = $(el).offset();
            const w = $(el).width();
            const h = $(el).height();
            label.text = tip;
            $(label).show();
            switch (arr[0]) {
                case "cr": // center right of the element
                    left = offset.left + w + 5;
                    top = offset.top + h / 2 - $(label).height() / 2;
                    break;
                case "ct": //ceter top
                    left = offset.left + w / 2 - $(label).width() / 2;
                    top = offset.top - $(label).height() - 5;
                    break;
                default:
                    if (!e) {
                        return;
                    }
                    top = e.clientY + 5;
                    left = e.clientX + 5;
            }
            $(label)
                .css("top", top + "px")
                .css("left", left + "px");
        }

        /**
         *
         *
         * @param {tag.FloatListTag} desktop
         */
        function dkfetch(desktop: tag.FloatListTag): void {
            const file = setting.desktop.path.asFileHandle();
            const fn = () =>
                file.read().then(function (d) {
                    if (d.error) {
                        return announcer.osfail(d.error, API.throwe(d.error));
                    }
                    const items = [];
                    $.each(d.result, function (i, v) {
                        if (
                            v.filename[0] === "." &&
                            !setting.desktop.showhidden
                        ) {
                            return;
                        }
                        v.text = v.filename;
                        //v.text = v.text.substring(0,9) + "..." ifv.text.length > 10
                        v.iconclass = v.type;
                        return items.push(v);
                    });
                    desktop.data = items;
                    return desktop.calibrate();
                });

            file.onready()
                .then(() => fn())
                .catch(async function (e) {
                    // try to create the path
                    console.log(`${file.path} not found`);
                    const name = file.basename;
                    try {
                        const r = await file.parent().asFileHandle().mk(name);
                        return API.throwe("OS.VFS");
                    } catch (e_1) {
                        return announcer.osfail(e_1.toString(), e_1);
                    }
                });
        }

        /**
         *
         *
         */
        function initDM(): void {
            const scheme = $.parseHTML(schemes.ws);
            $("#wrapper").append(scheme);

            announcer.observable.one("sysdockloaded", () => {
                $(window).bind("keydown", function (event) {
                    const dock = $("#sysdock")[0] as tag.AppDockTag;
                    if (!dock) {
                        return;
                    }
                    const app = dock.selectedApp;
                    //return true unless app
                    const c = String.fromCharCode(event.which).toUpperCase();
                    let fnk = undefined;
                    if (event.ctrlKey) {
                        fnk = "CTRL";
                    } else if (event.metaKey) {
                        fnk = "META";
                    } else if (event.shiftKey) {
                        fnk = "SHIFT";
                    } else if (event.altKey) {
                        fnk = "ALT";
                    }

                    if (!fnk) {
                        return;
                    }
                    const r = app ? app.shortcut(fnk, c, event) : true;
                    if (!r) {
                        return event.preventDefault();
                    }
                    if (!shortcut[fnk]) {
                        return;
                    }
                    if (!shortcut[fnk][c]) {
                        return;
                    }
                    shortcut[fnk][c](event);
                    return event.preventDefault();
                })
            }
            );
            // system menu and dock
            $("#syspanel")[0].uify(undefined);
            $("#sysdock")[0].uify(undefined);
            $("#systooltip")[0].uify(undefined);
            $("#contextmenu")[0].uify(undefined);

            $("#workspace").contextmenu((e) => bindContextMenu(e));
            // tooltip
            $(document).mouseover(function (e) {
                const el: any = $(e.target).closest("[tooltip]");
                if (!(el.length > 0)) {
                    return;
                }
                return showTooltip(
                    el as JQuery<HTMLElement>,
                    $(el).attr("tooltip"),
                    e
                );
            });

            const fp = setting.desktop.path.asFileHandle();
            // desktop default file manager
            const desktop = $(workspace)[0] as tag.FloatListTag;

            desktop.onready = function (e: tag.FloatListTag) {
                e.observable = OS.announcer.observable;
                window.onresize = function () {
                    announcer.trigger("desktopresize", undefined);
                    return e.calibrate();
                };

                desktop.onlistselect = function (d: TagEventType<tag.ListItemEventData>) {
                    ($("#sysdock")[0] as tag.AppDockTag).selectedApp = null;
                };

                desktop.onlistdbclick = function (d: TagEventType<tag.ListItemEventData>) {
                    ($("#sysdock")[0] as tag.AppDockTag).selectedApp = null;
                    const it = desktop.selectedItem;
                    return openWith(it.data as AppArgumentsType);
                };

                //($ "#workingenv").on "click", (e) ->
                //     desktop[0].set "selected", -1

                $(desktop).on("click", function (e) {
                    let el = $(e.target).parent();
                    if (!(el.length > 0)) {
                        return;
                    }
                    el = el.parent();
                    if (!(el.length > 0)) {
                        return;
                    }
                    if (el[0] !== desktop) {
                        return;
                    }
                    desktop.unselect();
                    ($("#sysdock")[0] as tag.AppDockTag).selectedApp = null;
                });

                desktop.contextmenuHandle = function (e, m) {
                    if (e.target.tagName.toUpperCase() === "UL") {
                        desktop.unselect();
                    }
                    ($("#sysdock")[0] as tag.AppDockTag).selectedApp = null;
                    let menu = [
                        { text: __("Open"), dataid: "desktop-open" },
                        { text: __("Refresh"), dataid: "desktop-refresh" },
                    ];
                    menu = menu.concat(
                        (() => {
                            const result = [];
                            for (let k in setting.desktop.menu) {
                                const v = setting.desktop.menu[k];
                                result.push(v);
                            }
                            return result;
                        })()
                    );
                    m.items = menu;
                    m.onmenuselect = function (evt: TagEventType<tag.MenuEventData>) {
                        if(!evt.data || !evt.data.item) return;
                        const item = evt.data.item.data;
                        switch (item.dataid) {
                            case "desktop-open":
                                var it = desktop.selectedItem;
                                if (it) {
                                    return openWith(
                                        it.data as AppArgumentsType
                                    );
                                }
                                let arg = setting.desktop.path.asFileHandle() as AppArgumentsType;
                                arg.mime = "dir";
                                arg.type = "dir";
                                return openWith(arg);
                            case "desktop-refresh":
                                return dkfetch(desktop);
                            default:
                                if (item.app) {
                                    return launch(item.app, item.args);
                                }
                        }
                    };
                    return m.show(e);
                };

                dkfetch(desktop);
                announcer.observable.on("VFS", function (d) {
                    if (["read", "publish", "download"].includes(d.data.m)) {
                        return;
                    }
                    if (
                        d.data.file.hash() === fp.hash() ||
                        d.data.file.parent().hash() === fp.hash()
                    ) {
                        return dkfetch(desktop);
                    }
                });
                return announcer.ostrigger("desktoploaded", undefined);
            };
            // mount it
            desktop.uify(undefined);
        }

        /**
         *
         *
         * @export
         */
        export function refreshDesktop(): void {
            dkfetch($(workspace)[0] as tag.FloatListTag);
        }

        /**
         *
         *
         * @export
         */
        export function login(): void {
            const scheme = $.parseHTML(schemes.login);
            $("#wrapper").append(scheme);
            $("#btlogin").click(async function () {
                const data: API.UserLoginType = {
                    username: $("#txtuser").val() as string,
                    password: $("#txtpass").val() as string,
                };
                try {
                    const d = await API.handle.login(data);
                    if (d.error) {
                        return $("#login_error").html(d.error as string);
                    }
                    return startAntOS(d.result);
                } catch (e) {
                    return $("#login_error").html("Login: server error");
                }
            });
            $("#txtpass").keyup(function (e) {
                if (e.which === 13) {
                    return $("#btlogin").click();
                }
            });
            $("#txtuser").keyup(function (e) {
                if (e.which === 13) {
                    return $("#btlogin").click();
                }
            });
        }

        /**
         *
         *
         * @export
         * @param {*} conf
         */
        export function startAntOS(conf: any): void {
            // clean up things
            OS.cleanup();
            // get setting from conf
            OS.systemSetting(conf);
            // load theme
            loadTheme(setting.appearance.theme, true);
            wallpaper(undefined);
            OS.announcer.observable.one("syspanelloaded", async function () {
                OS.announcer.observable.on("systemlocalechange", (name) =>
                    $("#syspanel")[0].update()
                );

                const ret = await API.packages.cache();
                if (ret.result) {
                    return API.packages.fetch().then(function (r) {
                        let v: API.PackageMetaType;
                        if (r.result) {
                            const result = r.result as GenericObject<
                                API.PackageMetaType
                            >;
                            for (let k in result) {
                                v = result[k];
                                v.text = v.name;
                                v.filename = k;
                                v.type = "app";
                                v.mime = "antos/app";
                                if (v.icon) {
                                    v.icon = `${v.path}/${v.icon}`;
                                }
                                if (!v.iconclass && !v.icon) {
                                    v.iconclass = "fa fa-adn";
                                }
                            }
                            setting.system.packages = result
                                ? result
                                : undefined;
                        }

                        // GUI.refreshSystemMenu()
                        // GUI.buildSystemMenu()
                        // push startup services
                        // TODO: get services list from user setting
                        pushServices(
                            (() => {
                                const result = [];
                                for (let v of 
                                    setting.system.startup.services
                                ) {
                                    result.push(v);
                                }
                                return result;
                            })()
                        ).then(function(){
                            setting.system.startup.apps.map((a) => {
                                launch(a, []);
                            });
                        })
                    });
                }
            });
            //GUI.launch "DummyApp"
            // initDM
            API.setLocale(setting.system.locale).then(() => initDM());
            Ant.OS.announcer.observable.on("error", function(d) {
                console.log(d.data.e)
            });
            Ant.OS.announcer.observable.on("fail", function(d) {
                console.log(d.data.e)
            });
        }

        export const schemes: GenericObject<string> = {};
        schemes.ws = `\
<afx-sys-panel id = "syspanel"></afx-sys-panel>
<div id = "workspace">
    <afx-apps-dock id="sysdock"></afx-apps-dock>
    <afx-float-list id = "desktop" dir="vertical" ></afx-float-list>
</div>
<afx-menu id="contextmenu" data-id="contextmenu" context="true" style="display:none;"></afx-menu>
<afx-label id="systooltip" data-id="systooltip" style="display:none;position:absolute;"></afx-label>
<textarea id="clipboard"></textarea>\
`;

        schemes.login = `\
<div id = "login_form">
    <p>Welcome to AntOS, please login</p>
    <input id = "txtuser" type = "text" value = "demo" />
    <input id = "txtpass" type = "password" value = "demo" />
    <button id = "btlogin">Login</button>
    <div id = "login_error"></div>
</div>\
`;
    }
}
