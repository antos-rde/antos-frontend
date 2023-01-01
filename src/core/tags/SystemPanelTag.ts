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
                 * Flag indicate where the selected application shall be openned
                 *
                 * @private
                 * @type {boolean}
                 * @memberof SystemPanelTag
                 */
                private _prevent_open: boolean;
                /**
                 * Store the current attached service
                 *
                 * @private
                 * @type {number[]}
                 * @memberof SystemPanelTag
                 */
                private _services: application.BaseService[];

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
                        text: "",
                        //iconclass: "fa fa-circle",
                        icon: "os://resources/themes/system/icons/antos-32x32.png"
                    };
                    this._view = false;
                    this._pending_task = [];
                    this._loading_toh = undefined;
                    this.app_list= [];
                    this._services = [];
                    this._prevent_open = false;
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
                    this._services.unshift(s);
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
                    if(this._prevent_open)
                    {
                        this._prevent_open = false;
                        return;
                    }
                    const applist = this.refs.applist as ListViewTag;
                    const el = applist.selectedItem;
                    if (!el) {
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
                    const catlist = this.refs.catlist as TabBarTag;
                    switch (e.which) {
                        case 27:
                            // escape key
                            return this.toggle(false);

                        case 37:
                            this._prevent_open = true;
                            applist.selectPrev();
                            return e.preventDefault();
                        case 38:
                            return e.preventDefault();
                        case 39:
                            this._prevent_open = true;
                            applist.selectNext();
                            return e.preventDefault();
                        case 40:
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
                    const index = this._services.indexOf(s);
                    this._services.splice(index, 1);
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
                                    el: "afx-button",
                                    ref: "osmenu",
                                    class: "afx-panel-os-menu",
                                },
                                {
                                    el: "afx-apps-dock",
                                    ref: "sysdock",
                                    id: "sysdock"
                                },
                                {
                                    el: "afx-button",
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
                                    el: "afx-vbox",
                                    children: [
                                        {
                                            el: "afx-tab-bar",
                                            id: "catlist",
                                            ref: "catlist",
                                            height:45
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
                                    height: 40,
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
                    let catlist_el = (this.refs.catlist as tag.TabBarTag);
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
                    cat_list_data.push({
                        text: "__(All)",
                        iconclass: "bi bi-gear-wide"
                    });
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
                    catlist_el.items = cat_list_data;
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
                        $(this.refs.search).focus();
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

                private show_systray(): void
                {
                    const ctxmenu = $("#contextmenu")[0] as tag.StackMenuTag;
                    ctxmenu.hide();
                    ctxmenu.nodes = this._services;
                    $(ctxmenu)
                        .css("right", 0)
                        .css("bottom", $(this).height());
                    ctxmenu.show();
                }

                /**
                 * Mount the tag bind some basic event
                 *
                 * @protected
                 * @memberof SystemPanelTag
                 */
                protected mount(): void {
                    const systray = this.refs.systray as GUI.tag.ButtonTag;
                    (this.refs.osmenu as ButtonTag).set(this._osmenu);
                    this._cb = (e) => {
                        if (
                            !$(e.target).closest($(this.refs.overlay)).length &&
                            !$(e.target).closest(this.refs.osmenu).length
                        ) {
                            return this.toggle(false);
                        }
                    };
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
                    (this.refs.osmenu as ButtonTag).onbtclick = (e) => {
                        if($(this.refs.overlay).is(":hidden"))
                        {
                            this.toggle(true);
                        }
                        else
                        {
                            this.toggle(false);
                        }
                    };

                    $(this.refs.search).on("keyup", (e) => {
                        return this.search(e);
                    });

                    (this.refs.applist as ListViewTag).onlistselect = (_) => {
                        return this.open();
                    };
                    Ant.OS.GUI.bindKey("CTRL- ", (e) => {
                        if (this._view === false) {
                            return this.toggle(true);
                        } else {
                            return this.toggle(false);
                        }
                    });
                    const catlist = (this.refs.catlist as tag.TabBarTag);
                    catlist.ontabselect = (e) => {
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
                        .hide();
                    this.refs.osmenu.contextmenuHandle = (e, m) => { };
                    systray.contextmenuHandle = (e, m) => { };
                    this.refs.panel.contextmenuHandle = (e, m) => { };
                    announcer.on("loading", (o: API.AnnouncementDataType<number>) => {
                        if(o.u_data != 0)
                        {
                            return;
                        }
                        if(this._pending_task.length == 0)
                        {
                            $(this.refs.panel).addClass("loading");
                            systray.iconclass = "fa-spin fa fa-cog";
                        }
                        this._pending_task.push(o.id);
                            
                        $(GUI.workspace).css("cursor", "wait");
                    });
                    systray.iconclass = "bi bi-sliders";
                    systray.onbtclick = (e) => {
                        e.data.stopPropagation();
                        this.show_systray();
                    };
                    announcer.on("loaded", (o: API.AnnouncementDataType<number>) => {
                        const i = this._pending_task.indexOf(o.id);
                        if (i >= 0) {
                            this._pending_task.splice(i, 1);
                        }
                        if (this._pending_task.length === 0) {
                            // set time out
                            systray.iconclass = "bi bi-sliders";
                            if(!this._loading_toh)
                                this._loading_toh = setTimeout(() => this.animation_check(),1000);
                        }
                    });
                    announcer.on("desktopresize", (e) => {
                        this.calibrate();
                    });
                    Ant.OS.announcer.trigger("syspanelloaded", undefined);
                }
            }

            define("afx-sys-panel", SystemPanelTag);
        }
    }
}
