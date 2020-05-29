/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
namespace OS {
    export namespace GUI {
        export namespace tag {

            /**
             *
             *
             * @export
             * @class SystemPanelTag
             * @extends {AFXTag}
             */
            export class SystemPanelTag extends AFXTag {
                private _osmenu: GenericObject<string | FormatedString>;
                private _view: boolean;
                private _cb: (e: JQuery.MouseEventBase) => void;

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
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof SystemPanelTag
                 */
                protected init(): void {}

                /**
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof SystemPanelTag
                 */
                protected reload(d?: any): void {}

                /**
                 *
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
                 *
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
                 *
                 *
                 * @private
                 * @param {JQuery.KeyboardEventBase} e
                 * @returns {void}
                 * @memberof SystemPanelTag
                 */
                private search(e: JQuery.KeyboardEventBase): void {
                    const applist = this.refs.applist as ListViewTag;
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
                            var text = (this.refs.search as HTMLInputElement)
                                .value;
                            if (!(text.length >= 3)) {
                                return this.refreshAppList();
                            }
                            var result = Ant.OS.API.search(text);
                            if (result.length === 0) {
                                return;
                            }
                            applist.data = result;
                    }
                }

                /**
                 *
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
                 *
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
                                    el: "afx-list-view",
                                    id: "applist",
                                    ref: "applist",
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
                 *
                 *
                 * @private
                 * @memberof SystemPanelTag
                 */
                private refreshAppList(): void {
                    let k: string, v: API.PackageMetaType;
                    const list = [];
                    for (k in Ant.OS.setting.system.packages) {
                        v = Ant.OS.setting.system.packages[k];
                        if (v && v.app) {
                            list.push(v);
                        }
                    }
                    for (k in Ant.OS.setting.system.menu) {
                        v = Ant.OS.setting.system.menu[k];
                        list.push(v);
                    }
                    list.sort(function (a, b) {
                        if (a.text < b.text) {
                            return -1;
                        } else if (a.text > b.text) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    (this.refs.applist as ListViewTag).data = list;
                }

                /**
                 *
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
                        $(document).unbind("click", this._cb);
                    }
                }

                /**
                 *
                 *
                 * @memberof SystemPanelTag
                 */
                calibrate(): void {
                    (this.refs.overlay as OverlayTag).height = `${
                        $(window).height() - $(this.refs.panel).height()
                    }px`;
                }

                /**
                 *
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
                            return $(this.refs.search).focus();
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

                    $(this.refs.search).keyup((e) => {
                        return this.search(e);
                    });

                    $(this.refs.applist).click((e) => {
                        return this.open();
                    });
                    Ant.OS.GUI.bindKey("CTRL- ", (e) => {
                        if (this._view === false) {
                            return this.toggle(true);
                        } else {
                            return this.toggle(false);
                        }
                    });
                    Ant.OS.announcer.trigger("syspanelloaded", undefined);
                    $(this.refs.overlay)
                        .css("left", 0)
                        .css("top", `${$(this.refs.panel).height()}px`)
                        .css("bottom", "0")
                        .hide();
                }
            }

            define("afx-sys-panel", SystemPanelTag);
        }
    }
}
