namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * Definition of system file view widget
             *
             * @export
             * @class FileViewTag
             * @extends {AFXTag}
             */
            export class FileViewTag extends AFXTag {
                /**
                 * placeholder for file select event callback
                 *
                 * @private
                 * @type {TagEventCallback<API.FileInfoType>}
                 * @memberof FileViewTag
                 */
                private _onfileselect: TagEventCallback<API.FileInfoType>;

                /**
                 * placeholder for file open event callback
                 *
                 * @private
                 * @type {TagEventCallback<API.FileInfoType>}
                 * @memberof FileViewTag
                 */
                private _onfileopen: TagEventCallback<API.FileInfoType>;

                /**
                 * Reference to the currently selected file meta-data
                 *
                 * @private
                 * @type {API.FileInfoType}
                 * @memberof FileViewTag
                 */
                private _selectedFile: API.FileInfoType;

                /**
                 * Data placeholder of the current working directory
                 *
                 * @private
                 * @type {API.FileInfoType[]}
                 * @memberof FileViewTag
                 */
                private _data: API.FileInfoType[];

                /**
                 * The path of the current working directory
                 *
                 * @private
                 * @type {string}
                 * @memberof FileViewTag
                 */
                private _path: string;

                /**
                 * Header definition of the widget grid view
                 *
                 * @private
                 * @type {(GenericObject<string | number>[])}
                 * @memberof FileViewTag
                 */
                private _header: GenericObject<string | number>[];

                /**
                 * placeholder for the user-specified meta-data fetch function
                 *
                 * @private
                 * @memberof FileViewTag
                 */
                private _fetch: (p: string) => Promise<API.FileInfoType[]>;

                /**
                 *Creates an instance of FileViewTag.
                 * @memberof FileViewTag
                 */
                constructor() {
                    super();
                }

                /**
                 * Init the widget before mounting
                 *
                 * @protected
                 * @memberof FileViewTag
                 */
                protected init(): void {
                    this.data = [];
                    this.status = true;
                    this.showhidden = false;
                    this.chdir = true;
                    this.view = "list";
                    this._onfileopen = this._onfileselect = (e) => {};
                    this._header = [
                        { text: "__(File name)" },
                        { text: "__(Type)", width: 150 },
                        { text: "__(Size)", width: 70 },
                    ];
                }

                /**
                 * Update the current widget, do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof FileViewTag
                 */
                protected reload(d?: any): void {}

                /**
                 * set the function that allows to fetch file entries.
                 * This handle function should return a promise on
                 * an arry of [[API.FileInfoType]]
                 *
                 * @memberof FileViewTag
                 */
                set fetch(v: (p: string) => Promise<API.FileInfoType[]>) {
                    this._fetch = v;
                }

                /**
                 * set the callback handle for the file select event.
                 * The parameter of the callback should  be an object
                 * of type [[TagEventType]]<T> with the data type `T` is [[API.FileInfoType]]
                 *
                 * @memberof FileViewTag
                 */
                set onfileselect(e: TagEventCallback<API.FileInfoType>) {
                    this._onfileselect = e;
                }

                /**
                 set the callback handle for the file open event.
                 * The parameter of the callback should  be an object
                 * of type [[TagEventType]]<T> with the data type `T` is [[API.FileInfoType]]
                 *
                 * @memberof FileViewTag
                 */
                set onfileopen(e: TagEventCallback<API.FileInfoType>) {
                    this._onfileopen = e;
                }

                /**
                 * chang the view of the widget, there are three different views
                 * - `icon`
                 * - `list`
                 * - `tree`
                 *
                 * @memberof FileViewTag
                 */
                set view(v: string) {
                    $(this).attr("view", v);
                    this.switchView();
                }

                /**
                 * Get the current view setting of the widget
                 *
                 * @type {string}
                 * @memberof FileViewTag
                 */
                get view(): string {
                    return $(this).attr("view");
                }

                /**
                 * Turn on/off the changing current working directory feature
                 * of the widget when a directory is double clicked. If enabled,
                 * the widget will use the configured [[fetch]] function to query
                 * the content of the selected directory
                 *
                 * @memberof FileViewTag
                 */
                set chdir(v: boolean) {
                    this.attsw(v, "chdir");
                }

                /**
                 * check whether changing current working directory feature
                 * is enabled
                 *
                 * @type {boolean}
                 * @memberof FileViewTag
                 */
                get chdir(): boolean {
                    return this.hasattr("chdir");
                }

                /**
                 * Enable or disable the status bar of the widget
                 *
                 * @memberof FileViewTag
                 */
                set status(v: boolean) {
                    this.attsw(v, "status");
                    if (v) {
                        $(this.refs.status).show();
                        return;
                    }
                    $(this.refs.status).hide();
                }

                /**
                 * Check whether the status bar is enabled
                 *
                 * @type {boolean}
                 * @memberof FileViewTag
                 */
                get status(): boolean {
                    return this.hasattr("status");
                }

                /**
                 * Allow the widget to show or hide hidden file
                 *
                 * @memberof FileViewTag
                 */
                set showhidden(v: boolean) {
                    this.attsw(v, "showhidden");
                    if (!this.data) {
                        return;
                    }
                    this.switchView();
                }

                /**
                 * Check whether the hidden file should be shown in
                 * the widget
                 *
                 * @type {boolean}
                 * @memberof FileViewTag
                 */
                get showhidden(): boolean {
                    return this.hasattr("showhidden");
                }

                /**
                 * Get the current selected file
                 *
                 * @readonly
                 * @type {API.FileInfoType}
                 * @memberof FileViewTag
                 */
                get selectedFile(): API.FileInfoType {
                    return this._selectedFile;
                }

                /**
                 * Set the path of the current working directory.
                 * When called the widget will refresh the current
                 * working directory using the configured [[fetch]]
                 * function
                 *
                 * @memberof FileViewTag
                 */
                set path(v: string) {
                    if (!v) {
                        return;
                    }
                    this._path = v;
                    if (!this._fetch) {
                        return;
                    }
                    this._fetch(v)
                        .then((data: API.FileInfoType[]) => {
                            if (!data) {
                                return;
                            }
                            this.data = data;
                            if (this.status) {
                                (this.refs.status as LabelTag).text = " ";
                            }
                        })
                        .catch((e: Error) =>
                            announcer.oserror(e.toString(), e)
                        );
                }

                /**
                 * Get the path of the current working directory
                 *
                 * @type {string}
                 * @memberof FileViewTag
                 */
                get path(): string {
                    return this._path;
                }

                /**
                 * Set the data of the current working directory
                 *
                 * @memberof FileViewTag
                 */
                set data(v: API.FileInfoType[]) {
                    if (!v) {
                        return;
                    }
                    this._data = v;
                    this.refreshData();
                }

                /**
                 * Get the data of the current working directory
                 *
                 * @type {API.FileInfoType[]}
                 * @memberof FileViewTag
                 */
                get data(): API.FileInfoType[] {
                    return this._data;
                }

                /**
                 * Set the file drag and drop event handle. This allows application
                 * to define custom behavior of the event
                 *
                 * @memberof FileViewTag
                 */
                set ondragndrop(
                    v: TagEventCallback<
                        DnDEventDataType<TreeViewTag | ListViewItemTag>
                    >
                ) {
                    (this.refs.treeview as TreeViewTag).ondragndrop = v;
                    (this.refs.listview as ListViewTag).ondragndrop = v;
                }

                /**
                 * sort file by it type
                 *
                 * @private
                 * @param {API.FileInfoType} a first file meta-data
                 * @param {API.FileInfoType} b second file meta-data
                 * @returns {(0|-1|1)}
                 * @memberof FileViewTag
                 */
                private sortByType(
                    a: API.FileInfoType,
                    b: API.FileInfoType
                ): 0 | -1 | 1 {
                    if (a.type < b.type) {
                        return -1;
                    } else if (a.type > b.type) {
                        return 1;
                    } else {
                        return 0;
                    }
                }

                /**
                 * calibrate the widget layout
                 *
                 * @memberof FileViewTag
                 */
                calibrate(): void {
                    let h = $(this).outerHeight();
                    const w = $(this).width();
                    if (this.status) {
                        h -= $(this.refs.status).height() + 10;
                    }
                    $(this.refs.listview).css("height", h + "px");
                    $(this.refs.gridview).css("height", h + "px");
                    $(this.refs.treecontainer).css("height", h + "px");
                    $(this.refs.listview).css("width", w + "px");
                    $(this.refs.gridview).css("width", w + "px");
                    $(this.refs.treecontainer).css("width", w + "px");
                }

                /**
                 * Refresh the list view of the widget. This function
                 * is called when the view of the widget changed to `icon`
                 *
                 * @private
                 * @memberof FileViewTag
                 */
                private refreshList(): void {
                    const items = [];
                    $.each(this.data, (i, v) => {
                        if (v.filename[0] === "." && !this.showhidden) {
                            return;
                        }
                        v.text = v.filename;
                        if (v.text.length > 10) {
                            v.text = v.text.substring(0, 9) + "...";
                        }
                        v.iconclass = v.iconclass ? v.iconclass : v.type;
                        v.icon = v.icon;
                        items.push(v);
                    });
                    (this.refs.listview as ListViewTag).data = items;
                }

                /**
                 * Refresh the grid view of the widget, this function is called
                 * when the view of the widget set to `list`
                 *
                 * @private
                 * @memberof FileViewTag
                 */
                private refreshGrid(): void {
                    const rows = [];
                    $.each(this.data, (i, v) => {
                        if (v.filename[0] === "." && !this.showhidden) {
                            return;
                        }
                        v.text = v.filename;
                        v.iconclass = v.iconclass ? v.iconclass : v.type;
                        const row = [
                            v,
                            {
                                text: v.mime,
                                data: v,
                            },
                            {
                                text: v.size,
                                data: v,
                            },
                        ];
                        return rows.push(row);
                    });
                    (this.refs.gridview as GridViewTag).rows = rows;
                }

                /**
                 * Refresh the Treeview of the widget, this function is called
                 * when the view of the widget set to `tree`
                 *
                 * @private
                 * @memberof FileViewTag
                 */
                private refreshTree(): void {
                    //@treeview.root.set("selectedItem", null)
                    const tdata: TreeViewDataType = {
                        text: this.path,
                        path: this.path,
                        open: true,
                        nodes: this.getTreeData(this.data),
                    };
                    (this.refs.treeview as TreeViewTag).data = tdata;
                    // (this.refs.treeview as TreeViewTag).expandAll();
                }

                /**
                 * Create the tree data from the list of input
                 * file meta-data
                 *
                 * @private
                 * @param {API.FileInfoType[]} data list of file meta-data
                 * @returns {TreeViewDataType[]}
                 * @memberof FileViewTag
                 */
                private getTreeData(
                    data: API.FileInfoType[]
                ): TreeViewDataType[] {
                    const nodes = [];
                    const me = this;
                    $.each(data, (i, v) => {
                        if (v.filename[0] === "." && !this.showhidden) {
                            return undefined;
                        }
                        v.text = v.filename;
                        if (v.type === "dir") {
                            v.nodes = [];
                            v.open = false;
                        }
                        v.iconclass = v.iconclass ? v.iconclass : v.type;
                        v.icon = v.icon;
                        return nodes.push(v);
                    });
                    return nodes;
                }

                /**
                 * Refresh data of the current widget view
                 *
                 * @private
                 * @returns {void}
                 * @memberof FileViewTag
                 */
                private refreshData(): void {
                    if (!this.data) {
                        return;
                    }
                    this.data.sort(this.sortByType);
                    switch (this.view) {
                        case "icon":
                            return this.refreshList();
                        case "list":
                            return this.refreshGrid();
                        default:
                            return this.refreshTree();
                    }
                }

                /**
                 * Switch between three view options
                 *
                 * @private
                 * @memberof FileViewTag
                 */
                private switchView(): void {
                    $(this.refs.listview).hide();
                    $(this.refs.gridview).hide();
                    $(this.refs.treecontainer).hide();
                    this._selectedFile = undefined;
                    switch (this.view) {
                        case "icon":
                            $(this.refs.listview).show();
                            break;
                        case "list":
                            $(this.refs.gridview).show();
                            break;
                        default:
                            $(this.refs.treecontainer).show();
                    }
                    this.refreshData();
                    this.calibrate();
                    if (this.status) {
                        (this.refs.status as LabelTag).text = " ";
                    }
                }

                /**
                 * This function triggers the file select event
                 *
                 * @private
                 * @param {API.FileInfoType} e selected file meta-data
                 * @memberof FileViewTag
                 */
                private fileselect(e: API.FileInfoType): void {
                    if (e.path === this.path) {
                        e.type = "dir";
                        e.mime = "dir";
                    }
                    if (this.status) {
                        (this.refs.status as LabelTag).text = __(
                            "Selected: {0} ({1} bytes)",
                            e.filename,
                            e.size ? e.size : "0"
                        );
                    }
                    const evt = { id: this.aid, data: e };
                    this._selectedFile = e;
                    this._onfileselect(evt);
                    this.observable.trigger("fileselect", evt);
                }

                /**
                 * This function triggers the file open event
                 *
                 * @private
                 * @param {API.FileInfoType} e selected file meta-data
                 * @memberof FileViewTag
                 */
                private filedbclick(e: API.FileInfoType): void {
                    if (e.path === this.path) {
                        e.type = "dir";
                        e.mime = "dir";
                    }
                    if (e.type === "dir" && this.chdir) {
                        this.path = e.path;
                    } else {
                        const evt = { id: this.aid, data: e };
                        this._onfileopen(evt);
                        this.observable.trigger("fileopen", evt);
                    }
                }

                /**
                 * Mount the widget in the DOM tree
                 *
                 * @protected
                 * @memberof FileViewTag
                 */
                protected mount(): void {
                    this.observable.on("resize", (e) => this.calibrate());
                    const tree = this.refs.treeview as TreeViewTag;
                    tree.fetch = (v) => {
                        return new Promise((resolve, reject) => {
                            if (!this._fetch) {
                                return resolve(undefined);
                            }
                            if (!v.data.path) {
                                return resolve(undefined);
                            }
                            return this._fetch(v.data.path)
                                .then((d: API.FileInfoType[]) =>
                                    resolve(
                                        this.getTreeData(
                                            d.sort(this.sortByType)
                                        )
                                    )
                                )
                                .catch((e: Error) => reject(__e(e)));
                        });
                    };
                    const grid = this.refs.gridview as GridViewTag;
                    const list = this.refs.listview as ListViewTag;
                    grid.header = this._header;
                    tree.dragndrop = true;
                    list.dragndrop = true;
                    // even handles
                    list.onlistselect = (e) => {
                        this.fileselect(e.data.item.data as API.FileInfoType);
                    };
                    grid.onrowselect = (e) => {
                        this.fileselect(
                            $(e.data.item).children()[0]
                                .data as API.FileInfoType
                        );
                    };
                    tree.ontreeselect = (e) => {
                        this.fileselect(e.data.item.data as API.FileInfoType);
                    };
                    // dblclick
                    list.onlistdbclick = (e) => {
                        this.filedbclick(e.data.item.data as API.FileInfoType);
                    };
                    grid.oncelldbclick = (e) => {
                        this.filedbclick(e.data.item.data as API.FileInfoType);
                    };
                    tree.ontreedbclick = (e) => {
                        this.filedbclick(e.data.item.data as API.FileInfoType);
                    };
                    this.switchView();
                }

                /**
                 * Layout definition of the widget
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof FileViewTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        { el: "afx-list-view", ref: "listview" },
                        {
                            el: "div",
                            class: "treecontainer",
                            ref: "treecontainer",
                            children: [
                                { el: "afx-tree-view", ref: "treeview" },
                            ],
                        },
                        { el: "afx-grid-view", ref: "gridview" },
                        { el: "afx-label", class: "status", ref: "status" },
                    ];
                }
            }

            define("afx-file-view", FileViewTag);
        }
    }
}
