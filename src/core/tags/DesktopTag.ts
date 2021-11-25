namespace OS {
    export namespace GUI {
        export namespace tag {

            /**
             * Meta tag that represents the  virtual desktop environment.
             * In near future, we may have multiple virtual desktop environments.
             * Each desktop environment has a simple file manager and a window
             * manager that render the window in a specific order.
             *
             * @export
             * @class DesktopTag
             * @extends {FloatListTag}
             */
            export class DesktopTag extends FloatListTag {


                /**
                 * internal handle to the desktop file location
                 *
                 * @private
                 * @type {API.VFS.BaseFileHandle}
                 * @memberof DesktopTag
                 */
                private file: API.VFS.BaseFileHandle;

                /**
                 * local observer that detect if a new child element is
                 * added or removed
                 *
                 * @private
                 * @type {MutationObserver}
                 * @memberof DesktopTag
                 */
                private observer: MutationObserver;

                /**
                 * Internal list of the current opened window
                 *
                 * @private
                 * @type {Set<WindowTag>}
                 * @memberof DesktopTag
                 */
                private window_list: Set<WindowTag>;

                /**
                 * Creates an instance of DesktopTag.
                 * @memberof DesktopTag
                 */
                constructor() {
                    super();
                    this.observer = undefined;
                    this.window_list = new Set<WindowTag>();
                }


                /**
                 * Mount the virtual desktop to the DOM tree
                 *
                 * @protected
                 * @memberof DesktopTag
                 */
                protected mount(): void {
                    if(this.observer)
                    {
                        this.observer.disconnect();
                        this.observer = undefined;
                    }
                    this.observer = new MutationObserver((mutations_list) =>{
                        mutations_list.forEach((mutation) => {
                            mutation.removedNodes.forEach((removed_node) =>{
                                if((removed_node as HTMLElement).tagName === "AFX-APP-WINDOW")
                                {
                                    this.window_list.delete(removed_node as WindowTag);
                                }
                            });
                            mutation.addedNodes.forEach((added_node) =>{
                                if((added_node as HTMLElement).tagName === "AFX-APP-WINDOW")
                                {
                                    this.selectWindow(added_node as WindowTag);
                                }
                            });
                        });
                    });
                    this.observer.observe(this, { subtree: false, childList: true });

                    this.onready = (_) => {
                        this.observable = OS.announcer.observable;
                        window.onresize = () => {
                            announcer.trigger("desktopresize", undefined);
                            this.calibrate();
                        };

                        this.onlistselect = (d: TagEventType<tag.ListItemEventData>) => {
                            GUI.systemDock().selectedApp = null;
                        };

                        this.onlistdbclick = (d: TagEventType<tag.ListItemEventData>) => {
                            GUI.systemDock().selectedApp = null;
                            const it = this.selectedItem;
                            return GUI.openWith(it.data as AppArgumentsType);
                        };

                        //($ "#workingenv").on "click", (e) ->
                        //     desktop[0].set "selected", -1

                        $(this).on("click", (e) => {
                            let el: any = $(e.target).closest("afx-app-window")[0];
                            if (el) {
                                return;
                            }
                            el = $(e.target).parent();
                            if (!(el.length > 0)) {
                                return;
                            }
                            el = el.parent();
                            if (!(el.length > 0)) {
                                return;
                            }
                            if (el[0] !== this) {
                                return;
                            }
                            this.unselect();
                            GUI.systemDock().selectedApp = null;
                        });

                        this.contextmenuHandle = (e, m) => {
                            if (e.target.tagName.toUpperCase() === "UL") {
                                this.unselect();
                            }
                            GUI.systemDock().selectedApp = null;
                            let menu = [
                                { text: __("Open"), dataid: "desktop-open" } as GUI.BasicItemType,
                                { text: __("Refresh"), dataid: "desktop-refresh" } as GUI.BasicItemType,
                            ];
                            menu = menu.concat(setting.desktop.menu.map(e => e));
                            m.items = menu;
                            m.onmenuselect = (evt: TagEventType<tag.MenuEventData>) => {
                                if (!evt.data || !evt.data.item) return;
                                const item = evt.data.item.data;
                                switch (item.dataid) {
                                    case "desktop-open":
                                        var it = this.selectedItem;
                                        if (it) {
                                            return GUI.openWith(
                                                it.data as AppArgumentsType
                                            );
                                        }
                                        let arg = setting.desktop.path.asFileHandle() as AppArgumentsType;
                                        arg.mime = "dir";
                                        arg.type = "dir";
                                        return GUI.openWith(arg);
                                    case "desktop-refresh":
                                        return this.refresh();
                                    default:
                                        if (item.app) {
                                            return GUI.launch(item.app, item.args);
                                        }
                                }
                            };
                            return m.show(e);
                        };

                        this.refresh();
                        announcer.observable.on("VFS", (d: API.AnnouncementDataType<API.VFS.BaseFileHandle>) => {
                            if (["read", "publish", "download"].includes(d.message as string)) {
                                return;
                            }
                            if (d.u_data.hash() === this.file.hash() || d.u_data.parent().hash() === this.file.hash()) {
                                return this.refresh();
                            }
                        });
                        return announcer.ostrigger("desktoploaded", undefined);
                    };
                    super.mount();
                }


                /**
                 * Display all files and folders in the specific desktop location
                 *
                 * @return {*}  {Promise<any>}
                 * @memberof DesktopTag
                 */

                refresh(): Promise<any> {
                    return new Promise<any>(async (resolve, reject) => {
                        try {
                            this.file = setting.desktop.path.asFileHandle();
                            await this.file.onready();
                            const d = await this.file.read();
                            if (d.error) {
                                throw new Error(d.error);
                            }
                            const items = [];
                            $.each(d.result, function (i, v) {
                                if (v.filename[0] === "." && !setting.desktop.showhidden) {
                                    return;
                                }
                                v.text = v.filename;
                                //v.text = v.text.substring(0,9) + "..." ifv.text.length > 10
                                v.iconclass = v.type;
                                return items.push(v);
                            });
                            this.data = items;
                            this.calibrate();
                        }
                        catch (err) {
                            announcer.osfail(err.toString(), err);
                            reject(__e(err));
                        }
                    });
                }

                /**
                 * Remove this element from its parent
                 *
                 * @memberof DesktopTag
                 */
                remove(): void {
                    if(this.observer)
                    {
                        this.observer.disconnect();
                    }
                    super.remove();
                }


                /**
                 * Active a window above all other windows
                 *
                 * @private
                 * @param {WindowTag} win
                 * @memberof DesktopTag
                 */
                private selectWindow(win: WindowTag)
                {
                    if(this.window_list.has(win))
                    {
                        this.window_list.delete(win);
                    }
                    else
                    {
                        win.observable.on("focused",(_)=>{
                            this.selectWindow(win);
                        });
                    }
                    this.window_list.add(win);
                    console.log("number of windows", this.window_list.size);
                    this.render();
                }


                /**
                 * Render all windows in order from bottom to top
                 *
                 * @private
                 * @memberof DesktopTag
                 */
                private render(){
                    let zindex = 10;
                    for(let win of this.window_list)
                    {
                        $(win).css("z-index", zindex++);
                    }
                }

            }

            define("afx-desktop", DesktopTag);
        }
    }
}