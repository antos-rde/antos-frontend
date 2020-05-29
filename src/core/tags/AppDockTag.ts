/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
namespace OS {
    export namespace GUI {
        /**
         *
         *
         * @export
         * @interface AppDockItemType
         */
        export interface AppDockItemType {
            app: application.BaseApplication;
            domel?: AFXTag;
            [propName: string]: any;
        }

        export namespace tag {
            /**
             *
             *
             * @export
             * @class AppDockTag
             * @extends {AFXTag}
             */
            export class AppDockTag extends AFXTag {
                
                private _onappselect: TagEventCallback;
                private _items: AppDockItemType[];
                private _selectedApp: application.BaseApplication;

                /**
                 *Creates an instance of AppDockTag.
                 * @memberof AppDockTag
                 */
                constructor() {
                    super();
                    this._onappselect = (e) => {};
                }

                /**
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof AppDockTag
                 */
                protected reload(d?: any): void {
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof AppDockTag
                 */
                protected init(): void {
                    this._items = [];
                }

                /**
                 *
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof AppDockTag
                 */
                protected layout(): TagLayoutType[] {
                    return [];
                }

                /**
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof AppDockTag
                 */
                protected refresh(d?: any): void {}

                /**
                 *
                 *
                 * @readonly
                 * @type {AppDockItemType[]}
                 * @memberof AppDockTag
                 */
                get items(): AppDockItemType[] {
                    return this._items;
                }

                /**
                 *
                 *
                 * @memberof AppDockTag
                 */
                set selectedApp(v: application.BaseApplication) {
                    this._selectedApp = v;
                    let el = undefined;
                    for (let it of this.items) {
                        it.app.blur();
                        $(it.domel).removeClass();
                        if (v && v === it.app) {
                            el = it.domel;
                        }
                    }
                    if (!el) {
                        return;
                    }
                    $(el).addClass("selected");
                    ($(Ant.OS.GUI.workspace)[0] as FloatListTag).unselect();
                }

                /**
                 *
                 *
                 * @type {BaseApplication}
                 * @memberof AppDockTag
                 */
                get selectedApp(): application.BaseApplication {
                    return this._selectedApp;
                }

                /**
                 *
                 *
                 * @param {AppDockItemType} item
                 * @memberof AppDockTag
                 */
                newapp(item: AppDockItemType): void {
                    this.items.push(item);
                    const el = $("<afx-button>");
                    const bt = el[0] as ButtonTag;
                    el.appendTo(this);
                    el[0].uify(this.observable);
                    bt.set(item);
                    el.attr("tooltip", `cr:${item.app.title()}`);
                    item.domel = bt;
                    bt.onbtclick = (e) => {
                        e.id = this.aid;
                        e.data.item = item;
                        item.app.show();
                    };
                    this.selectedApp = item.app;
                }

                /**
                 *
                 *
                 * @param {BaseApplication} a
                 * @memberof AppDockTag
                 */
                removeapp(a: application.BaseApplication): void {
                    let i = -1;
                    const iterable = this.items;
                    for (let k = 0; k < iterable.length; k++) {
                        const v = iterable[k];
                        if (v.app.pid === a.pid) {
                            i = k;
                            break;
                        }
                    }

                    if (i !== -1) {
                        delete this.items[i].app;
                        this.items.splice(i, 1);
                        $($(this).children()[i]).remove();
                    }
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof AppDockTag
                 */
                protected mount(): void {
                    this.contextmenuHandle = (e, m) => {
                        if (e.target === this) {
                            return;
                        }
                        const bt = $(e.target).closest("afx-button");
                        const app = bt[0].get("app");
                        m.items = [
                            { text: "__(Show)", dataid: "show" },
                            { text: "__(Hide)", dataid: "hide" },
                            { text: "__(Close)", dataid: "quit" },
                        ];
                        m.onmenuselect = function (evt) {
                            const item = evt.data.item.get("data");
                            if (app[item.dataid]) {
                                return app[item.dataid]();
                            }
                        };
                        return m.show(e);
                    };
                    announcer.trigger("sysdockloaded", undefined);
                }
            }
            define("afx-apps-dock", AppDockTag);
        }
    }
}
