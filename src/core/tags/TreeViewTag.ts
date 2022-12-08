namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * Tree view data type definition
             *
             * @export
             * @interface TreeViewDataType
             */
            export interface TreeViewDataType {
                /**
                 * The child nodes data of the current tree node
                 *
                 * @type {TreeViewDataType[]}
                 * @memberof TreeViewDataType
                 */
                nodes?: TreeViewDataType[];

                /**
                 * Boolean indicates whether the current node is opened.
                 * Only work when the current node is not a leaf node
                 *
                 * @type {boolean}
                 * @memberof TreeViewDataType
                 */
                open?: boolean;

                /**
                 * The node's path from the root node
                 *
                 * @type {string}
                 * @memberof TreeViewDataType
                 */
                path?: string;

                /**
                 * Indicates whether this node should be selected
                 *
                 * @type {boolean}
                 * @memberof TreeViewDataType
                 */
                selected?: boolean;
                [propName: string]: any;
            }
            /**
             * Tree node event data type definition
             */
            export type TreeItemEventData = TagEventDataType<
                TreeViewItemPrototype
            >;
            /**
             * Abstract prototype of a tree node. All tree node definition should
             * extend this class
             *
             * @class TreeViewItemPrototype
             * @extends {AFXTag}
             */
            export abstract class TreeViewItemPrototype extends AFXTag {
                /**
                 * Node data placeholder
                 *
                 * @private
                 * @type {TreeViewDataType}
                 * @memberof TreeViewItemPrototype
                 */
                private _data: TreeViewDataType;

                /**
                 * Placeholder for the indent level of the current node from root node
                 *
                 * @private
                 * @type {number}
                 * @memberof TreeViewItemPrototype
                 */
                private _indent: number;

                /**
                 * private event object used by current node event
                 *
                 * @private
                 * @type {TagEventType<TreeItemEventData>}
                 * @memberof TreeViewItemPrototype
                 */
                private _evt: TagEventType<TreeItemEventData>;

                /**
                 * Reference to the root node
                 *
                 * @type {TreeViewTag}
                 * @memberof TreeViewItemPrototype
                 */
                treeroot: TreeViewTag;

                /**
                 * The tree path from the root node
                 *
                 * @type {string}
                 * @memberof TreeViewItemPrototype
                 */
                treepath: string;

                /**
                 * Reference to the parent node of the current node
                 *
                 * @type {TreeViewTag}
                 * @memberof TreeViewItemPrototype
                 */
                parent: TreeViewTag;

                /**
                 * Placeholder for the `fetch` function of the node.
                 * This function is used to fetch the child nodes of the
                 * current nodes. This function should return a promise on
                 * a list of [[TreeViewDataType]]
                 *
                 * @memberof TreeViewItemPrototype
                 */
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
                 * Update the tree, this function
                 * is used to refresh/expand/collapse the
                 * current node based on the input parameter
                 *
                 * @protected
                 * @param {*} p string indication, the value should be:
                 * - `expand`: expand the current node
                 * - `collapse`: collapse the current node
                 * - other string: this string is considered as a tree path of a node. If this value
                 * is the value of current node tree path, the node will be refreshed. Otherwise, nothing
                 * happens
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
                 * Setter:
                 *
                 * Set the data of the current node. This will trigger the
                 * [[ondatachange]] function
                 *
                 * Getter:
                 *
                 * Get the current node's data
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
                get data(): TreeViewDataType {
                    return this._data;
                }

                /**
                 * Setter:
                 *
                 * Select or unselect the current node.
                 * This will trigger the item select event
                 * on the tree root if the parameter is `true`
                 *
                 * Getter:
                 *
                 * Check whether the current node is selected
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
                get selected(): boolean {
                    return this.hasattr("selected");
                }

                /**
                 * Setter:
                 *
                 * Refresh the current node and expands its sub tree.
                 * This function only works if the current node is not
                 * a leaf node
                 *
                 * Getter:
                 *
                 * Check whether the current node is expanded
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
                    } else {
                        $(this.refs.toggle).addClass(
                            "afx-tree-view-folder-close"
                        );
                    }
                }
                get open(): boolean {
                    return this.hasattr("open");
                }
                /**
                 * Setter: Set the current indent level of this node from the root node
                 *
                 * Getter: Get the current indent level
                 *
                 * @type {number}
                 * @memberof TreeViewItemPrototype
                 */
                get indent(): number {
                    return this._indent;
                }
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
                        .css("width", v * 15 + "px")
                        .css("flex-shrink", 0);
                }

                /**
                 * Check whether the current node is not a leaf node
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
                 * Getter: Get the child nodes data of the current node
                 *
                 * Setter: Set the child nodes data of the current node
                 *
                 * @type {TreeViewDataType[]}
                 * @memberof TreeViewItemPrototype
                 */
                get nodes(): TreeViewDataType[] {
                    if (!this._data) return undefined;
                    return this._data.nodes;
                }
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

                /**
                 * Init the tag with default properties data
                 *
                 * @protected
                 * @memberof TreeViewItemPrototype
                 */
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
                 * Mount the tag and bind basic events
                 *
                 * @protected
                 * @memberof TreeViewItemPrototype
                 */
                protected mount(): void {
                    $(this.refs.container)
                        .css("padding", 0)
                        .css("margin", 0)
                        .css("display","flex")
                        .css("flex-direction", "row")
                        .css("align-items", "center")
                        .css("white-space", "nowrap");
                    //$(this.refs.itemholder).css("display", "inline-block");
                    $(this.refs.wrapper).on("click",(e) => {
                        this.selected = true;
                    });
                    $(this.refs.wrapper).on("dblclick", (e) => {
                        this._evt.data.dblclick = true;
                        this.selected = true;
                    });

                    $(this.refs.toggle)
                        //.css("display", "inline-block")
                        .css("width", "15px")
                        .css("flex-shrink", 0)
                        .addClass("afx-tree-view-item")
                        .on("click",(e) => {
                            this.open = !this.open;
                            e.preventDefault();
                            return e.stopPropagation();
                        });
                }

                /**
                 * Layout definition of a node. This function
                 * returns the definition of the base outer layout
                 * of a node. Custom inner layout of the node should
                 * be defined in the [[itemlayout]] function
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
                 * This function need to be implemented by all subclasses
                 * to define the inner layout of the node
                 *
                 * @protected
                 * @abstract
                 * @returns {TagLayoutType[]}
                 * @memberof TreeViewItemPrototype
                 */
                protected abstract itemlayout(): TagLayoutType[];

                /**
                 * This function is called when the node data change.
                 * It needs to be implemented on all subclasses of this
                 * class
                 *
                 * @protected
                 * @abstract
                 * @memberof TreeViewItemPrototype
                 */
                protected abstract ondatachange(): void;
            }

            /**
             * SimpleTreeViewItem extends [[TreeViewItemPrototype]] and
             * define it inner layout using a [[LabelTag]]
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
                 * Refresh the label when data changed
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
                 * Inner layout definition
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
             * A tree view widget presents a hierarchical list of nodes.
             *
             * @export
             * @class TreeViewTag
             * @extends {AFXTag}
             */
            export class TreeViewTag extends AFXTag {
                /**
                 * Reference to the selected node
                 *
                 * @private
                 * @type {TreeViewItemPrototype}
                 * @memberof TreeViewTag
                 */
                private _selectedItem: TreeViewItemPrototype;

                /**
                 * Placeholder for tree select event handle
                 *
                 * @private
                 * @type {TagEventCallback<TreeItemEventData>}
                 * @memberof TreeViewTag
                 */
                private _ontreeselect: TagEventCallback<TreeItemEventData>;

                /**
                 * Place holder for tree double click event handle
                 *
                 * @private
                 * @type {TagEventCallback<TreeItemEventData>}
                 * @memberof TreeViewTag
                 */
                private _ontreedbclick: TagEventCallback<TreeItemEventData>;

                /**
                 * Placeholder for drag and drop event handle
                 *
                 * @private
                 * @type {TagEventCallback<DnDEventDataType<TreeViewTag>>}
                 * @memberof TreeViewTag
                 */
                private _ondragndrop: TagEventCallback<
                    DnDEventDataType<TreeViewTag>
                >;

                /**
                 * Tree data placeholder
                 *
                 * @private
                 * @type {TreeViewDataType}
                 * @memberof TreeViewTag
                 */
                private _data: TreeViewDataType;

                /**
                 * Placeholder for private dragndrop mouse down event handle
                 *
                 * @private
                 * @memberof TreeViewTag
                 */
                private _treemousedown: (e: JQuery.MouseEventBase) => void;

                /**
                 * Placeholder for private dragndrop mouse up event handle
                 *
                 * @private
                 * @memberof TreeViewTag
                 */
                private _treemouseup: (e: JQuery.MouseEventBase) => void;

                /**
                 * Placeholder for private dragndrop mouse move event handle
                 *
                 * @private
                 * @memberof TreeViewTag
                 */
                private _treemousemove: (e: JQuery.MouseEventBase) => void;

                /**
                 * Private data object passing between dragndrop mouse event
                 *
                 * @private
                 * @type {{ from: TreeViewTag[]; to: TreeViewTag }}
                 * @memberof TreeViewTag
                 */
                private _dnd: { from: TreeViewTag[]; to: TreeViewTag };

                /**
                 * Reference to parent tree of the current tree.
                 * This value is undefined if the current tree is the root
                 *
                 * @type {TreeViewTag}
                 * @memberof TreeViewTag
                 */
                parent: TreeViewTag;

                /**
                 * Reference to the root tree, this value is undefined
                 * if the curent tree is root
                 *
                 * @type {TreeViewTag}
                 * @memberof TreeViewTag
                 */
                treeroot: TreeViewTag;

                /**
                 * tree path of the current tree from the root
                 *
                 * @type {string}
                 * @memberof TreeViewTag
                 */
                treepath: string;

                /**
                 * Indent level of the current tree
                 *
                 * @type {number}
                 * @memberof TreeViewTag
                 */
                indent: number;

                /**
                 * Indicates whether the tree should be expanded
                 *
                 * @type {boolean}
                 * @memberof TreeViewTag
                 */
                open: boolean;
                /**
                 * Placeholder for the `fetch` function of the tree.
                 * This function is used to fetch the child nodes of the
                 * current tree. This function should return a promise on
                 * a list of [[TreeViewDataType]]
                 *
                 * @memberof TreeViewTag
                 */
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
                 * Init the tree view before mounting:
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
                 * Layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof TreeViewTag
                 */
                protected layout(): TagLayoutType[] {
                    return [];
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof TreeViewTag
                 */
                protected reload(d?: any): void {}
                /**
                 * Setter: Enable/disable drag and drop event on the tree
                 *
                 * Getter: Check whether the drag and drop event is enabled
                 *
                 * @memberof TreeViewTag
                 */
                set dragndrop(v: boolean) {
                    this.attsw(v, "dragndrop");
                }
                get dragndrop(): boolean {
                    return this.hasattr("dragndrop");
                }

                /**
                 * Set the tree select event handle
                 *
                 * @memberof TreeViewTag
                 */
                set ontreeselect(v: TagEventCallback<TreeItemEventData>) {
                    this._ontreeselect = v;
                }

                /**
                 * Set the tree double click event handle
                 *
                 * @memberof TreeViewTag
                 */
                set ontreedbclick(v: TagEventCallback<TreeItemEventData>) {
                    this._ontreedbclick = v;
                }

                /**
                 * Setter:
                 *
                 * Set the default tag name of the tree node.
                 * If there is no tag name in the node data,
                 * this value will be used when creating node.
                 *
                 * Defaut to `afx-tree-view-item`
                 *
                 * Getter:
                 *
                 * Get the default node tag name
                 *
                 * @memberof TreeViewTag
                 */
                set itemtag(v: string) {
                    $(this).attr("itemtag", v);
                }
                get itemtag(): string {
                    return $(this).attr("itemtag");
                }

                /**
                 * Unselect the selected element in the tree
                 *
                 * @memberof TreeViewTag
                 */
                unselect(): void {
                    if (this.selectedItem) {
                        this._selectedItem.selected = false;
                    }
                }

                /**
                 * Setter: Set the selected node using its DOM element
                 *
                 * Getter: Get the DOM element of the selected node
                 *
                 * @type {TreeViewItemPrototype}
                 * @memberof TreeViewTag
                 */
                get selectedItem(): TreeViewItemPrototype {
                    return this._selectedItem;
                }
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
                 * Expand all nodes in the tree
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
                 * Collapse all nodes in the tree
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
                 * This function will trigger the tree select or tree double click
                 * event
                 *
                 * @param {TagEventType} e
                 * @returns {void}
                 * @memberof TreeViewTag
                 */
                itemclick(e: TagEventType<TreeItemEventData>): void {
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
                 * Check whether the current tree is a root tree
                 *
                 * @returns {boolean}
                 * @memberof TreeViewTag
                 */
                is_root(): boolean {
                    return this.treeroot === undefined;
                }

                /**
                 * Check whether the current tree tag is a leaf
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
                 * Set drag and drop event handle
                 *
                 * @memberof TreeViewTag
                 */
                set ondragndrop(
                    v: TagEventCallback<DnDEventDataType<TreeViewTag>>
                ) {
                    this._ondragndrop = v;
                }

                /**
                 * Setter:
                 *
                 * Set the tree data. This operation will create
                 * all tree node elements of the current tree
                 *
                 * Getter:
                 *
                 * Get the tree data
                 *
                 * @memberof TreeViewTag
                 */
                set data(v: TreeViewDataType) {
                    this._selectedItem = undefined;
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
                get data(): TreeViewDataType {
                    return this._data;
                }

                /**
                 * Mount the tree view
                 *
                 * @protected
                 * @memberof TreeViewTag
                 */
                protected mount(): void {
                    this._dnd = {
                        from: [],
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
                        this._dnd.from = [el];
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
                            el === this._dnd.from[0] ||
                            el === this._dnd.from[0].parent
                        ) {
                            return;
                        }
                        this._dnd.to = el;
                        this._ondragndrop({
                            id: this.aid,
                            data: this._dnd,
                        });
                        this._dnd = {
                            from: [],
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
                        const data = this._dnd.from[0].data;
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
