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
     * This namespace is dedicated to all APIs related to AntOS UI system,
     * these API are called AFX APIs which handle:
     * - The mouse and keyboard interaction with the UI system
     * - UI rendering
     * - Custom tags definition
     * - Load/unload system, applications and services UI
     * - System dialogs definition
     */
    export namespace GUI {
        /**
         * Enum definition of different UI locattion
         *
         * @export
         * @enum {string }
         */
        export enum ANCHOR {
            /**
             * Center top
             */
            NORTH = "NORTH",
            /**
             * Center bottom
             */
            SOUTH = "SOUTH",
            /**
             * Center left
             */
            WEST = "WEST",
            /**
             * Center right
             */
            EST = "EST",

            /**
             * Top left
             */
            NORTH_WEST = "NORTH_WEST",
            /**
             * Bottom left
             */
            SOUTH_WEST = "SOUTH_WEST",

            /**
             * Top right
             */
            NORTH_EST = "NORTH_EST",
            /**
             * Bottom right
             */
            SOUTH_EST = "SOUTH_EST",
        }
        /**
         * AntOS keyboard shortcut type definition
         *
         * @export
         * @interface ShortcutType
         */
        export interface ShortcutType {
            /**
             * Placeholder for all shortcut callbacks, example:
             * ```typescript
             *      fn_193462204.c = function() {..}
             *      // this function will be called when the hotkey `ALT-C` is triggered
             *      // fn_${"ALT".hash()} is fn_193462204
             * ```
             *
             * @memberof ShortcutType
             */
            [propName: string]: GenericObject<(e: JQuery.KeyDownEvent) => void>;
        }

        /**
         * Basic item type definition which is usually used by some UI element
         * such as list view, tree view, menu and grid view
         *
         *
         * @export
         * @interface BasicItemType
         */
        export interface BasicItemType {
            /**
             * Item text
             *
             * @type {(string | FormattedString)}
             * @memberof BasicItemType
             */
            text: string | FormattedString;

            /**
             * Item children, usually used by tree view or menu item
             * This property is keep for compatibility purposes only.
             * Otherwise, the {@link nodes} property should be used
             *
             * @type {BasicItemType[]}
             * @memberof BasicItemType
             */
            children?: BasicItemType[];
            /**
             * Item children, usually used by tree view or menu item
             *
             * @type {BasicItemType[]}
             * @memberof BasicItemType
             */
            nodes?: BasicItemType[];
            [propName: string]: any;
        }
        /**
         * Element id of the virtual desktop, used by JQuery
         */
        export var workspace: string = "#desktop";
        /**
         * Indicate whether the system is in fullscreen mode
         */
        export var fullscreen = false;
        /**
         * Reference to the current system dialog, only one dialog
         * is allowed at a time. A dialog may have sub dialog
         */
        export var dialog: BaseDialog;
        /**
         * Placeholder for system shortcuts
         */
        var shortcut: ShortcutType = {};

        /**
         * Convert an application html scheme to
         * UI elements, then insert this UI scheme to the DOM tree.
         *
         * This function renders the UI of the application before calling the
         * application's `main` function
         *
         * @export
         * @param {string} html html scheme string
         * @param {BaseModel} app reference to the target application
         * @param {(Element | string)} parent
         * The parent HTML element where the application is rendered.
         * This is usually the reference to the virtual desktop element.
         */
        export function htmlToScheme(
            html: string,
            app: BaseModel,
            parent: Element | string
        ): void {
            const scheme = $.parseHTML(html)[0];
            if (app.scheme) {
                $(app.scheme).remove();
            }
            (parent as HTMLElement).append(scheme);
            app.scheme = scheme as HTMLElement;
            app.scheme.uify(app.observable, true);
            app.main();
            app.show();
            app.observable.trigger("launched",undefined);
        }

        /**
         * Load an application scheme file then render
         * it with {@link htmlToScheme}
         *
         * @export
         * @param {string} path VFS path to the scheme file
         * @param {BaseModel} app the target application
         * @param {(HTMLElement | string)} parent The parent HTML element where the application is rendered.
         * @return {Promise<any>} a promise object
         */
        export function loadScheme(
            path: string,
            app: BaseModel,
            parent: HTMLElement | string
        ): Promise<any> {
            return new Promise(async (ok,nok) =>{
                try {
                    const x = await path.asFileHandle().read();
                    htmlToScheme(x, app, parent);
                    ok(true);
                }
                catch(e)
                {
                    nok(__e(e));
                }
            });
        }

        /**
         * Clear the current system theme
         *
         * @export
         */
        export function clearTheme(): void {
            $("head link#ostheme").attr("href", "");
            $("body").attr("theme", "");
        }

        /**
         * Load a theme based on its name, then refresh the
         * system UI theme
         *
         * @export
         * @param {string} name name of the theme e.g. `antos_dark`
         * @param {boolean} force force to clear the system theme before applying the new one
         */
        export function loadTheme(name: string, force: boolean): void {
            if (force) {
                clearTheme();
            }
            const path = `resources/themes/${name}/${name}.css`;
            $("head link#ostheme").attr("href", path);
            $("body").attr("theme", name);
        }


        /**
         * Get the system dock tag
         *
         * @export
         * @return {*}  {GUI.tag.AppDockTag}
         */
        export function systemDock(): GUI.tag.AppDockTag
        {
            return $("[data-id='sysdock']")[0] as tag.AppDockTag;
        }

        /**
         * Get the current virtual desktop
         *
         * @export
         * @return {*}  {GUI.tag.DesktopTag}
         */
        export function desktop(): GUI.tag.DesktopTag
        {
            return $(workspace)[0] as tag.DesktopTag;
        }
        /**
         * Open a system dialog.
         *
         * @export
         * @param {(BaseDialog | string)} d a dialog object or a dialog class name
         * @param {GenericObject<any>} [data] input data of the dialog, refer to each
         * dialog definition for the format of the input data
         * @returns {Promise<any>} A promise on the callback data of the dialog, refer
         * to each dialog definition for the format of the callback data
         */
        export function openDialog(
            d: string | BaseDialog,
            data: GenericObject<any>
        ): Promise<any> {
            return new Promise(function (resolve, reject) {
                if (dialog) {
                    dialog.show();
                    return resolve(undefined);
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
         * Toast notification configuration options
         *
         *
         * @export
         * @interface ToastOptions
         */
        export interface ToastOptions {
            /**
             * Where the Toast is displayed? see  {@link ANCHOR}
             *
             * @type {ANCHOR}
             * @memberof ToastOptions
             */
            location?: ANCHOR;

            /**
             * Timeout (in seconds) before the Toast disappears
             * Set this value to 0 to prevent the Toast to disappear,
             * in this case, user need to explicitly close the notification
             *
             * @type {number}
             * @memberof ToastOptions
             */
            timeout?: number;

            /**
             * AFXTag that is used to render the data
             *
             * @type {number}
             * @memberof ToastOptions
             */
            tag?: string;
        }

        /**
         * Toast notification API
         * Show a toast message on different posisition on screen, see {@link ToastOptions}
         * 
         * @export
         * @param
         * @returns
         */
        export function toast(data: any, opts?: ToastOptions,  app: application.BaseApplication = undefined): void
        {
            let notification_el = undefined;
            if(app)
            {
                notification_el = app.window.notification;
            }
            else
            {
                notification_el = $("#sys_notification")[0] as tag.NotificationTag;
            }
            let options: ToastOptions = {
                location: ANCHOR.NORTH,
                timeout: 3,
                tag: "afx-label"
            };
            if(opts)
            {
                for(const k in opts)
                {
                    options[k] = opts[k];
                }
            }
            const toast_el = $(`<afx-toast-notification>`)[0] as tag.ToastNotificationTag;
            const content_el = $(`<${options.tag}>`)[0] as AFXTag;
            $(toast_el).append(content_el);
            toast_el.uify(undefined);
            notification_el.push(toast_el, options.location);
            content_el.set(data);
            if(options.timeout && options.timeout != 0)
            {
                setTimeout(function(){
                    $(toast_el).remove();
                    clearTimeout(this);
                }, options.timeout*1000);
            }
        }

        /**
         * Find a list of applications that support a specific mime
         * type in the system packages meta-data
         *
         * @export
         * @param {string} mime the mime type
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
                    return false;
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
         * Find all applications that have services attached to it.
         * This function allows to collect all the services available
         * on the system. These services may or may not be running.
         *
         * @export
         * @returns {GenericObject<API.PackageMetaType>} result in forme of:
         * `service_name:service-meta-data` key-value pairs
         */
        export function appsWithServices(): GenericObject<API.PackageMetaType> {
            const o: GenericObject<API.PackageMetaType> = {};
            for (let k in setting.system.packages) {
                const v = setting.system.packages[k];
                if (v && v.services && v.services.length > 0) {
                    o[k] = v;
                }
            }
            return o;
        }

        /**
         * Find an launch an application using input application argument
         * such as VFS file meta-data.
         *
         * Based on the input application argument, the function will try
         * to find all applications that is compatible with that argument.
         * Three cases possible:
         * - There is no application that can handle the argument, a message will
         * be notified to user.
         * - There is one application that can handle the argument, the application
         * will be launched with the argument
         * - There are many applications that can handle the arguments, a selection
         * dialog will be popped up and allows user to select an application to launch.
         *
         * @export
         * @param {AppArgumentsType} it application argument
         * @returns {void}
         */
        export function openWith(it: AppArgumentsType): void {
            if (!it) {
                return;
            }
            if (it.type === "app" && it.app) {
                launch(it.app, []);
                return;
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
                launch(apps[0].app, [it]);
                return;
            }
            const list = apps.map((e) => ({
                text: e.name,
                app: e.app,
                icon: e.icon,
                iconclass: e.iconclass,
            }));
            openDialog("SelectionDialog", {
                title: __("Open with"),
                data: list,
            }).then((d) => launch(d.app, [it]));
        }

        /**
         * Kil all processes related to an application, reload the application
         * prototype definition and launch a new process of this application.
         *
         * This function is used only for debug purpose or used by
         * AntOSDK during in-browser application development
         *
         * @export
         * @param {string} app the application class name
         * @param {AppArgumentsType[]} args application arguments
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
            launch(app, args);
        }

        /**
         * Kill an running processes of an application, then
         * unregister the application prototype definition
         * from the {@link application} namespace.
         *
         * This process is similar to uninstall the application
         * from the current system state
         *
         * @export
         * @param {string} app
         */
        export function unloadApp(app: string, save?: boolean): void {
            PM.killAll(app, true);
            if (application[app] && application[app].style) {
                $(application[app].style).remove();
            }
            if(save)
            {
                // remove pinned application if any
                if(OS.setting.system.startup.pinned)
                    OS.setting.system.startup.pinned = OS.setting.system.startup.pinned.filter((e) => e != app);
                // remove service if it is the service
                if(OS.setting.system.startup.services)
                    OS.setting.system.startup.services = OS.setting.system.startup.services.filter((e) => e != app);
                // remove startup app if any
                if(OS.setting.system.startup.apps)
                    OS.setting.system.startup.apps = OS.setting.system.startup.apps.filter((e) => e != app);
                // refresh pinned list
                announcer.ostrigger("APP-PINNED", "APP-PINNED", undefined);
                // remove application setting
                if(OS.setting.applications[app])
                    delete OS.setting.applications[app];
                OS.API.setting()
                    .then((d) =>{
                        if(d.error)
                        {
                            announcer.oserror(
                                __("Error when save system setting {0}:{1}", app, d.error),
                                undefined);
                        }
                    })
                    .catch((e)=> {
                        announcer.oserror(
                                __("Error when save system setting {0}: {1}", app, e.toString()),
                                e);
                    });
            }
            
            delete application[app];
        }

        /**
         * Load an application if the application is not registered yet
         * in the system.
         *
         * This function fist loads and registers the application prototype
         * definition in the {@link application} namespace, then update
         * the system packages meta-data
         * 
         * First it tries to load the package with the app name is also the
         * pkgname, if its fail, it will search the app name by pkg name and load
         * it
         *
         * @param {string} app application class name
         * @returns {Promise<string>}
         */
        function loadApp(app: string): Promise<string> {
            const ann: API.AnnouncementDataType<Promise<any>> = {} as API.AnnouncementDataType<Promise<any>>;
            ann.name = "OS";
            ann.message = app;
            ann.id = Math.floor(Math.random() * 1e6);
            announcer.trigger("APP-LOADING",ann);
            return new Promise(async function (resolve, reject) {
                let path: string = undefined;
                try {
                    if(!setting.system.packages[app])
                    {
                        for(const key in setting.system.packages)
                        {
                            const pkg = setting.system.packages[key];
                            if(pkg.app == app && pkg.path)
                            {
                                path = pkg.path;
                            }
                        }
                    }
                    else if (setting.system.packages[app].path) {
                        path = setting.system.packages[app].path;
                    }
                    if(!path)
                    {
                        throw __("Unable to locate package of {0}", app).__();
                    }
                    const js = path + "/main.js";
                    const d = await js.asFileHandle().read("script");
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
                    try{
                        const css = `${path}/main.css`;
                        await css.asFileHandle().onready();
                        const stamp = new Date().timestamp();
                        const el = $("<link>", {
                            rel: "stylesheet",
                            type: "text/css",
                            href: `${API.handle.get}/${css}?stamp=${stamp}`,
                        }).appendTo("head");
                        if (application[app]) {
                            application[app].style = el[0];
                        }
                    } catch(e_1){}
                    announcer.trigger("APP-LOADED", ann);
                    return resolve(app);
                } catch (e) {
                    announcer.trigger("APP-LOAD-ERROR", ann);
                    return reject(__e(e));
                }
            });
        }

        /**
         * Create a service process.
         *
         * Services are singleton processes, there is only
         * one process of a service at a time
         *
         * @export
         * @param {string} ph
         * @param {AppArgumentsType[]} [params] service arguments
         * @returns {Promise<PM.ProcessType>}
         */
        export function pushService(ph: string, params?: AppArgumentsType[]): Promise<PM.ProcessType> {
            return new Promise(async function (resolve, reject) {
                const arr = ph.split("/");
                const srv = arr[1];
                const app = arr[0];
                try {
                    if (!application[srv]) {
                        await loadApp(app);
                        if (!application[srv]) {
                            return reject(
                                API.throwe(__("Service not found: {0}", ph))
                            );
                        }
                    }
                    const d = await PM.createProcess(
                        srv,
                        application[srv],
                        params
                    );
                    return resolve(d);
                }
                catch (e) {
                    return reject(__e(e));
                }
            });
        }

        /**
         * Synchronously start a list of services
         *
         * @export
         * @param {string[]} srvs list of service class names
         * @returns {Promise<void>}
         */
        export function pushServices(srvs: string[]): Promise<void> {
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
         * Launch an application with arguments
         *
         * @export
         * @param {string} app application class name
         * @param {AppArgumentsType[]} args application arguments
         */
        export function launch(app: string, args: AppArgumentsType[]): Promise<OS.PM.ProcessType> {
            return new Promise(async (resolve, reject) => {
                const pidactive = PM.pidactive;
                try {
                    PM.pidactive = 0;
                    if (!application[app]) {
                        // first load it
                        await loadApp(app);
                        if (!application[app]) {
                            const e = API.throwe(__("Application not found"));
                            announcer.oserror(
                                __("{0} is not an application", app),
                                e);
                            return reject(e);
                        }
                        const mt = application[app].meta;
                        // load application setting if any
                        let settings = {};
                        try
                        {
                            if(mt.path.asFileHandle().protocol === "home")
                            {
                                settings = await `${mt.path}/.settings.json`.asFileHandle().read("json");
                            }
                            else
                            {
                                // system package
                                settings = await `home:///.antos/settings/${app}.json`.asFileHandle().read("json");
                            } 
                        }
                        catch(_)
                        {
                        }
                        application[app].setting_wdg = API.watcher(settings, (o,k,v,p) => {
                            let key = k;
                            if(p.length > 0)
                            {
                                key = p[0];
                            }
                            const data: API.AnnouncementDataType<any> = {} as API.AnnouncementDataType<any>;
                            data.icon = undefined;
                            if (mt && mt.icon) {
                                data.icon = `${mt.path}/${mt.icon}`;
                            }
                            data.id = 0;
                            data.name = app;
                            data.message = key;
                            data.iconclass = mt?mt.iconclass:undefined;
                            data.u_data = undefined;
                            return announcer.trigger("APP-REGISTRY", data);
                        });
                        const p = await PM.createProcess(
                            app,
                            application[app],
                            args
                        );
                        resolve(p);
                    } else {
                        // now launch it
                        const p = await PM.createProcess(
                            app,
                            application[app],
                            args
                        );
                        resolve(p);
                    }
                }
                catch (e) {
                    announcer.osfail(
                        __("Unable to launch: {0}", app),
                        e
                    );
                    PM.pidactive = pidactive;
                    return reject(__e(e));
                }

            });
        }

        /**
         * Dock an application to the system application dock
         *
         * @export
         * @param {BaseApplication} app reference to the application process
         * @param {API.PackageMetaType} meta Application meta-data
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
                app
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
            const dock = systemDock();
            app.sysdock = dock;
            app.init();
            app.observable.one("rendered", function () {
                dock.addapp(data);
            });
        }

        /**
         * Toggle system fullscreen
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
         * Remove an application process from the system application
         * dock. This action will also exit the process
         *
         * @export
         * @param {BaseApplication} app
         * @returns
         */
        export function undock(app: application.BaseApplication) {
            return systemDock().removeapp(app);
        }

        /**
         * Attach a running service process to the system tray
         *
         * @export
         * @param {BaseService} srv reference to the running service process
         * @returns {void}
         */
        export function attachservice(srv: application.BaseService): void {
            ($("#syspanel")[0] as tag.SystemPanelTag).attachservice(srv);
            srv.init();
        }

        /**
         * Detach a running process from the system tray
         *
         * @export
         * @param {BaseService} srv reference to the running service process
         * @returns {void}
         */
        export function detachservice(srv: application.BaseService): void {
            return ($("#syspanel")[0] as tag.SystemPanelTag).detachservice(srv);
        }

        /**
         * Bind a context menu event to an AntOS element.
         *
         * This will find the fist element which defines a handle
         * named {@link contextMenuHandle} and bind the context menu
         * event to it.
         *
         * @param {JQuery.MouseEventBase} event mouse event
         * @returns {void}
         */
        function bindContextMenu(event: JQuery.MouseEventBase): void {
            var handle = function (e: HTMLElement) {
                if (e.contextmenuHandle) {
                    const m = $("#contextmenu")[0] as tag.StackMenuTag;
                    m.onmenuselect = () => { };
                    return e.contextmenuHandle(event, m);
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
         * Register a hot key and its handle in the
         * system  shortcut
         *
         * @export
         * @param {string} k the hotkey e.g. `ALT-C`
         * @param {(e: JQuery.KeyPressEvent) => void} f handle function
         * @param {boolean} force force to rebind the hotkey
         * @returns {void}
         */
        export function bindKey(
            k: string,
            f: (e: JQuery.KeyDownEvent) => void,
            force: boolean = true
        ): void {
            const arr = k.toUpperCase().split("-");
            let c = arr.pop();
            let fnk = "";
            if (arr.includes("META")) {
                fnk += "META";
            }
            if (arr.includes("CTRL")) {
                fnk += "CTRL";
            }
            if (arr.includes("ALT")) {
                fnk += "ALT";
            }
            if (arr.includes("SHIFT")) {
                fnk += "SHIFT";
            }
            if (fnk == "" && arr.length == 0 && c == "ESC") {
                fnk = "ESC";
                c = String.fromCharCode(27).toUpperCase();
            }
            if (fnk == "") {
                return;
            }
            fnk = `fn_${fnk.hash()}`;

            if (!shortcut[fnk]) {
                shortcut[fnk] = {};
            }
            if (shortcut[fnk][c] && !force) return;
            shortcut[fnk][c] = f;
        }

        /**
         * Load and apply system wallpaper from the setting object
         *
         * @export
         * @param {setting.WPSettingType} obj wallpaper setting object
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
         * Show tooltip at the current mouse position
         *
         * @param {JQuery<HTMLElement>} el The target element that has the tooltip attribute
         * @param {string} text The text to be displayed
         * @param {JQuery.MouseEventBase} e mouse event
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
                case "cb": // center bottom
                    left = offset.left + w / 2 - $(label).width() / 2;
                    top = offset.top + $(label).height() + 10;
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
         * Init the virtual desktop on boot:
         *
         * - Register listener for system hotkey
         * - Bind the system context menu handle
         * - Init and load the content of the virtual desktop
         * - Init the system tooltip event handle
         */
        function initDM(): void {
            const scheme = $.parseHTML(schemes.ws);
            $("#wrapper").append(scheme);

            announcer.one("SYS-DOCK-LOADED", () => {
                $(window).on("keydown", function (event) {
                    const dock = systemDock();
                    if (!dock) {
                        return;
                    }
                    const app = dock.selectedApp;
                    //return true unless app
                    const c = String.fromCharCode(event.which).toUpperCase();
                    let fnk = "";
                    if (event.metaKey) {
                        fnk += "META";
                    }
                    if (event.ctrlKey) {
                        fnk += "CTRL";
                    }
                    if (event.altKey) {
                        fnk += "ALT";
                    }
                    if (event.shiftKey) {
                        fnk += "SHIFT";
                    }
                    if (fnk == "" && event.which == 27) {
                        fnk = "ESC";
                    }
                    //console.log(fnk, c);
                    if (fnk == "") {
                        return;
                    }
                    fnk = `fn_${fnk.hash()}`;
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
                });
            });
            // system menu and dock
            $("#syspanel")[0].uify(undefined);
            $("#systooltip")[0].uify(undefined);
            
            const ctxmenu = $("#contextmenu")[0];
            ctxmenu.uify(undefined);
            $("#wrapper").on(OS.mobile?"longtouch":"contextmenu", (e) => bindContextMenu(e as JQuery.MouseEventBase));
            // tooltip
            $(document).on("mouseover", function (e) {
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
            // mount it
            const nottification = $("#sys_notification")[0] as tag.NotificationTag;
            nottification.uify(undefined);
            desktop().uify(undefined);
        }

        /**
         * Refresh the virtual desktop
         *
         * @export
         */
        export function refreshDesktop(): void {
            desktop().refresh();
        }

        /**
         * Show the login screen and perform the login operation.
         *
         * Once login successfully, the {@link startAntOS} will be called
         *
         * @export
         */
        export function login(): void {
            const scheme = $.parseHTML(
                schemes.login
                    .replace("[ANTOS_BUILD_ID]", OS.VERSION.build_id)
                    .replace("[ANTOS_VERSION]", OS.VERSION.version_string)
            );
            $("#wrapper").append(scheme);
            $("#login_form")[0].uify(undefined);
            ($("#btlogin")[0] as tag.ButtonTag).onbtclick = async function () {
                const data: API.UserLoginType = {
                    username: $("#txtuser").val() as string,
                    password: $("#txtpass").val() as string,
                };
                const err_label = $("#login_error")[0] as tag.LabelTag;
                try {
                    const d = await API.handle.login(data);
                    if (d.error) {
                        err_label.iconclass = "bi bi-exclamation-diamond-fill";
                        return err_label.text = d.error as string;
                    }
                    return startAntOS(d.result);
                } catch (e) {
                    err_label.iconclass = "bi bi-bug-fill";
                    return err_label.text = __("Login: server error");
                }
            };
            ($("#txtpass")[0] as tag.InputTag).on("keyup", function (e) {
                if (e.which === 13) {
                    return $("#btlogin button").trigger("click");
                }
            });
            ($("#txtuser")[0] as tag.InputTag).on("keyup",function (e) {
                if (e.which === 13) {
                    return $("#btlogin button").trigger("click");
                }
            });
        }

        /**
         * Start AntOS after a successful login.
         *
         * This function performs the following operations:
         *
         * - System cleanup
         * - Apply system setting
         * - Load desktop wallpaper and the current theme from the system setting
         * - Load system package meta-data
         * - Load and apply system locale and language
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
            OS.announcer.one("SYS-PANEL-LOADED", async function () {
                OS.announcer.on("SYSTEM-LOCALE-CHANGED", (_) =>
                    $("#syspanel")[0].update()
                );

                const ret = await API.packages.cache();
                if (ret.result) {
                    return API.packages.fetch().then(function (r) {
                        let v: API.PackageMetaType;
                        if (r.result) {
                            const result = r.result as GenericObject<API.PackageMetaType>;
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
                        // load services + VFSX
                        Promise.all(
                            [
                                OS.API.VFS.loadVFSX(true),
                                pushServices(
                                    (() => {
                                        const result = [];
                                        for (let v of setting.system.startup.services) {
                                            result.push(v);
                                        }
                                        return result;
                                    })()
                                )
                            ])
                            .then(function () {
                                setting.system.startup.apps.map((a) => {
                                    launch(a, []);
                                });
                            });
                    });
                }
            });
            // initDM
            API.setLocale(setting.system.locale).then(() => initDM());
            Ant.OS.announcer.on("error", function (d) {
                console.log(d.u_data);
            });
            Ant.OS.announcer.on("fail", function (d) {
                console.log(d.u_data);
            });
        }
        /**
         * HTML schemes used by the system:
         * - The login screen scheme
         * - The workspace including:
         *  - System panel
         *  - Virtual desktop
         *  - Context menu
         *  - System tooltip
         */
        export const schemes: GenericObject<string> = {};
        schemes.ws = `\
<afx-sys-panel id = "syspanel"></afx-sys-panel>
<div id = "workspace">
    <afx-desktop id = "desktop" dir="column" ></afx-desktop>
    <afx-notification id="sys_notification" ></afx-notification>
</div>
<afx-stack-menu id="contextmenu" data-id="contextmenu" context="true" style="display:none;"></afx-stack-menu>
<afx-label id="systooltip" data-id="systooltip" style="display:none;position:absolute;"></afx-label>
<textarea id="clipboard"></textarea>\
`;

        schemes.login = `\
<afx-vbox id = "login_form">
    <afx-label data-height="35" text="Welcome to AntOS, please login"></afx-label>
    <afx-vbox padding = "10">
        <afx-input data-height="52" id = "txtuser" type = "text" value = "demo" label="User name"></afx-input>
        <div data-height="10"></div>
        <afx-input data-height="52" id = "txtpass" type = "password" value = "demo" label="Password"></afx-input>
        <div data-height="10"></div>
        <afx-hbox>
            <afx-label id = "login_error"></afx-label>
            <afx-button id = "btlogin" text="Login" iconclass = "bi bi-box-arrow-in-right" data-width="content"></afx-button>
        </afx-hbox>
    </afx-vbox>
</afx-vbox>
<div id = "antos_build_id"><a href="${OS.REPOSITORY}/tree/[ANTOS_BUILD_ID]">AntOS v[ANTOS_VERSION]</div>\
`;
    }
}
