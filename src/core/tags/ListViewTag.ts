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
             * @abstract
             * @class ListViewItemTag
             * @extends {AFXTag}
             */
            export abstract class ListViewItemTag extends AFXTag {
                private _data: GenericObject<any>;
                private _onselect: TagEventCallback;
                private _onctxmenu: TagEventCallback;
                private _onclick: TagEventCallback;
                private _ondbclick: TagEventCallback;
                private _onclose: TagEventCallback;

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
                 *
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
                 *
                 *
                 * @memberof ListViewItemTag
                 */
                set onitemselect(v: TagEventCallback) {
                    this._onselect = v;
                }

                /**
                 *
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
                 *
                 *
                 * @memberof ListViewItemTag
                 */
                set onctxmenu(v: TagEventCallback) {
                    this._onctxmenu = v;
                }

                /**
                 *
                 *
                 * @memberof ListViewItemTag
                 */
                set onitemclick(v: TagEventCallback) {
                    this._onclick = v;
                }

                /**
                 *
                 *
                 * @memberof ListViewItemTag
                 */
                set onitemdbclick(v: TagEventCallback) {
                    this._ondbclick = v;
                }

                /**
                 *
                 *
                 * @memberof ListViewItemTag
                 */
                set onitemclose(v: TagEventCallback) {
                    this._onclose = v;
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof ListViewItemTag
                 */
                protected mount(): void {
                    $(this.refs.item).attr("dataref", "afx-list-item");
                    $(this.refs.item).contextmenu((e) => {
                        this._onctxmenu({ id: this.aid, data: this });
                    });

                    $(this.refs.item).click((e) => {
                        this._onclick({ id: this.aid, data: this });
                    });

                    $(this.refs.item).dblclick((e) => {
                        this._ondbclick({ id: this.aid, data: this });
                    });
                    $(this.refs.btcl).click((e) => {
                        this._onclose({ id: this.aid, data: this });
                        e.preventDefault();
                        e.stopPropagation();
                    });
                }

                /**
                 *
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof ListViewItemTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "li",
                            ref: "item",
                            children: [
                                this.itemlayout(),
                                { el: "i", class: "closable", ref: "btcl" },
                            ],
                        },
                    ];
                }

                /**
                 *
                 *
                 * @memberof ListViewItemTag
                 */
                set data(v: GenericObject<any>) {
                    this._data = v;
                    this.ondatachange();
                }

                /**
                 *
                 *
                 * @type {GenericObject<any>}
                 * @memberof ListViewItemTag
                 */
                get data(): GenericObject<any> {
                    return this._data;
                }

                /**
                 *
                 *
                 * @protected
                 * @abstract
                 * @returns {TagLayoutType}
                 * @memberof ListViewItemTag
                 */
                protected abstract itemlayout(): TagLayoutType;

                /**
                 *
                 *
                 * @protected
                 * @abstract
                 * @memberof ListViewItemTag
                 */
                protected abstract ondatachange(): void;
            }

            /**
             *
             *
             * @export
             * @class SimpleListItemTag
             * @extends {ListViewItemTag}
             */
            export class SimpleListItemTag extends ListViewItemTag {
                constructor() {
                    super();
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof SimpleListItemTag
                 */
                protected init(): void {
                    this.closable = false;
                    this.data = {};
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof SimpleListItemTag
                 */
                protected calibrate(): void {}

                /**
                 *
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
                 *
                 *
                 * @protected
                 * @memberof SimpleListItemTag
                 */
                protected reload(): void {
                    this.data = this.data;
                }

                /**
                 *
                 *
                 * @protected
                 * @returns {TagLayoutType}
                 * @memberof SimpleListItemTag
                 */
                protected itemlayout(): TagLayoutType {
                    return { el: "afx-label", ref: "label" };
                }
            }

            /**
             *
             *
             * @export
             * @class ListViewTag
             * @extends {AFXTag}
             */
            export class ListViewTag extends AFXTag {
                private _onlistselect: TagEventCallback;
                private _onlistdbclick: TagEventCallback;
                private _ondragndrop: TagEventCallback;
                private _onitemclose: (e: TagEventType) => boolean;
                private _onmousedown: (e: JQuery.MouseEventBase) => void;
                private _onmouseup: (e: JQuery.MouseEventBase) => void;
                private _onmousemove: (e: JQuery.MouseEventBase) => void;
                private _selectedItem: ListViewItemTag;
                private _selectedItems: ListViewItemTag[];
                private _data: GenericObject<any>[];
                private _dnd: { from: ListViewItemTag; to: ListViewItemTag };

                /**
                 *Creates an instance of ListViewTag.
                 * @memberof ListViewTag
                 */
                constructor() {
                    super();
                    this._onlistdbclick = this._onlistselect = this._ondragndrop = (
                        e: TagEventType
                    ) => {};
                    this._onitemclose = (e: TagEventType) => {
                        return true;
                    };
                    this._onmousedown = this._onmouseup = this._onmousemove = (
                        e: JQuery.MouseEventBase
                    ) => {};
                    this._selectedItems = [];
                    this._selectedItem = undefined;
                }

                /**
                 *
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
                    $(this)
                        .css("display", "flex")
                        .css("flex-direction", "column");
                    this.itemtag = "afx-list-item";
                }

                /**
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof ListViewTag
                 */
                protected reload(d?: any): void {}

                /**
                 *
                 *
                 * @memberof ListViewTag
                 */
                set dropdown(v: boolean) {
                    this.attsw(v, "dropdown");
                    $(this.refs.container).removeAttr("style");
                    $(this.refs.mlist).removeAttr("style");
                    $(this.refs.container).css("flex", 1);
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
                        $(this.refs.container)
                            .css("position", "absolute")
                            .css("display", "inline-block");
                        $(this.refs.mlist)
                            .css("position", "absolute")
                            .css("display", "none")
                            .css("top", "100%")
                            .css("left", "0");
                        this.calibrate();
                    } else {
                        $(this.refs.current).hide();
                        $(document).off("click", drop);
                        $(this.refs.current).off("click", show);
                    }
                }

                /**
                 *
                 *
                 * @memberof ListViewTag
                 */
                set ondragndrop(v: TagEventCallback) {
                    this._ondragndrop = v;
                }

                /**
                 *
                 *
                 * @memberof ListViewTag
                 */
                set onlistselect(v: TagEventCallback) {
                    this._onlistselect = v;
                }

                /**
                 *
                 *
                 * @memberof ListViewTag
                 */
                set onlistdbclick(v: TagEventCallback) {
                    this._onlistdbclick = v;
                }

                /**
                 *
                 *
                 * @memberof ListViewTag
                 */
                set onitemclose(v: (e: TagEventType) => boolean) {
                    this._onitemclose = v;
                }

                /**
                 *
                 *
                 * @type {boolean}
                 * @memberof ListViewTag
                 */
                get dropdown(): boolean {
                    return this.hasAttribute("dropdown");
                }

                /**
                 *
                 *
                 * @memberof ListViewTag
                 */
                set itemtag(v: string) {
                    $(this).attr("itemtag", v);
                }

                /**
                 *
                 *
                 * @type {string}
                 * @memberof ListViewTag
                 */
                get itemtag(): string {
                    return $(this).attr("itemtag");
                }

                /**
                 *
                 *
                 * @memberof ListViewTag
                 */
                set multiselect(v: boolean) {
                    this.attsw(v, "multiselect");
                }

                /**
                 *
                 *
                 * @memberof ListViewTag
                 */
                get multiselect() {
                    if (this.dropdown) {
                        return false;
                    }
                    return this.hasattr("multiselect");
                }

                /**
                 *
                 *
                 * @memberof ListViewTag
                 */
                set dragndrop(v: boolean) {
                    this.attsw(v, "dragndrop");
                }

                /**
                 *
                 *
                 * @type {boolean}
                 * @memberof ListViewTag
                 */
                get dragndrop(): boolean {
                    return this.hasattr("dragndrop");
                }

                /**
                 *
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
                        (bt[0] as ButtonTag).set(item);
                    }
                }

                /**
                 *
                 *
                 * @type {GenericObject<any>[]}
                 * @memberof ListViewTag
                 */
                get data(): GenericObject<any>[] {
                    return this._data;
                }

                /**
                 *
                 *
                 * @memberof ListViewTag
                 */
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
                 *
                 *
                 * @protected
                 * @memberof ListViewTag
                 */
                protected ondatachange(): void {}

                /**
                 *
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
                 *
                 *
                 * @readonly
                 * @type {ListViewItemTag}
                 * @memberof ListViewTag
                 */
                get selectedItem(): ListViewItemTag {
                    return this._selectedItem;
                }

                /**
                 *
                 *
                 * @readonly
                 * @type {ListViewItemTag[]}
                 * @memberof ListViewTag
                 */
                get selectedItems(): ListViewItemTag[] {
                    return this._selectedItems;
                }

                /**
                 *
                 *
                 * @type {(number | number[])}
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
                 *
                 *
                 * @param {GenericObject<any>} item
                 * @returns
                 * @memberof ListViewTag
                 */
                unshift(item: GenericObject<any>) {
                    return this.push(item, true);
                }

                /**
                 *
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
                 *
                 *
                 * @param {GenericObject<any>} item
                 * @param {boolean} [flag]
                 * @returns {ListViewItemTag}
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
                    item.domel = el[0];
                    return element;
                }

                /**
                 *
                 *
                 * @param {ListViewItemTag} item
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
                 *
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
                 *
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
                 *
                 *
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                unselect(): void {
                    for (let v of this.selectedItems) {
                        v.selected = false;
                    }
                    this._selectedItems = [];
                    return (this._selectedItem = undefined);
                }

                /**
                 *
                 *
                 * @private
                 * @param {TagEventType} e
                 * @param {boolean} flag
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                private iclick(e: TagEventType, flag: boolean): void {
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
                 *
                 *
                 * @private
                 * @param {TagEventType} e
                 * @returns
                 * @memberof ListViewTag
                 */
                private idbclick(e: TagEventType) {
                    const evt = { id: this.aid, data: { item: e.data } };
                    this._onlistdbclick(evt);
                    return this.observable.trigger("listdbclick", evt);
                }

                /**
                 *
                 *
                 * @private
                 * @param {TagEventType} e
                 * @returns
                 * @memberof ListViewTag
                 */
                private iselect(e: TagEventType) {
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
                 *
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
                        let el: any = $(e.target).closest(
                            "li[dataref='afx-list-item']"
                        );
                        if (el.length === 0) {
                            return;
                        }
                        el = el.parent()[0] as ListViewItemTag;
                        this._dnd.from = el;
                        this._dnd.to = undefined;
                        $(window).on("mouseup", this._onmouseup);
                        $(window).on("mousemove", this._onmousemove);
                    };

                    this._onmouseup = (e) => {
                        $(window).off("mouseup", this._onmouseup);
                        $(window).off("mousemove", this._onmousemove);
                        $("#systooltip").hide();
                        let el: any = $(e.target).closest(
                            "li[dataref='afx-list-item']"
                        );
                        if (el.length === 0) {
                            return;
                        }
                        el = el.parent()[0];
                        if (el === this._dnd.from) {
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
                        const data = this._dnd.from.data;
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

                    $(this.refs.btlist).hide();
                    this.observable.on("resize", (e) => this.calibrate());
                    return this.calibrate();
                }

                /**
                 *
                 *
                 * @private
                 * @param {TagEventType} e
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                private iclose(e: TagEventType): void {
                    if (!e.data) {
                        return;
                    }
                    const evt = { id: this.aid, data: {item: e.data} };
                    const r = this._onitemclose(evt);
                    if (!r) {
                        return;
                    }
                    this.observable.trigger("itemclose", evt);
                    return this.delete(e.data);
                }

                /**
                 *
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
                    const desktoph = $(Ant.OS.GUI.workspace).height();
                    const offset =
                        $(this).offset().top + $(this.refs.mlist).height();
                    if (offset > desktoph) {
                        $(this.refs.mlist).css(
                            "top",
                            `-${$(this.refs.mlist).outerHeight()}px`
                        );
                    } else {
                        $(this.refs.mlist).css("top", "100%");
                    }
                    $(this.refs.mlist).show();
                }

                /**
                 *
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
                 *
                 *
                 * @protected
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                protected calibrate(): void {
                    if (!this.dropdown) {
                        return;
                    }
                    const w = `${$(this).width()}px`;
                    $(this.refs.container).css("width", w);
                    $(this.refs.current).css("width", w);
                    $(this.refs.mlist).css("width", w);
                }

                /**
                 *
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
        }
    }
}
