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
                 * Cache of touch event
                 * 
                 * @private
                 * @meberof AppDockTag
                 */
                private _previous_touch: {x: number, y: number};
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
                 * @type {AppDockItemType}
                 * @memberof AppDockTag
                 */
                private _selectedItem: AppDockItemType;

                /**
                 *Creates an instance of AppDockTag.
                 * @memberof AppDockTag
                 */
                constructor() {
                    super();
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
                        $(this.items[i].domel).attr("tooltip", `ct:${app.title()}`);
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

                    this._previous_touch = {x: 0, y:0};
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
                    let el = undefined;
                    for (let it of this.items) {
                        it.app.blur();
                        $(it.domel).removeClass("selected");
                        if (v && v === it.app) {
                            el = it;
                        }
                    }
                    this._selectedItem = el;
                    if (!el) {
                        PM.pidactive = 0;
                        return;
                    }
                    $(el.domel).addClass("selected");
                    ($(Ant.OS.GUI.workspace)[0] as FloatListTag).unselect();
                }

                get selectedApp(): application.BaseApplication {
                    if(!this._selectedItem)
                        return undefined;
                    return this._selectedItem.app;
                }


                /**
                 * Get selected item of the dock
                 *
                 * @readonly
                 * @type {AppDockItemType}
                 * @memberof AppDockTag
                 */
                get selectedItem(): AppDockItemType
                {
                    return this._selectedItem;
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
                addapp(item: AppDockItemType): void {
                    const collection = this.items.filter(it => it.app.name == item.app.name);
                    let bt = undefined;
                    if(collection.length == 0)
                    {
                        const el = $("<afx-button>");
                        bt = el[0] as ButtonTag;
                        el.appendTo(this);
                        el[0].uify(this.observable);
                        bt.set(item);
                        bt.data  = item.app.name;
                        item.domel = bt;
                        bt.onbtclick = (e) => {
                            e.data.stopPropagation();
                            this.handleAppSelect(bt);
                        };
                    }
                    else
                    {
                        bt = collection[0].domel;
                        item.domel = bt;
                        $(bt).addClass("plural");
                    }
                    this.items.push(item);
                    this.selectedApp = item.app;
                }

            private handleAppSelect(bt: ButtonTag)
            {
                const name = bt.data as any as string;
                const collection = this.items.filter(it => it.app.name == name);
                if(collection.length == 0)
                {
                    return;
                }
                if(collection.length == 1)
                {
                    collection[0].app.trigger("focus");
                    return;
                }
                // show the context menu containning a list of application to select
                const menu_data = collection.map(e => {
                    return {
                        text: (e.app.scheme as WindowTag).apptitle,
                        icon: e.icon,
                        iconclass: e.iconclass,
                        app: e.app
                    };
                });
                const ctxmenu = $("#contextmenu")[0] as tag.StackMenuTag;
                const offset = $(bt).offset();
                ctxmenu.nodes = menu_data;
                $(ctxmenu)
                    .css("left", offset.left)
                    .css("bottom", $(this).height());
                ctxmenu.onmenuselect = (e) =>
                {
                    e.data.item.data.app.show();
                }
                ctxmenu.show();
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
                        const appName = this.items[i].app.name;
                        const el = this.items[i].domel;
                        delete this.items[i].app;
                        this.items.splice(i, 1);
                        const collection = this.items.filter(it => it.app.name == appName);
                        if(collection.length == 1)
                        {
                            $(el).removeClass("plural");
                        }
                        if(collection.length == 0)
                        {
                            $(el).remove();
                        }
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
                        const name = bt.data as any;
                        const collection = this.items.filter(it => it.app.name == name);
                        m.nodes = [
                            { text: "__(New window)", dataid: "new" },
                            { text: "__(Hide all)", dataid: "hide" },
                            { text: "__(Close all)", dataid: "quit" },
                        ];
                        m.onmenuselect = function (evt) {
                            switch (evt.data.item.data.dataid) {
                                case "new":
                                    GUI.launch(bt.data as string, []);
                                    break;
                                case "hide":
                                    collection.forEach((el,_) => el.app.hide());
                                    break;
                                case "quit":
                                    collection.forEach((el,_) => el.app.quit());
                                    break;
                                default:
                                    break;
                            }
                        };
                        return m.show(e);
                    };
                    announcer.trigger("sysdockloaded", undefined);
                    GUI.bindKey("CTRL-ALT-2", (e) =>{
                        if(!this.items || this.items.length === 0)
                        {
                            return;
                        }
                        let index = this.items.indexOf(this.selectedItem);
                        if(index < 0)
                        {
                            index = 0;
                        }
                        else
                        {
                            index++;
                        }
                        if(index >= this.items.length)
                            index = 0;
                        this.items[index].app.trigger("focus");
                    });
                    GUI.bindKey("CTRL-ALT-1", (e) =>{
                        if(!this.items || this.items.length === 0)
                        {
                            return;
                        }
                        let index = this.items.indexOf(this.selectedItem);
                        index--;
                        if(index < 0)
                        {
                            index = this.items.length - 1;
                        }
                        if(index < 0)
                        {
                            return;
                        }
                        this.items[index].app.trigger("focus");
                    });

                    $(this).on("touchstart", e => {
                        this._previous_touch.x = e.touches[0].pageX;
                        this._previous_touch.y = e.touches[0].pageY;
                    });
                    $(this).on("touchmove", e => {
                        const offset = {x:0, y:0};
                        offset.x = this._previous_touch.x - e.touches[0].pageX ;
                        offset.y = this._previous_touch.y - e.touches[0].pageY; 
                        (this as any).scrollLeft += offset.x;
                        this._previous_touch.x = e.touches[0].pageX;
                        this._previous_touch.y = e.touches[0].pageY;
                    });
                    $(this).on("wheel", (evt)=>{
                        (this as any).scrollLeft += (evt.originalEvent as WheelEvent).deltaY;
                    });
                }
            }
            define("afx-apps-dock", AppDockTag);
        }
    }
}
