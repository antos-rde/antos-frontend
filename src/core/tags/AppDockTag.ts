namespace OS {
    export namespace GUI {
        /**
         *
         * Interface for an application dock item
         *
         * @export
         * @interface AppDockItemType
         */
        export interface AppDockItemType {
            /**
             * Reference to the application process represented
             * by the dock item
             *
             * @type {application.BaseApplication}
             * @memberof AppDockItemType
             */
            app: application.BaseApplication;

            /**
             * Reference to the DOM element of
             * the owner dock item
             *
             * @type {AFXTag}
             * @memberof AppDockItemType
             */
            domel?: AFXTag;
            [propName: string]: any;
        }

        export namespace tag {
            /**
             * This class define the AntOS system application dock tag
             *
             * @export
             * @class AppDockTag
             * @extends {AFXTag}
             */
            export class AppDockTag extends AFXTag {
                /**
                 * variable holds the application select event
                 * callback handle
                 *
                 * @private
                 * @type {TagEventCallback<any>}
                 * @memberof AppDockTag
                 */
                private _onappselect: TagEventCallback<any>;

                /**
                 * Items data of the dock
                 *
                 * @private
                 * @type {AppDockItemType[]}
                 * @memberof AppDockTag
                 */
                private _items: AppDockItemType[];

                /**
                 * Reference to the currently select application
                 * process in the dock
                 *
                 * @private
                 * @type {application.BaseApplication}
                 * @memberof AppDockTag
                 */
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
                 * Implementation of the abstract function: Update the current tag.
                 * It do nothing for this tag
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof AppDockTag
                 */
                protected reload(d?: any): void {
                    let app: application.BaseApplication = d as application.BaseApplication;
                    if(!app)
                    {
                        return;
                    }
                    let i = -1;
                    const iterable = this.items;
                    for (let k = 0; k < iterable.length; k++) {
                        const v = iterable[k];
                        if (v.app.pid === app.pid) {
                            i = k;
                            break;
                        }
                    }
                    if (i !== -1) {
                        $(this.items[i].domel).attr("tooltip", `cr:${app.title()}`);
                    }
                }

                /**
                 * Init the tag before mounting
                 *
                 * @protected
                 * @memberof AppDockTag
                 */
                protected init(): void {
                    this._items = [];
                }

                /**
                 * The tag layout, it is empty on creation but elements will
                 * be added automatically to it in operation
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof AppDockTag
                 */
                protected layout(): TagLayoutType[] {
                    return [];
                }

                /**
                 * getter to get the dock items
                 *
                 * @readonly
                 * @type {AppDockItemType[]}
                 * @memberof AppDockTag
                 */
                get items(): AppDockItemType[] {
                    return this._items;
                }

                /**
                 * Setter:
                 *
                 * set the selected application in the dock
                 * this will trigger two event:
                 * - `focus`: on the selected application
                 * - `blur`: on all other applications on the dock
                 *
                 * Getter:
                 *
                 *  Get the current selected application
                 * on the dock
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

                get selectedApp(): application.BaseApplication {
                    return this._selectedApp;
                }

                /**
                 * When a new application process is created, this function
                 * will be called to add new application entry to the dock.
                 * The added application will becomes the current selected
                 * application
                 *
                 * @param {AppDockItemType} item an application dock item entry
                 * @memberof AppDockTag
                 */
                newapp(item: AppDockItemType): void {
                    this.items.push(item);
                    const el = $("<afx-button>");
                    const bt = el[0] as ButtonTag;
                    el.appendTo(this);
                    el[0].uify(this.observable);
                    bt.set(item);
                    bt.data = item.app;
                    item.domel = bt;
                    $(bt).attr("tooltip", `cr:${item.app.title()}`);
                    bt.onbtclick = (e) => {
                        e.id = this.aid;
                        //e.data.item = item;
                        this._onappselect(e);
                        item.app.show();
                    };
                    this.selectedApp = item.app;
                }

                /**
                 * Delete and application entry from the dock.
                 * This function will be called when an application
                 * is exit
                 *
                 * @param {BaseApplication} a the application to be removed from the dock
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
                 * Mount the current dock tag
                 *
                 * @protected
                 * @memberof AppDockTag
                 */
                protected mount(): void {
                    this.contextmenuHandle = (e, m) => {
                        if (e.target === this) {
                            return;
                        }
                        const bt = ($(e.target).closest(
                            "afx-button"
                        )[0] as any) as ButtonTag;
                        const app = bt.data as application.BaseApplication;
                        m.items = [
                            { text: "__(New window)", dataid: "new" },
                            { text: "__(Show)", dataid: "show" },
                            { text: "__(Hide)", dataid: "hide" },
                            { text: "__(Close)", dataid: "quit" },
                        ];
                        m.onmenuselect = function (evt) {
                            const item = evt.data.item.data;
                            if (app[item.dataid]) {
                                return app[item.dataid]();
                            }
                            else
                            {
                                switch (item.dataid) {
                                    case "new":
                                        GUI.launch(app.name, []);
                                        break;
                                
                                    default:
                                        break;
                                }
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
