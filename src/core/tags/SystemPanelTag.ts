namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * A system panel contains the following elements:
             * - Spotlight to access to applications menu
             * - Current focused application menu
             * - System tray for all running services running in background
             *
             * @export
             * @class SystemPanelTag
             * @extends {AFXTag}
             */
            export class SystemPanelTag extends AFXTag {
                /**
                 * Reference to spotlight data
                 *
                 * @private
                 * @type {(GenericObject<string | FormattedString>)}
                 * @memberof SystemPanelTag
                 */
                private _osmenu: GenericObject<string | FormattedString>;

                /**
                 * Placeholder indicates whether the spotlight is currently shown
                 *
                 * @private
                 * @type {boolean}
                 * @memberof SystemPanelTag
                 */
                private _view: boolean;

                /**
                 * Store pending loading task
                 *
                 * @private
                 * @type {number[]}
                 * @memberof SystemPanelTag
                 */
                private _pending_task: number[];

                /**
                 * Loading animation check timeout
                 *
                 * @memberof SystemPanelTag
                 */
                private _loading_toh: any;
                /**
                 * Place holder for a private callback function
                 *
                 * @private
                 * @memberof SystemPanelTag
                 */
                private _cb: (e: JQuery.MouseEventBase) => void;


                /**
                 * Place holder for system app list
                 *
                 * @private
                 * @type {GenericObject<any>[]}
                 * @memberof SystemPanelTag
                 */
                private app_list: GenericObject<any>[];

                /**
                 *Creates an instance of SystemPanelTag.
                 * @memberof SystemPanelTag
                 */
                constructor() {
                    super();
                    this._osmenu = {
                        text: __("Start"),
                        iconclass: "fa fa-circle",
                    };
                    this._view = false;
                    this._pending_task = [];
                    this._loading_toh = undefined;
                    this.app_list= [];
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof SystemPanelTag
                 */
                protected init(): void { }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof SystemPanelTag
                 */
                protected reload(d?: any): void { }

                /**
                 * Attach a service to the system tray on the pannel,
                 * this operation is performed when a service is started
                 *
                 * @param {BaseService} s
                 * @returns
                 * @memberof SystemPanelTag
                 */
                attachservice(s: application.BaseService) {
                    (this.refs.systray as MenuTag).unshift(s);
                    return s.attach(this.refs.systray);
                }

                /**
                 * Launch the selected application from the spotlight
                 * applications list
                 *
                 * @private
                 * @returns {void}
                 * @memberof SystemPanelTag
                 */
                private open(): void {
                    const applist = this.refs.applist as ListViewTag;
                    const el = applist.selectedItem;
                    if (!el) {
                        return;
                    }
                    if (!el.data || el.data.dataid === "header") {
                        return;
                    }
                    this.toggle(false);
                    // launch the app or open the file
                    Ant.OS.GUI.openWith(el.data as AppArgumentsType);
                    applist.unselect();
                }

                /**
                 * Perform spotlight search operation on keyboard event
                 *
                 * @private
                 * @param {JQuery.KeyboardEventBase} e
                 * @returns {void}
                 * @memberof SystemPanelTag
                 */
                private search(e: JQuery.KeyboardEventBase): void {
                    const applist = this.refs.applist as ListViewTag;
                    const catlist = this.refs.catlist as ListViewTag;
                    switch (e.which) {
                        case 27:
                            // escape key
                            return this.toggle(false);

                        case 37:
                            return e.preventDefault();
                        case 38:
                            applist.selectPrev();
                            return e.preventDefault();
                        case 39:
                            return e.preventDefault();
                        case 40:
                            applist.selectNext();
                            return e.preventDefault();
                        case 13:
                            e.preventDefault();
                            return this.open();
                        default:
                            catlist.selected = 0;
                            var text = (this.refs.search as HTMLInputElement)
                                .value;
                            if (!(text.length >= 3)) {
                                (this.refs.applist as ListViewTag).data = this.app_list;
                                (this.refs.applist as ListViewTag).selected = -1;
                                return;
                            }
                            var result = Ant.OS.API.search(text);
                            if (result.length === 0) {
                                return;
                            }
                            applist.data = result;
                    }
                }

                /**
                 * detach a service from the system tray of the panel.
                 * This function is called when the corresponding running
                 * service is killed
                 *
                 * @param {BaseService} s
                 * @memberof SystemPanelTag
                 */
                detachservice(s: application.BaseService): void {
                    (this.refs.systray as MenuTag).delete(
                        s.domel as MenuEntryTag
                    );
                }

                /**
                 * Layout definition of the panel
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof SystemPanelTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "div",
                            ref: "panel",
                            children: [
                                {
                                    el: "afx-menu",
                                    ref: "osmenu",
                                    class: "afx-panel-os-menu",
                                },
                                {
                                    el: "afx-menu",
                                    ref: "pinned",
                                    class: "afx-panel-os-pinned-app",
                                },
                                {
                                    el: "afx-menu",
                                    id: "appmenu",
                                    ref: "appmenu",
                                    class: "afx-panel-os-app",
                                },
                                {
                                    el: "afx-menu",
                                    id: "systray",
                                    ref: "systray",
                                    class: "afx-panel-os-stray",
                                },
                            ],
                        },
                        {
                            el: "afx-overlay",
                            id: "start-panel",
                            ref: "overlay",
                            children: [
                                {
                                    el: "afx-hbox",
                                    height: 30,
                                    children: [
                                        {
                                            el: "div",
                                            width: 30,
                                            id: "searchicon",
                                        },
                                        { el: "input", ref: "search" },
                                    ],
                                },
                                {
                                    el: "afx-hbox",
                                    children: [
                                        {
                                            el: "afx-list-view",
                                            id: "catlist",
                                            ref: "catlist",
                                            width:"40%"
                                        },
                                        {
                                            el: "afx-resizer",
                                            width: 3,
                                        },
                                        {
                                            el: "afx-list-view",
                                            id: "applist",
                                            ref: "applist",
                                        }
                                    ]
                                },
                                {
                                    el: "afx-hbox",
                                    id: "btlist",
                                    height: 30,
                                    children: [
                                        {
                                            el: "afx-button",
                                            ref: "btscreen",
                                            tooltip: __("ct:Toggle fullscreen"),
                                        },
                                        {
                                            el: "afx-button",
                                            ref: "btuser",
                                            tooltip: __(
                                                "ct:User: {0}",
                                                Ant.OS.setting.user.username
                                            ),
                                        },
                                        {
                                            el: "afx-button",
                                            ref: "btlogout",
                                            tooltip: __("ct:Logout"),
                                        },
                                    ],
                                },
                            ],
                        },
                    ];
                }

                /**
                 * Refresh applications list on the spotlight widget
                 * from system packages meta-data
                 *
                 * @private
                 * @memberof SystemPanelTag
                 */
                private refreshAppList(): void {
                    let catlist_el = (this.refs.catlist as tag.ListViewTag);
                    let k: string, v: API.PackageMetaType;
                    const catlist = new Set();
                    this.app_list = [];
                    for (k in Ant.OS.setting.system.packages) {
                        v = Ant.OS.setting.system.packages[k];
                        if (v && v.app) {
                            this.app_list.push(v);
                            catlist.add(v.category.__());
                        }
                    }
                    for (k in Ant.OS.setting.system.menu) {
                        v = Ant.OS.setting.system.menu[k];
                        this.app_list.push(v);
                    }
                    this.app_list.sort(function (a, b) {
                        if (a.text < b.text) {
                            return -1;
                        } else if (a.text > b.text) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    // build up the category menu
                    const cat_list_data = [];
                    cat_list_data.push(OS.setting.applications.categories[0]);
                    (OS.setting.applications.categories as Array<GenericObject<any>>)
                        .forEach((v) =>{
                            if(catlist.has(v.text.__()))
                            {
                                cat_list_data.push(v);
                                catlist.delete(v.text.__());
                            }
                        })
                    // put the remainder to the data
                    catlist.forEach((c) => {
                        cat_list_data.push({
                            text: c,
                            iconclass: "bi bi-gear-wide"
                        });
                    });
                    catlist_el.data = cat_list_data;
                    catlist_el.selected = 0;
                }

                /**
                 * Show/hide the spotlight
                 *
                 * @private
                 * @param {boolean} flag
                 * @memberof SystemPanelTag
                 */
                private toggle(flag: boolean): void {
                    this._view = flag;
                    if (flag) {
                        $(this.refs.overlay).show();
                        this.refreshAppList();

                        this.calibrate();
                        $(document).on("click", this._cb);
                        (this.refs.search as HTMLInputElement).value = "";
                        $(this.refs.search).trigger("focus");
                    } else {
                        $(this.refs.overlay).hide();
                        $(document).off("click", this._cb);
                    }
                }

                /**
                 * Calibrate the spotlight widget
                 *
                 * @memberof SystemPanelTag
                 */
                calibrate(): void {
                    (this.refs.overlay as OverlayTag).height = `${$(window).height() - $(this.refs.panel).height()
                        }px`;
                }


                /**
                 * Refresh the pinned applications menu
                 *
                 * @private
                 * @memberof SystemPanelTag
                 */
                private RefreshPinnedApp(): void
                {
                    if(!setting.system.startup.pinned)
                            return;
                    (this.refs.pinned as GUI.tag.MenuTag).items = 
                    setting.system.startup.pinned
                        .filter((el) =>{
                            const app = setting.system.packages[el];
                            return app && app.app
                        })
                        .map((name) => {
                            const app = setting.system.packages[name];
                            return { 
                                icon: app.icon,
                                iconclass: app.iconclass,
                                app: app.app,
                                tooltip: `cb:${app.name}`
                            };
                        });
                }

                /**
                 * Check if the loading tasks ended,
                 * if it the case, stop the animation
                 *
                 * @private
                 * @memberof SystemPanelTag
                 */
                private animation_check(): void {
                    if(this._pending_task.length === 0)
                    {
                         $(this.refs.panel).removeClass("loading");
                        $(GUI.workspace).css("cursor", "auto");
                    }
                    if(this._loading_toh)
                        clearTimeout(this._loading_toh);
                    this._loading_toh = undefined;
                }
                /**
                 * Mount the tag bind some basic event
                 *
                 * @protected
                 * @memberof SystemPanelTag
                 */
                protected mount(): void {
                    (this.refs.osmenu as MenuTag).items = [this._osmenu];
                    this._cb = (e) => {
                        if (
                            !$(e.target).closest($(this.refs.overlay)).length &&
                            !$(e.target).closest(this.refs.osmenu).length
                        ) {
                            return this.toggle(false);
                        } else {
                            return $(this.refs.search).trigger("focus");
                        }
                    };
                    $(this.refs.appmenu).css("z-index", 1000000);
                    $(this.refs.systray).css("z-index", 1000000);
                    (this.refs.btscreen as ButtonTag).set({
                        iconclass: "fa fa-tv",
                        onbtclick: (e) => {
                            this.toggle(false);
                            return Ant.OS.GUI.toggleFullscreen();
                        },
                    });
                    (this.refs.btuser as ButtonTag).set({
                        iconclass: "fa fa-user-circle-o",
                        onbtclick: (e) => {
                            this.toggle(false);
                            return Ant.OS.GUI.openDialog(
                                "InfoDialog",
                                Ant.OS.setting.user
                            );
                        },
                    });
                    (this.refs.btlogout as ButtonTag).set({
                        iconclass: "fa fa-power-off",
                        onbtclick: (e) => {
                            this.toggle(false);
                            return Ant.OS.exit();
                        },
                    });
                    (this.refs.osmenu as MenuTag).onmenuselect = (e) => {
                        return this.toggle(true);
                    };

                    $(this.refs.search).on("keyup", (e) => {
                        return this.search(e);
                    });

                    $(this.refs.applist).on("click", (e) => {
                        return this.open();
                    });
                    Ant.OS.GUI.bindKey("CTRL- ", (e) => {
                        if (this._view === false) {
                            return this.toggle(true);
                        } else {
                            return this.toggle(false);
                        }
                    });
                    const catlist = (this.refs.catlist as tag.ListViewTag);
                    catlist.onlistselect = (e) => {
                        const applist = (this.refs.applist as ListViewTag);
                        if(catlist.selected === 0)
                        {
                            applist.data = this.app_list;
                        }
                        else
                        {
                            // filter app by data
                            applist.data = this.app_list.filter((el) =>{
                                return el.category.__() === e.data.item.data.text.__();
                            })
                        }
                        applist.selected = -1;
                    };
                    $(this.refs.overlay)
                        .css("left", 0)
                        .css("top", `${$(this.refs.panel).height()}px`)
                        .css("bottom", "0")
                        .hide();
                    (this.refs.pinned as GUI.tag.MenuTag).onmenuselect = (e) => {
                        const app = e.data.item.data.app;
                        if(!app)
                            return;
                        GUI.launch(app, []);
                    };
                    this.refs.appmenu.contextmenuHandle = (e, m) => { }
                    this.refs.osmenu.contextmenuHandle = (e, m) => { }
                    this.refs.systray.contextmenuHandle = (e, m) => { }
                    this.refs.pinned.contextmenuHandle = (e, m) => { }
                    this.refs.panel.contextmenuHandle = (e, m) => {
                        let menu = [
                            { text: __("Applications and services setting"), dataid: "app&srv" }
                        ];
                        m.items = menu;
                        m.onmenuselect = function (
                            evt: TagEventType<tag.MenuEventData>
                        ) {
                            GUI.launch("Setting",[]);
                        }
                        m.show(e);
                    };
                    announcer.observable.on("app-pinned", (d) => {
                        this.RefreshPinnedApp();
                    });
                    announcer.observable.on("loading", (o) => {
                        this._pending_task.push(o.id);
                        if(!$(this.refs.panel).hasClass("loading"))
                            $(this.refs.panel).addClass("loading");
                        $(GUI.workspace).css("cursor", "wait");
                    });
    
                    announcer.observable.on("loaded", (o) => {
                        const i = this._pending_task.indexOf(o.id);
                        if (i >= 0) {
                            this._pending_task.splice(i, 1);
                        }
                        if (this._pending_task.length === 0) {
                            // set time out
                            if(!this._loading_toh)
                                this._loading_toh = setTimeout(() => this.animation_check(),1000);
                        }
                    });
                    this.RefreshPinnedApp();
                    Ant.OS.announcer.trigger("syspanelloaded", undefined);
                }
            }

            define("afx-sys-panel", SystemPanelTag);
        }
    }
}
