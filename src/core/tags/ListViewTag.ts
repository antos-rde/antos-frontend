namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * List item event data type
             */
            export type ListItemEventData = TagEventDataType<ListViewItemTag>;
            /**
             * A list item represent the individual view of an item in the [[ListView]].
             * This class is an abstract prototype class, implementation of any
             * list view item should extend it
             *
             *
             * @export
             * @abstract
             * @class ListViewItemTag
             * @extends {AFXTag}
             */
            export abstract class ListViewItemTag extends AFXTag {
                /**
                 * Data placeholder for the list item
                 *
                 * @private
                 * @type {GenericObject<any>}
                 * @memberof ListViewItemTag
                 */
                private _data: GenericObject<any>;

                /**
                 * placeholder for the item select event callback
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewItemTag
                 */
                private _onselect: TagEventCallback<ListItemEventData>;

                /**
                 * Context menu event callback handle
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewItemTag
                 */
                private _onctxmenu: TagEventCallback<ListItemEventData>;

                /**
                 * Click event callback placeholder
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewItemTag
                 */
                private _onclick: TagEventCallback<ListItemEventData>;

                /**
                 * Double click event callback handle
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewItemTag
                 */
                private _ondbclick: TagEventCallback<ListItemEventData>;

                /**
                 * Item close event callback placeholder
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewItemTag
                 */
                private _onclose: TagEventCallback<ListItemEventData>;

                /**
                 *Creates an instance of ListViewItemTag.
                 * @memberof ListViewItemTag
                 */
                constructor() {
                    super();
                    this._onselect = this._onctxmenu = this._onclick = this._ondbclick = this._onclose = (
                        e
                    ) => {};
                }

                /**
                 * Setter: Turn on/off the `closable` feature of the list item
                 *
                 * Getter: Check whether the item is closable
                 *
                 * @memberof ListViewItemTag
                 */
                set closable(v: boolean) {
                    this.attsw(v, "closable");
                    if (v) {
                        $(this.refs.btcl).show();
                    } else {
                        $(this.refs.btcl).hide();
                    }
                }
                get closable(): boolean {
                    return this.hasattr("closable");
                }
                /**
                 * Set item select event handle
                 *
                 * @memberof ListViewItemTag
                 */
                set onitemselect(v: TagEventCallback<ListViewItemTag>) {
                    this._onselect = v;
                }

                /**
                 * Setter: select/unselect the current item
                 *
                 * Getter: Check whether the current item is selected
                 *
                 * @memberof ListViewItemTag
                 */
                set selected(v: boolean) {
                    this.attsw(v, "selected");
                    $(this.refs.item).removeClass();
                    this._data.selected = v;
                    if (!v) {
                        return;
                    }
                    $(this.refs.item).addClass("selected");
                    this._onselect({ id: this.aid, data: this });
                }
                get selected(): boolean {
                    return this.hasattr("selected");
                }
                /**
                 * Set the context menu event handle
                 *
                 * @memberof ListViewItemTag
                 */
                set onctxmenu(v: TagEventCallback<ListViewItemTag>) {
                    this._onctxmenu = v;
                }

                /**
                 * Set the item click event handle
                 *
                 * @memberof ListViewItemTag
                 */
                set onitemclick(v: TagEventCallback<ListViewItemTag>) {
                    this._onclick = v;
                }

                /**
                 * Set the item double click event handle
                 *
                 * @memberof ListViewItemTag
                 */
                set onitemdbclick(v: TagEventCallback<ListViewItemTag>) {
                    this._ondbclick = v;
                }

                /**
                 * set the item close event handle
                 *
                 * @memberof ListViewItemTag
                 */
                set onitemclose(v: TagEventCallback<ListViewItemTag>) {
                    this._onclose = v;
                }

                /**
                 * Mount the tag and bind some events
                 *
                 * @protected
                 * @memberof ListViewItemTag
                 */
                protected mount(): void {
                    $(this).addClass("afx-list-item");
                    $(this.refs.item).on("contextmenu", (e) => {
                        this._onctxmenu({ id: this.aid, data: this });
                    });

                    $(this.refs.item).on("click",(e) => {
                        this._onclick({ id: this.aid, data: this, originalEvent: e });
                        e.stopPropagation();
                    });

                    $(this.refs.item).on("dblclick",(e) => {
                        this._ondbclick({ id: this.aid, data: this, originalEvent: e });
                        e.stopPropagation();
                    });
                    $(this.refs.btcl).on("click",(e) => {
                        this._onclose({ id: this.aid, data: this, originalEvent: e });
                        e.preventDefault();
                        e.stopPropagation();
                    });
                }

                /**
                 * Layout definition of the item tag.
                 * This function define the outer layout of the item.
                 * Custom inner layout of each item implementation should
                 * be defined in [[itemlayout]]
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof ListViewItemTag
                 */
                protected layout(): TagLayoutType[] {
                    let children = [{el: "i", class: "closable", ref: "btcl"}] as TagLayoutType[];
                    const itemlayout = this.itemlayout();
                    if(Array.isArray(itemlayout))
                    {
                        children = children.concat(itemlayout);
                    }
                    else
                    {
                        children.unshift(itemlayout);
                    }

                    return [
                        {
                            el: "li",
                            ref: "item",
                            children:children,
                        },
                    ];
                }

                /**
                 * Setter:
                 *
                 * Set the data of the list item. This will
                 * trigger the [[ondatachange]] function
                 *
                 * Getter:
                 *
                 * Get the data of the current list item
                 *
                 * @memberof ListViewItemTag
                 */
                set data(v: GenericObject<any>) {
                    this._data = v;
                    if(v)
                    {
                        this.attach(v);
                    }
                    this.ondatachange();
                }
                get data(): GenericObject<any> {
                    return this._data;
                }

                /**
                 * Any subclass of this class should implement this
                 * function to provide its custom item layout
                 *
                 * @protected
                 * @abstract
                 * @returns {TagLayoutType | TagLayoutType[]}
                 * @memberof ListViewItemTag
                 */
                protected abstract itemlayout(): TagLayoutType | TagLayoutType[];

                /**
                 * This function is called when the item data is changed.
                 * It should be implemented in all subclass of this class
                 *
                 * @protected
                 * @abstract
                 * @memberof ListViewItemTag
                 */
                protected abstract ondatachange(): void;
            }

            /**
             * The layout of a simple list item contains only a
             * AFX label
             *
             * @export
             * @class SimpleListItemTag
             * @extends {ListViewItemTag}
             */
            export class SimpleListItemTag extends ListViewItemTag {
                /**
                 *Creates an instance of SimpleListItemTag.
                 * @memberof SimpleListItemTag
                 */
                constructor() {
                    super();
                }

                /**
                 * Reset some property to default
                 *
                 * @protected
                 * @memberof SimpleListItemTag
                 */
                protected init(): void {
                    this.closable = false;
                    this.data = {};
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof SimpleListItemTag
                 */
                protected calibrate(): void {}

                /**
                 * Refresh the inner label when the item data
                 * is changed
                 *
                 * @protected
                 * @returns {void}
                 * @memberof SimpleListItemTag
                 */
                protected ondatachange(): void {
                    const v = this.data;
                    if (!v) {
                        return;
                    }
                    const label = this.refs.label as LabelTag;
                    label.set(v);
                    if (v.selected) {
                        this.selected = v.selected;
                    }
                    if (v.closable) {
                        this.closable = v.closable;
                    }
                }

                /**
                 * Re-render the list item
                 *
                 * @protected
                 * @memberof SimpleListItemTag
                 */
                protected reload(): void {
                    this.data = this.data;
                }

                /**
                 * List item custom layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType | TagLayoutType[]}
                 * @memberof SimpleListItemTag
                 */
                protected itemlayout(): TagLayoutType | TagLayoutType[] {
                    return { el: "afx-label", ref: "label" };
                }
            }


            /**
             * The layout of a double line list item contains two
             * AFX labels
             *
             * @export
             * @class DoubleLineListItemTag
             * @extends {ListViewItemTag}
             */
            export class DoubleLineListItemTag extends ListViewItemTag {
                /**
                 *Creates an instance of DoubleLineListItemTag.
                 * @memberof DoubleLineListItemTag
                 */
                constructor() {
                    super();
                }

                /**
                 * Reset some property to default
                 *
                 * @protected
                 * @memberof DoubleLineListItemTag
                 */
                protected init(): void {
                    this.closable = false;
                    this.data = {};
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof DoubleLineListItemTag
                 */
                protected calibrate(): void {}

                /**
                 * Refresh the inner label when the item data
                 * is changed
                 *
                 * @protected
                 * @returns {void}
                 * @memberof DoubleLineListItemTag
                 */
                protected ondatachange(): void {
                    const v = this.data;
                    if (!v) {
                        return;
                    }
                    const line1 = this.refs.line1 as LabelTag;
                    const line2 = this.refs.line2 as LabelTag;
                    line1.set(v);
                    if(v.description)
                    {
                        line2.set(v.description);
                    }
                    if (v.selected) {
                        this.selected = v.selected;
                    }
                    if (v.closable) {
                        this.closable = v.closable;
                    }
                }

                /**
                 * Re-render the list item
                 *
                 * @protected
                 * @memberof DoubleLineListItemTag
                 */
                protected reload(): void {
                    this.data = this.data;
                }

                /**
                 * List item custom layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType | TagLayoutType[]}
                 * @memberof DoubleLineListItemTag
                 */
                protected itemlayout(): TagLayoutType | TagLayoutType[] {
                    return [{ el: "afx-label", ref: "line1", class:"title" }, { el: "afx-label", ref: "line2", class:"description" }];
                }
            }

            /**
             * This tag defines a traditional or a dropdown list widget.
             * It contains a collection of list items in which layout
             * of each item may be variable
             *
             * @export
             * @class ListViewTag
             * @extends {AFXTag}
             */
            export class ListViewTag extends AFXTag {
                /**
                 * placeholder of list select event handle
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewTag
                 */
                private _onlistselect: TagEventCallback<ListItemEventData>;

                /**
                 * placeholder of list double click event handle
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewTag
                 */
                private _onlistdbclick: TagEventCallback<ListItemEventData>;

                /**
                 * placeholder of list drag and drop event handle
                 *
                 * @private
                 * @type {TagEventCallback<DnDEventDataType<ListViewItemTag>>}
                 * @memberof ListViewTag
                 */
                private _ondragndrop: TagEventCallback<
                    DnDEventDataType<ListViewItemTag>
                >;

                /**
                 * placeholder of list item close event handle
                 *
                 * @private
                 * @memberof ListViewTag
                 */
                private _onitemclose: (
                    e: TagEventType<ListItemEventData>
                ) => boolean;

                /**
                 * placeholder of drag and drop mouse down event handle
                 *
                 * @private
                 * @memberof ListViewTag
                 */
                private _onmousedown: (e: JQuery.MouseEventBase) => void;

                /**
                 * placeholder of drag and drop mouse up event handle
                 *
                 * @private
                 * @memberof ListViewTag
                 */
                private _onmouseup: (e: JQuery.MouseEventBase) => void;

                /**
                 * placeholder of drag and drop mouse move event handle
                 *
                 * @private
                 * @memberof ListViewTag
                 */
                private _onmousemove: (e: JQuery.MouseEventBase) => void;

                /**
                 * Reference to the latest selected DOM item
                 *
                 * @private
                 * @type {ListViewItemTag}
                 * @memberof ListViewTag
                 */
                private _selectedItem: ListViewItemTag;

                /**
                 * A collection of selected items in the list.
                 * The maximum size of this collection is 1 if
                 * the [[multiselect]] feature is disabled
                 *
                 * @private
                 * @type {ListViewItemTag[]}
                 * @memberof ListViewTag
                 */
                private _selectedItems: ListViewItemTag[];
                
                /**
                 * The anchor element that the list view positioned on
                 * This is helpful when rendering dropdown list
                 * @private
                 * @type{HTMLElement}
                 * @memberof ListViewTag
                 */
                private _anchor: HTMLElement;
                /**
                 * Data placeholder of the list
                 *
                 * @private
                 * @type {GenericObject<any>[]}
                 * @memberof ListViewTag
                 */
                private _data: GenericObject<any>[];

                /**
                 * Event data passing between mouse event when performing
                 * drag and drop on the list
                 *
                 * @private
                 * @type {{ from: ListViewItemTag[]; to: ListViewItemTag }}
                 * @memberof ListViewTag
                 */
                private _dnd: { from: ListViewItemTag[]; to: ListViewItemTag };

                /**
                 *Creates an instance of ListViewTag.
                 * @memberof ListViewTag
                 */
                constructor() {
                    super();
                    this._onlistdbclick = this._onlistselect = this._ondragndrop = (
                        e: TagEventType<ListItemEventData>
                    ) => {};
                    this._onitemclose = (
                        e: TagEventType<ListItemEventData>
                    ) => {
                        return true;
                    };
                    this._onmousedown = this._onmouseup = this._onmousemove = (
                        e: JQuery.MouseEventBase
                    ) => {};
                    this._selectedItems = [];
                    this._selectedItem = undefined;
                }

                /**
                 * Reset the tag's properties to the default values
                 *
                 * @protected
                 * @memberof ListViewTag
                 */
                protected init(): void {
                    this.data = [];
                    this.multiselect = false;
                    this.dropdown = false;
                    this.selected = -1;
                    this.dragndrop = false;
                    this._anchor = undefined;
                    this.itemtag = "afx-list-item";
                    $(this).addClass("afx-list-view");
                }

                /**
                 * This function does nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof ListViewTag
                 */
                protected reload(d?: any): void {}

                /**
                 * Setter: toggle between dropdown and traditional list
                 *
                 * Getter: Check whether the list is dropdown or traditional list
                 *
                 * @memberof ListViewTag
                 */
                set dropdown(v: boolean) {
                    this.attsw(v, "dropdown");
                    $(this.refs.container).removeAttr("style");
                    $(this.refs.mlist).removeAttr("style");
                    $(this).removeClass("dropdown");
                    const drop = (e: any) => {
                        return this.dropoff(e);
                    };
                    const show = (e: any) => {
                        return this.showlist(e);
                    };
                    if (v) {
                        $(this).addClass("dropdown");
                        $(this.refs.current).show();
                        $(document).on("click", drop);
                        $(this.refs.current).on("click", show);
                        $(this.refs.mlist).hide();
                        this.calibrate();
                    } else {
                        $(this.refs.current).hide();
                        $(document).off("click", drop);
                        $(this.refs.current).off("click", show);
                    }
                }

                /**
                 * Set drag and drop event handle
                 *
                 * @memberof ListViewTag
                 */
                set ondragndrop(
                    v: TagEventCallback<DnDEventDataType<ListViewItemTag>>
                ) {
                    this._ondragndrop = v;
                }

                /**
                 * Set list select event handle
                 *
                 * @memberof ListViewTag
                 */
                set onlistselect(v: TagEventCallback<ListItemEventData>) {
                    this._onlistselect = v;
                }

                /**
                 * Set double click event handle
                 *
                 * @memberof ListViewTag
                 */
                set onlistdbclick(v: TagEventCallback<ListItemEventData>) {
                    this._onlistdbclick = v;
                }

                /**
                 * Set item close event handle
                 *
                 * @memberof ListViewTag
                 */
                set onitemclose(
                    v: (e: TagEventType<ListItemEventData>) => boolean
                ) {
                    this._onitemclose = v;
                }

                get dropdown(): boolean {
                    return this.hasAttribute("dropdown");
                }

                /**
                 * Setter:
                 *
                 * Set the default tag name of list's items.
                 * If the tag name is not specified in the
                 * data of a list item, this tag will be used
                 *
                 * Getter:
                 *
                 * Get the default tag name of list item
                 *
                 * @memberof ListViewTag
                 */
                set itemtag(v: string) {
                    $(this).attr("itemtag", v);
                }
                get itemtag(): string {
                    return $(this).attr("itemtag");
                }

                /**
                 * Setter:
                 *
                 * Turn on/off of the `multiselect` feature
                 *
                 * Getter:
                 *
                 * Check whether multi-select is allowed
                 * in this list
                 *
                 * @memberof ListViewTag
                 */
                set multiselect(v: boolean) {
                    this.attsw(v, "multiselect");
                }
                get multiselect() {
                    if (this.dropdown) {
                        return false;
                    }
                    return this.hasattr("multiselect");
                }

                /**
                 * Setter: Enable/disable drag and drop event in the list
                 *
                 * Getter: Check whether the drag and drop event is enabled
                 *
                 * @memberof ListViewTag
                 */
                set dragndrop(v: boolean) {
                    this.attsw(v, "dragndrop");
                }
                get dragndrop(): boolean {
                    return this.hasattr("dragndrop");
                }

                /**
                 * Set the buttons layout of the list.
                 * Button layout allows to add some custom
                 * behaviors to the list.
                 *
                 * Each button data should define the [[onbtclick]]
                 * event handle to specify the custom behavior
                 *
                 * When the list is configured as dropdown. The buttons
                 * layout will be disabled
                 *
                 * Example of a button data:
                 *
                 * ```
                 * {
                 *      text: "Button text",
                 *      icon: "home://path/to/icon.png",
                 *      iconclass: "icon-class-name",
                 *      onbtclick: (e) => console.log(e)
                 * }
                 * ```
                 *
                 * @memberof ListViewTag
                 */
                set buttons(v: GenericObject<any>[]) {
                    if (this.dropdown) {
                        return;
                    }
                    if (!v || !(v.length > 0)) {
                        return;
                    }
                    $(this.refs.btlist).empty();
                    for (let item of v) {
                        $(this.refs.btlist).show();
                        const bt = $("<afx-button>").appendTo(this.refs.btlist);
                        bt[0].uify(this.observable);
                        (bt[0] as ButtonTag).set(item);
                    }
                }
                /**
                 * Getter: Get list direction: horizontal or vertical (default)
                 *
                 * Setter: Get list direction: horizontal or vertical
                 *
                 * @type {string}
                 * @memberof ListViewTag
                 */
                set dir(v: string) {
                    if(this.dropdown)
                    {
                        $(this).attr("dir", "vertical");
                    }
                    else
                    {
                        $(this).attr("dir", v);
                    }
                    this.calibrate();
                }
                get dir(): string {
                    return $(this).attr("dir");
                }
                /**
                 * Getter: Get data of the list
                 *
                 * Setter: Set data to the list
                 *
                 * @type {GenericObject<any>[]}
                 * @memberof ListViewTag
                 */
                get data(): GenericObject<any>[] {
                    return this._data;
                }
                set data(data: GenericObject<any>[]) {
                    this._data = data;
                    this._selectedItem = undefined;
                    this._selectedItems = [];
                    $(this.refs.mlist).empty();
                    for (let item of data) {
                        this.push(item, false);
                    }
                    $(this.refs.container).off("mousedown", this._onmousedown);
                    if (this.dragndrop && !this.dropdown) {
                        $(this.refs.container).on(
                            "mousedown",
                            this._onmousedown
                        );
                    }
                    this.ondatachange();
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof ListViewTag
                 */
                protected ondatachange(): void {}

                /**
                 * Setter: Select list item(s) by their indexes
                 *
                 * Getter: Get the indexes of all selected items
                 *
                 * @memberof ListViewTag
                 */
                set selected(idx: number | number[]) {
                    if (!this.data) {
                        return;
                    }
                    const select = (i: number) => {
                        if (i < 0) {
                            this.unselect();
                            return;
                        }
                        const data = this.data;
                        if (i >= data.length) {
                            return;
                        }
                        const el = data[i].domel as ListViewItemTag;
                        el.selected = true;
                    };
                    if (Array.isArray(idx)) {
                        if (this.multiselect) {
                            for (const i of idx as number[]) {
                                select(i);
                            }
                        }
                    } else {
                        select(idx as number);
                    }
                }

                /**
                 * Get the latest selected item
                 *
                 * @readonly
                 * @type {ListViewItemTag}
                 * @memberof ListViewTag
                 */
                get selectedItem(): ListViewItemTag {
                    return this._selectedItem;
                }

                /**
                 * Get all the selected items
                 *
                 * @readonly
                 * @type {ListViewItemTag[]}
                 * @memberof ListViewTag
                 */
                get selectedItems(): ListViewItemTag[] {
                    return this._selectedItems;
                }
                /**
                 * get the selected item index
                 * 
                 * @readonly
                 * @type {number}
                 * @memberof ListViewTag
                 */
                get selected(): number | number[] {
                    if (this.multiselect) {
                        return this.selectedItems.map(function (
                            it: ListViewItemTag
                        ) {
                            return $(it).index();
                        });
                    }
                    return $(this.selectedItem).index();
                }

                /**
                 * Add an item to the beginning of the list
                 *
                 * @param {GenericObject<any>} item
                 * @returns {ListViewItemTag} the added list item element
                 * @memberof ListViewTag
                 */
                unshift(item: GenericObject<any>): ListViewItemTag {
                    return this.push(item, true);
                }

                /**
                 * check whether the list has data
                 *
                 * @private
                 * @param {GenericObject<any>} v
                 * @returns
                 * @memberof ListViewTag
                 */
                private has_data(v: GenericObject<any>) {
                    return this.data && this.data.includes(v);
                }

                /**
                 * Add an item to the beginning or end of the list
                 *
                 * @param {GenericObject<any>} item list item data
                 * @param {boolean} flag indicates whether to add the item in the beginning of the list
                 * @returns {ListViewItemTag} the added list item element
                 * @memberof ListViewTag
                 */
                push(
                    item: GenericObject<any>,
                    flag?: boolean
                ): ListViewItemTag {
                    let tag = this.itemtag;
                    if (item.tag) tag = item.tag;
                    const el = $(`<${tag}>`);
                    if (flag) {
                        if (!this.has_data(item)) {
                            this.data.unshift(item);
                        }
                        $(this.refs.mlist).prepend(el[0]);
                    } else {
                        if (!this.has_data(item)) {
                            this.data.push(item);
                        }
                        el.appendTo(this.refs.mlist);
                    }
                    el[0].uify(this.observable);
                    const element = el[0] as ListViewItemTag;
                    $(element).attr("list-id",this.aid);
                    element.onctxmenu = (e) => {
                        return this.iclick(e, true);
                    };
                    element.onitemdbclick = (e) => {
                        this.idbclick(e);
                        this.iclick(e, false);
                    };
                    element.onitemclick = (e) => {
                        return this.iclick(e, false);
                    };
                    element.onitemselect = (e) => {
                        return this.iselect(e);
                    };
                    element.onitemclose = (e) => {
                        return this.iclose(e);
                    };
                    element.data = item;
                    return element;
                }

                /**
                 * Delete an item
                 *
                 * @param {ListViewItemTag} item item DOM element
                 * @memberof ListViewTag
                 */
                delete(item: ListViewItemTag): void {
                    const el = item.data;
                    const data = this.data;
                    if (this.selectedItem === item) {
                        this._selectedItem = undefined;
                    }
                    const list = this.selectedItems;
                    if (list.includes(item)) {
                        list.splice(list.indexOf(item), 1);
                    }
                    if (data.includes(el)) {
                        data.splice(data.indexOf(el), 1);
                    }
                    $(item).remove();
                }

                /**
                 * Select item next to the currently selected item.
                 * If there is no item selected, the first item will
                 * be selected
                 *
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                selectNext(): void {
                    if (this.multiselect) {
                        return;
                    }
                    const el = this.selectedItem;
                    let idx = 0;
                    if (el) {
                        idx = $(el).index() + 1;
                    }
                    this.selected = idx;
                }

                /**
                 * Select the previous item in the list.
                 *
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                selectPrev(): void {
                    if (this.multiselect) {
                        return;
                    }
                    const el = this.selectedItem;
                    let idx = 0;
                    if (el) {
                        idx = $(el).index() - 1;
                    }
                    this.selected = idx;
                }

                /**
                 * Unselect all the selected items in the list
                 *
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                unselect(): void {
                    for (let v of this.selectedItems) {
                        v.selected = false;
                    }
                    this._selectedItems = [];
                    this._selectedItem = undefined;
                }

                /**
                 * This function triggers the click event on an item
                 *
                 * @private
                 * @param {TagEventType} e tag event object
                 * @param {boolean} flag indicates whether this is a double click event
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                private iclick(
                    e: TagEventType<ListViewItemTag>,
                    flag: boolean
                ): void {
                    if (!e.data) {
                        return;
                    }
                    const list = this.selectedItems;
                    if (this.multiselect && list.includes(e.data) && !flag) {
                        list.splice(list.indexOf(e.data), 1);
                        e.data.selected = false;
                        return;
                    }
                    e.data.selected = true;
                }

                /**
                 * This function triggers the double click event on an item
                 *
                 * @protected
                 * @param {TagEventType} e tag event object
                 * @returns
                 * @memberof ListViewTag
                 */
                protected idbclick(e: TagEventType<ListViewItemTag>) {
                    const evt: TagEventType<ListItemEventData> = {
                        id: this.aid,
                        data: { item: e.data },
                    };
                    this._onlistdbclick(evt);
                    return this.observable.trigger("listdbclick", evt);
                }

                /**
                 * This function triggers the list item select event
                 *
                 * @protected
                 * @param {TagEventType} e tag event object
                 * @returns
                 * @memberof ListViewTag
                 */
                protected iselect(e: TagEventType<ListViewItemTag>) {
                    if (!e.data) {
                        return;
                    }
                    var edata = { item: e.data, items: [] };
                    if (this.multiselect) {
                        if (this.selectedItems.includes(e.data)) {
                            return;
                        }
                        this._selectedItem = e.data;
                        this.selectedItems.push(e.data);
                        edata.items = this.selectedItems;
                    } else {
                        if(this.selectedItems.length > 0)
                        {
                            for(const item of this.selectedItems)
                            {
                                if(item != e.data)
                                {
                                    item.selected = false;
                                }
                            }
                        }
                        if (this.selectedItem === e.data) {
                            return;
                        }
                        if (this.selectedItem) {
                            this.selectedItem.selected = false;
                        }
                        this._selectedItem = e.data;
                        this._selectedItems = [e.data];
                        edata.items = [e.data];
                        //scroll element
                        const li = $(e.data).children()[0];
                        const offset = $(this.refs.container).offset();
                        const top = $(this.refs.container).scrollTop();
                        if (
                            $(li).offset().top + $(li).height() >
                            $(this.refs.container).height() + offset.top
                        ) {
                            $(this.refs.container).scrollTop(
                                top +
                                    $(this.refs.container).height() -
                                    $(li).height()
                            );
                        } else if ($(li).offset().top < offset.top) {
                            $(this.refs.container).scrollTop(
                                top -
                                    $(this.refs.container).height() +
                                    $(li).height()
                            );
                        }
                    }

                    if (this.dropdown) {
                        const label = this.refs.drlabel as LabelTag;
                        label.set(e.data.data);
                        $(this.refs.mlist).hide();
                    }
                    const evt = { id: this.aid, data: edata };
                    this._onlistselect(evt);
                    return this.observable.trigger("listselect", evt);
                }

                /**
                 * Mount the tag and bind some basic event
                 *
                 * @protected
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                protected mount(): void {
                    this._dnd = {
                        from: undefined,
                        to: undefined,
                    };
                    this._onmousedown = (e) => {
                        if(this.multiselect || this.selectedItems == undefined || this.selectedItems.length == 0)
                        {
                            return;
                        }
                        let el: any = $(e.target).closest(
                            `[list-id='${this.aid}']`
                        );
                        if (el.length === 0) {
                            return;
                        }
                        el = el[0];
                        if(!this.selectedItems.includes(el))
                        {
                            return;
                        }
                        this._dnd.from = this.selectedItems;
                        this._dnd.to = undefined;
                        $(window).on("mouseup", this._onmouseup);
                        $(window).on("mousemove", this._onmousemove);
                    };

                    this._onmouseup = (e) => {
                        $(window).off("mouseup", this._onmouseup);
                        $(window).off("mousemove", this._onmousemove);
                        $("#systooltip").hide();
                        let el: any = $(e.target).closest(
                            `[list-id='${this.aid}']`
                        );
                        if (el.length === 0) {
                            return;
                        }
                        el = el[0];
                        if (this._dnd.from.includes(el)) {
                            return;
                        }
                        this._dnd.to = el;
                        this._ondragndrop({ id: this.aid, data: this._dnd });
                        this._dnd = {
                            from: undefined,
                            to: undefined,
                        };
                    };

                    this._onmousemove = (e) => {
                        if (!e) {
                            return;
                        }
                        if (!this._dnd.from) {
                            return;
                        }
                        const data = {
                            text: '',
                            items: this._dnd.from
                        };
                        if(this._dnd.from.length == 1)
                        {
                            data.text = this._dnd.from[0].data.text;
                        }
                        else
                        {
                            data.text = __("{0} selected elements", this._dnd.from.length).__();
                        }
                        const $label = $("#systooltip");
                        const top = e.clientY + 5;
                        const left = e.clientX + 5;
                        $label.show();
                        const label = $label[0] as LabelTag;
                        label.set(data);
                        return $label
                            .css("top", top + "px")
                            .css("left", left + "px");
                    };
                    const label = (this.refs.drlabel as LabelTag);
                    label.iconclass$ = "bi bi-chevron-down";
                    label.text = "";
                    $(this.refs.drlabel).css("display", "inline-block");
                    $(this.refs.btlist).hide();
                    this.observable.on("resize", (e) => this.calibrate());
                    let anchor = $(this).parent();
                    while (anchor && anchor.css('position') === 'static') {
                        anchor = anchor.parent();
                    }
                    if(anchor && anchor[0])
                    {
                        this._anchor = anchor[0];
                    }
                    return this.calibrate();
                }

                /**
                 * This function triggers the item close event
                 *
                 * @private
                 * @param {TagEventType} e tag event object
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                private iclose(e: TagEventType<ListViewItemTag>): void {
                    if (!e.data) {
                        return;
                    }
                    const evt = { id: this.aid, data: { item: e.data } };
                    const r = this._onitemclose(evt);
                    if (!r) {
                        return;
                    }
                    this.observable.trigger("itemclose", evt);
                    return this.delete(e.data);
                }

                /**
                 * Show the dropdown list.
                 * This function is called only when the list is a dropdown
                 * list
                 *
                 * @protected
                 * @param {*} e
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                protected showlist(e: any): void {
                    if (!this.dropdown) {
                        return;
                    }
                    if(! $(this.refs.mlist).is(":hidden"))
                    {
                        $(this.refs.mlist).hide();
                        return;
                    }
                    
                    const desktoph = $(Ant.OS.GUI.workspace).outerHeight();
                    const wheight = $(this).offset().top + $(this.refs.mlist).outerHeight()*1.5;
                    const position = $(this).position();
                    let offset = 0;
                    if(this._anchor)
                    {
                        offset = $(this._anchor).scrollTop();
                    }
                    if (wheight > desktoph) {
                        
                        const ypos = offset + position.top - $(this.refs.mlist).outerHeight();
                        $(this.refs.mlist)
                            .css("top",`${ypos}px`)
                            .css("left", `${position.left}px`);
                    } else {
                        const ypos = offset + $(this).position().top + $(this.refs.container).outerHeight();
                        $(this.refs.mlist)
                            .css("top", `${ypos}px`)
                            .css("left", `${position.left}px`);
                    }
                    $(this.refs.mlist).show();
                }

                /**
                 * Hide the dropdown list.
                 * This function is called only when the list is a dropdown
                 * list
                 *
                 * @protected
                 * @param {*} e
                 * @memberof ListViewTag
                 */
                protected dropoff(e: any): void {
                    if ($(e.target).closest(this.refs.container).length === 0) {
                        $(this.refs.mlist).hide();
                    }
                }

                /**
                 * Scroll the list view to bottom
                 * 
                 * @memberof ListViewTag
                 */
                scroll_to_bottom()
                {
                    this.refs.mlist.scrollTo({ top: this.refs.mlist.scrollHeight, behavior: 'smooth' })
                }

                /**
                 * Scroll the list view to top
                 * 
                 * @memberof ListViewTag
                 */
                scroll_to_top()
                {
                    this.refs.mlist.scrollTo({ top: 0, behavior: 'smooth' });
                }

                /**
                 * calibrate the list layout
                 *
                 * @protected
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                protected calibrate(): void {
                    if (!this.dropdown) {
                        return;
                    }
                    const w = `${$(this).innerWidth()}px`;
                    const h = `${$(this).outerHeight()}px`;
                    $(this.refs.container).css("width", "100%");
                    $(this.refs.container).css("height", h);
                    
                    $(this.refs.current).css("width", "100%");
                    $(this.refs.mlist).css("width", w);
                }

                /**
                 * List view layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof ListViewTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "div",
                            class: "list-container",
                            ref: "container",
                            children: [
                                {
                                    el: "div",
                                    ref: "current",
                                    children: [
                                        { el: "afx-label", ref: "drlabel" },
                                    ],
                                },
                                { el: "ul", ref: "mlist" },
                            ],
                        },
                        { el: "div", class: "button_container", ref: "btlist" },
                    ];
                }
            }

            define("afx-list-view", ListViewTag);
            define("afx-list-item", SimpleListItemTag);
            define("afx-dbline-list-item", DoubleLineListItemTag);
        }
    }
}
