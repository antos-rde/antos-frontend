/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             *
             *
             * @export
             * @interface TreeViewDataType
             */
            export interface TreeViewDataType {
                nodes?: TreeViewDataType[];
                open?: boolean;
                path?: string;
                selected?: boolean;
                [propName: string]: any;
            }

            /**
             *
             *
             * @class TreeViewItemPrototype
             * @extends {AFXTag}
             */
            export abstract class TreeViewItemPrototype extends AFXTag {
                private _data: TreeViewDataType;
                private _indent: number;
                private _evt: TagEventType;
                treeroot: TreeViewTag;
                treepath: string;
                parent: TreeViewTag;
                fetch: (
                    d: TreeViewItemPrototype
                ) => Promise<TreeViewDataType[]>;
                /**
                 *Creates an instance of TreeViewItemPrototype.
                 * @memberof TreeViewItemPrototype
                 */
                constructor() {
                    super();
                    
                }

                /**
                 *
                 *
                 * @protected
                 * @param {*} p
                 * @returns {void}
                 * @memberof TreeViewItemPrototype
                 */
                protected reload(p: any): void {
                    if (!p || typeof p !== "string") {
                        return;
                    }
                    switch (p) {
                        case "expand":
                            this.open = true;
                            break;
                        case "collapse":
                            this.open = false;
                            break;
                        default:
                            if (p !== this.treepath) {
                                return;
                            }
                            this.open = true;
                    }
                }

                /**
                 *
                 *
                 * @memberof TreeViewItemPrototype
                 */
                set data(v: TreeViewDataType) {
                    this._data = v;
                    if (!v) {
                        return;
                    }
                    this.open = v.open;
                    if (v.path) {
                        this.treepath = v.path;
                    }
                    this.selected = v.selected;
                    v.domel = this;
                    this.ondatachange();
                }

                /**
                 *
                 *
                 * @type {TreeViewDataType}
                 * @memberof TreeViewItemPrototype
                 */
                get data(): TreeViewDataType {
                    return this._data;
                }

                /**
                 *
                 *
                 * @memberof TreeViewItemPrototype
                 */
                set selected(v: boolean) {
                    if (!this._data) {
                        return;
                    }
                    this.attsw(v, "selected");
                    $(this.refs.wrapper).removeClass();
                    this._data.selected = v;
                    if (v) {
                        this.treeroot.unselect();
                        // set selectedItem but not trigger the update
                        this.treeroot.itemclick(this._evt);
                        this._evt.data.dblclick = false;
                        $(this.refs.wrapper).addClass("afx_tree_item_selected");
                    }
                }

                /**
                 *
                 *
                 * @type {boolean}
                 * @memberof TreeViewItemPrototype
                 */
                get selected(): boolean {
                    return this.hasattr("selected");
                }

                /**
                 *
                 *
                 * @memberof TreeViewItemPrototype
                 */
                set open(v: boolean) {
                    if (!this.is_folder()) {
                        return;
                    }
                    this.attsw(v, "open");
                    $(this.refs.toggle).removeClass();
                    if (v) {
                        if (this.fetch) {
                            this.fetch(this)
                                .then((d: TreeViewDataType[]) => {
                                    if (!d) {
                                        return;
                                    }
                                    return (this.nodes = d);
                                })
                                .catch((e: Error) =>
                                    announcer.oserror(e.toString(), e)
                                );
                        } else {
                            this.nodes = this.nodes;
                        }
                        $(this.refs.childnodes).show();
                    } else {
                        $(this.refs.childnodes).hide();
                    }
                    if (v) {
                        $(this.refs.toggle).addClass(
                            "afx-tree-view-folder-open"
                        );
                    }
                    $(this.refs.toggle).addClass("afx-tree-view-folder-close");
                }

                /**
                 *
                 *
                 * @type {boolean}
                 * @memberof TreeViewItemPrototype
                 */
                get open(): boolean {
                    return this.hasattr("open");
                }
                /**
                 *
                 *
                 * @type {number}
                 * @memberof TreeViewItemPrototype
                 */
                get indent(): number {
                    return this._indent;
                }

                /**
                 *
                 *
                 * @memberof TreeViewItemPrototype
                 */
                set indent(v: number) {
                    if (!v) {
                        return;
                    }
                    this._indent = v;
                    $(this.refs.padding)
                        .css("display", "inline-block")
                        .css("height", "1px")
                        .css("padding", 0)
                        .css("margin", 0)
                        .css("background-color", "transparent")
                        .css("width", v * 15 + "px");
                }

                /**
                 *
                 *
                 * @private
                 * @returns {boolean}
                 * @memberof TreeViewItemPrototype
                 */
                private is_folder(): boolean {
                    if (this.nodes) {
                        return true;
                    } else {
                        return false;
                    }
                }

                /**
                 *
                 *
                 * @type {TreeViewDataType[]}
                 * @memberof TreeViewItemPrototype
                 */
                get nodes(): TreeViewDataType[] {
                    if (!this._data) return undefined;
                    return this._data.nodes;
                }

                /**
                 *
                 *
                 * @memberof TreeViewItemPrototype
                 */
                set nodes(nodes: TreeViewDataType[]) {
                    if (!nodes || !this.data) {
                        return;
                    }
                    this._data.nodes = nodes;
                    // return unless @get("nodes") and @get("nodes").length > 0
                    $(this.refs.childnodes).empty();
                    $(this.refs.wrapper).addClass("afx_folder_item");
                    const root = this.treeroot;
                    const result = [];
                    for (let v of nodes) {
                        const el = $("<afx-tree-view>").appendTo(
                            this.refs.childnodes
                        );
                        el[0].uify(this.observable);
                        const element = el[0] as TreeViewTag;
                        element.treeroot = root;
                        element.indent = this.indent + 1;
                        element.open = this.open;
                        element.parent = this.parent;
                        element.treepath = `${this.treepath}/${element.aid}`;
                        element.fetch = this.fetch;
                        element.data = v;
                    }
                }
                
                protected init(): void {
                    this.treeroot = undefined;
                    this.treepath = this.aid.toString();
                    this._evt = {
                        id: this.aid,
                        data: { item: this, dblclick: false },
                    };
                    this._indent = 0;
                }
                /**
                 *
                 *
                 * @protected
                 * @memberof TreeViewItemPrototype
                 */
                protected mount(): void {
                    $(this.refs.container)
                        .css("padding", 0)
                        .css("margin", 0)
                        .css("white-space", "nowrap");
                    $(this.refs.itemholder).css("display", "inline-block");
                    $(this.refs.wrapper).click((e) => {
                        this.selected = true;
                    });
                    $(this.refs.wrapper).dblclick((e) => {
                        this._evt.data.dblclick = true;
                        this.selected = true;
                    });

                    $(this.refs.toggle)
                        .css("display", "inline-block")
                        .css("width", "15px")
                        .addClass("afx-tree-view-item")
                        .click((e) => {
                            this.open = !this.open;
                            e.preventDefault();
                            return e.stopPropagation();
                        });
                }

                /**
                 *
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof TreeViewItemPrototype
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "div",
                            ref: "wrapper",
                            children: [
                                {
                                    el: "ul",
                                    ref: "container",
                                    children: [
                                        { el: "li", ref: "padding" },
                                        { el: "li", ref: "toggle" },
                                        {
                                            el: "li",
                                            ref: "itemholder",
                                            class: "itemname",
                                            children: this.itemlayout(),
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            el: "ul",
                            ref: "childnodes",
                        },
                    ];
                }

                /**
                 *
                 *
                 * @protected
                 * @abstract
                 * @returns {TagLayoutType[]}
                 * @memberof TreeViewItemPrototype
                 */
                protected abstract itemlayout(): TagLayoutType[];

                /**
                 *
                 *
                 * @protected
                 * @abstract
                 * @memberof TreeViewItemPrototype
                 */
                protected abstract ondatachange(): void;
            }

            
            /**
             *
             *
             * @export
             * @class SimpleTreeViewItem
             * @extends {TreeViewItemPrototype}
             */
            export class SimpleTreeViewItem extends TreeViewItemPrototype {
                /**
                 *Creates an instance of SimpleTreeViewItem.
                 * @memberof SimpleTreeViewItem
                 */
                constructor() {
                    super();
                }

                /**
                 *
                 *
                 * @protected
                 * @returns {void}
                 * @memberof SimpleTreeViewItem
                 */
                protected ondatachange(): void {
                    if (!this.data) {
                        return;
                    }
                    const v = this.data;
                    const label = this.refs.label as LabelTag;
                    label.set(v);
                }

                /**
                 *
                 *
                 * @protected
                 * @returns
                 * @memberof SimpleTreeViewItem
                 */
                protected itemlayout() {
                    return [{ el: "afx-label", ref: "label" }];
                }
            }

            
            /**
             *
             *
             * @export
             * @class TreeViewTag
             * @extends {AFXTag}
             */
            export class TreeViewTag extends AFXTag {
                private _selectedItem: TreeViewItemPrototype;
                private _ontreeselect: TagEventCallback;
                private _ontreedbclick: TagEventCallback;
                private _ondragndrop: TagEventCallback;
                private _data: TreeViewDataType;
                private _treemousedown: (e: JQuery.MouseEventBase) => void;
                private _treemouseup: (e: JQuery.MouseEventBase) => void;
                private _treemousemove: (e: JQuery.MouseEventBase) => void;
                private _dnd: { from: TreeViewTag; to: TreeViewTag };
                parent: TreeViewTag;
                treeroot: TreeViewTag;
                treepath: string;
                indent: number;
                open: boolean;
                fetch: (
                    d: TreeViewItemPrototype
                ) => Promise<TreeViewDataType[]>;

                /**
                 *Creates an instance of TreeViewTag.
                 * @memberof TreeViewTag
                 */
                constructor() {
                    super();
                    
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof TreeViewTag
                 */
                protected init(): void {
                    this.itemtag = "afx-tree-view-item";
                    this._ontreeselect = this._ondragndrop = this._ontreedbclick = (
                        e
                    ) => {};

                    this.indent = 0;
                    this.open = true;
                    this.treepath = this.aid.toString();
                }

                /**
                 *
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof TreeViewTag
                 */
                protected layout(): TagLayoutType[] {
                    return [];
                }

                /**
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof TreeViewTag
                 */
                protected reload(d?: any): void {}
                /**
                 *
                 *
                 * @memberof TreeViewTag
                 */
                set dragndrop(v: boolean) {
                    this.attsw(v, "dragndrop");
                }

                /**
                 *
                 *
                 * @type {boolean}
                 * @memberof TreeViewTag
                 */
                get dragndrop(): boolean {
                    return this.hasattr("dragndrop");
                }

                /**
                 *
                 *
                 * @memberof TreeViewTag
                 */
                set ontreeselect(v: TagEventCallback) {
                    this._ontreeselect = v;
                }

                /**
                 *
                 *
                 * @memberof TreeViewTag
                 */
                set ontreedbclick(v: TagEventCallback) {
                    this._ontreedbclick = v;
                }

                /**
                 *
                 *
                 * @memberof TreeViewTag
                 */
                set itemtag(v: string) {
                    $(this).attr("itemtag", v);
                }

                /**
                 *
                 *
                 * @type {string}
                 * @memberof TreeViewTag
                 */
                get itemtag(): string {
                    return $(this).attr("itemtag");
                }

                /**
                 *
                 *
                 * @memberof TreeViewTag
                 */
                unselect(): void {
                    if (this.selectedItem) {
                        this._selectedItem.selected = false;
                    }
                }

                /**
                 *
                 *
                 * @type {TreeViewItemPrototype}
                 * @memberof TreeViewTag
                 */
                get selectedItem(): TreeViewItemPrototype {
                    return this._selectedItem;
                }

                /**
                 *
                 *
                 * @memberof TreeViewTag
                 */
                set selectedItem(v: TreeViewItemPrototype) {
                    if (!v) {
                        return;
                    }
                    if (v === this.selectedItem) {
                        return;
                    }
                    v.selected = true;
                }

                /**
                 *
                 *
                 * @returns {void}
                 * @memberof TreeViewTag
                 */
                expandAll(): void {
                    if (this.is_leaf()) {
                        return;
                    }
                    return this.update("expand");
                }

                /**
                 *
                 *
                 * @returns {void}
                 * @memberof TreeViewTag
                 */
                collapseAll(): void {
                    if (this.is_leaf()) {
                        return;
                    }
                    return this.update("collapse");
                }

                /**
                 *
                 *
                 * @param {TagEventType} e
                 * @returns {void}
                 * @memberof TreeViewTag
                 */
                itemclick(e: TagEventType): void {
                    if (!e || !e.data) {
                        return;
                    }
                    if (e.data.item === this.selectedItem && !e.data.dblclick) {
                        return;
                    }
                    this._selectedItem = e.data.item;
                    const evt = { id: this.aid, data: e.data };
                    if (e.data.dblclick) {
                        this._ontreedbclick(evt);
                        return this.observable.trigger("treedbclick", evt);
                    } else {
                        this._ontreeselect(evt);
                        return this.observable.trigger("treeselect", evt);
                    }
                }

                /**
                 *
                 *
                 * @returns {boolean}
                 * @memberof TreeViewTag
                 */
                is_root(): boolean {
                    return this.treeroot === undefined;
                }

                /**
                 *
                 *
                 * @returns {boolean}
                 * @memberof TreeViewTag
                 */
                is_leaf(): boolean {
                    const data = this.data;
                    if (!data) {
                        return true;
                    }
                    if (data.nodes) {
                        return false;
                    } else {
                        return true;
                    }
                }

                /**
                 *
                 *
                 * @memberof TreeViewTag
                 */
                set ondragndrop(v: TagEventCallback) {
                    this._ondragndrop = v;
                }

                /**
                 *
                 *
                 * @memberof TreeViewTag
                 */
                set data(v: TreeViewDataType) {
                    if (!v) {
                        return;
                    }
                    this._data = v;
                    $(this).empty();
                    if (v.path) {
                        this.treepath = v.path;
                    }
                    let tag = this.itemtag;
                    if (v.tag) {
                        tag = v.tag;
                    }
                    const el = $(`<${tag}>`).appendTo(this);
                    el[0].uify(this.observable);
                    const element = el[0] as TreeViewItemPrototype;
                    element.treeroot = this.is_root() ? this : this.treeroot;
                    element.indent = this.indent;
                    element.treepath = this.treepath;
                    element.open = this.open;
                    element.fetch = this.fetch;
                    element.parent = this;
                    element.data = v;
                    if (this.is_root()) {
                        $(this).off("mousedown", this._treemousedown);
                        if (this.dragndrop) {
                            $(this).on("mousedown", this._treemousedown);
                        }
                    }
                }

                /**
                 *
                 *
                 * @type {TreeViewDataType}
                 * @memberof TreeViewTag
                 */
                get data(): TreeViewDataType {
                    return this._data;
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof TreeViewTag
                 */
                protected mount(): void {
                    this._dnd = {
                        from: undefined,
                        to: undefined,
                    };
                    this._treemousedown = (e) => {
                        let obj: any = $(e.target).closest("afx-tree-view");
                        if (obj.length === 0) {
                            return;
                        }
                        let el = obj[0] as TreeViewTag;
                        if (el === this) {
                            return;
                        }
                        this._dnd.from = el;
                        this._dnd.to = undefined;
                        $(window).on("mouseup", this._treemouseup);
                        return $(window).on("mousemove", this._treemousemove);
                    };

                    this._treemouseup = (e) => {
                        $(window).off("mouseup", this._treemouseup);
                        $(window).off("mousemove", this._treemousemove);
                        $("#systooltip").hide();
                        let obj = $(e.target).closest("afx-tree-view");
                        if (obj.length === 0) {
                            return;
                        }
                        let el = obj[0] as TreeViewTag;
                        if (el.is_leaf()) {
                            el = el.parent;
                        }
                        if (
                            el === this._dnd.from ||
                            el === this._dnd.from.parent
                        ) {
                            return;
                        }
                        this._dnd.to = el;
                        this._ondragndrop({
                            id: this.aid,
                            data: this._dnd,
                        });
                        this._dnd = {
                            from: undefined,
                            to: undefined,
                        };
                    };

                    this._treemousemove = (e) => {
                        if (!e) {
                            return;
                        }
                        if (!this._dnd.from) {
                            return;
                        }
                        const data = this._dnd.from.data;
                        const $label = $("#systooltip");
                        const top = e.clientY + 5;
                        const left = e.clientX + 5;
                        $label.show();
                        const label = $label[0] as LabelTag;
                        label.set(data);
                        $label.css("top", top + "px").css("left", left + "px");
                    };
                }
            }

            define("afx-tree-view", TreeViewTag);
            define("afx-tree-view-item", SimpleTreeViewItem);
        }
    }
}
