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
             * @class FileViewTag
             * @extends {AFXTag}
             */
            export class FileViewTag extends AFXTag {
                private _onfileselect: TagEventCallback;
                private _onfileopen: TagEventCallback;
                private _selectedFile: API.FileInfoType;
                private _data: API.FileInfoType[];
                private _path: string;
                private _header: GenericObject<string | number>[];
                private _fetch: (p: string) => Promise<API.FileInfoType[]>;

                /**
                 *Creates an instance of FileViewTag.
                 * @memberof FileViewTag
                 */
                constructor() {
                    super();
                }

                /**
                 *
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
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof FileViewTag
                 */
                protected reload(d?: any): void {}
                /**
                 *
                 *
                 * @memberof FileViewTag
                 */
                set fetch(v: (p: string) => Promise<API.FileInfoType[]>) {
                    this._fetch = v;
                }

                /**
                 *
                 *
                 * @memberof FileViewTag
                 */
                set onfileselect(e: TagEventCallback) {
                    this._onfileselect = e;
                }

                /**
                 *
                 *
                 * @memberof FileViewTag
                 */
                set onfileopen(e: TagEventCallback) {
                    this._onfileopen = e;
                }

                /**
                 *
                 *
                 * @memberof FileViewTag
                 */
                set view(v: string) {
                    $(this).attr("view", v);
                    this.switchView();
                }

                /**
                 *
                 *
                 * @type {string}
                 * @memberof FileViewTag
                 */
                get view(): string {
                    return $(this).attr("view");
                }

                /**
                 *
                 *
                 * @memberof FileViewTag
                 */
                set chdir(v: boolean) {
                    this.attsw(v, "chdir");
                }

                /**
                 *
                 *
                 * @type {boolean}
                 * @memberof FileViewTag
                 */
                get chdir(): boolean {
                    return this.hasattr("chdir");
                }

                /**
                 *
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
                 *
                 *
                 * @type {boolean}
                 * @memberof FileViewTag
                 */
                get status(): boolean {
                    return this.hasattr("status");
                }

                /**
                 *
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
                 *
                 *
                 * @type {boolean}
                 * @memberof FileViewTag
                 */
                get showhidden(): boolean {
                    return this.hasattr("showhidden");
                }

                /**
                 *
                 *
                 * @readonly
                 * @type {API.FileInfoType}
                 * @memberof FileViewTag
                 */
                get selectedFile(): API.FileInfoType {
                    return this._selectedFile;
                }

                /**
                 *
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
                 *
                 *
                 * @type {string}
                 * @memberof FileViewTag
                 */
                get path(): string {
                    return this._path;
                }

                /**
                 *
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
                 *
                 *
                 * @type {API.FileInfoType[]}
                 * @memberof FileViewTag
                 */
                get data(): API.FileInfoType[] {
                    return this._data;
                }

                /**
                 *
                 *
                 * @memberof FileViewTag
                 */
                set ondragndrop(v: TagEventCallback) {
                    (this.refs.treeview as TreeViewTag).ondragndrop = v;
                    (this.refs.listview as ListViewTag).ondragndrop = v;
                }

                /**
                 *
                 *
                 * @private
                 * @param {API.FileInfoType} a
                 * @param {API.FileInfoType} b
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
                 *
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
                 *
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
                 *
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
                 *
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
                        nodes: this.getTreeData(this.data)
                    };
                    (this.refs.treeview as TreeViewTag).data = tdata;
                   // (this.refs.treeview as TreeViewTag).expandAll();
                }

                /**
                 *
                 *
                 * @private
                 * @param {API.FileInfoType[]} data
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
                 *
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
                 *
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
                 *
                 *
                 * @private
                 * @param {API.FileInfoType} e
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
                 *
                 *
                 * @private
                 * @param {API.FileInfoType} e
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
                 *
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
                        this.fileselect(e.data.item.data);
                    };
                    grid.onrowselect = (e) => {
                        this.fileselect(
                            $(e.data.item).children()[0].data
                        );
                    };
                    tree.ontreeselect = (e) => {
                        this.fileselect(e.data.item.data);
                    };
                    // dblclick
                    list.onlistdbclick = (e) => {
                        this.filedbclick(e.data.item.data);
                    };
                    grid.oncelldbclick = (e) => {
                        this.filedbclick(e.data.item.data);
                    };
                    tree.ontreedbclick = (e) => {
                        this.filedbclick(e.data.item.data);
                    };
                    this.switchView();
                }

                /**
                 *
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
