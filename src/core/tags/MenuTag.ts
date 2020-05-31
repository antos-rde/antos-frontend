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
             * @class MenuEntryTag
             * @extends {AFXTag}
             */
            export abstract class MenuEntryTag extends AFXTag {
                private _data: GenericObject<any>;
                private _onmenuselect: TagEventCallback;
                private _onchildselect: TagEventCallback;
                parent: MenuEntryTag;
                root: MenuTag;

                /**
                 *Creates an instance of MenuEntryTag.
                 * @memberof MenuEntryTag
                 */
                constructor() {
                    super();
                    this._onmenuselect = this._onchildselect = (
                        e: TagEventType
                    ): void => {};
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof MenuEntryTag
                 */
                protected init(): void {
                    this.nodes = undefined;
                }
                /**
                 *
                 *
                 * @memberof MenuEntryTag
                 */
                set onmenuselect(v: TagEventCallback) {
                    this._onmenuselect = v;
                }

                /**
                 *
                 *
                 * @memberof MenuEntryTag
                 */
                set onchildselect(v: TagEventCallback) {
                    this._onchildselect = v;
                }

                /**
                 *
                 *
                 * @type {TagEventCallback}
                 * @memberof MenuEntryTag
                 */
                get onchildselect(): TagEventCallback {
                    return this._onchildselect;
                }
                /**
                 *
                 *
                 * @memberof MenuEntryTag
                 */
                set data(data: GenericObject<any>) {
                    this._data = data;
                    this.set(data);
                }

                /**
                 *
                 *
                 * @type {GenericObject<any>}
                 * @memberof MenuEntryTag
                 */
                get data(): GenericObject<any> {
                    return this._data;
                }

                /**
                 *
                 *
                 * @protected
                 * @returns {boolean}
                 * @memberof MenuEntryTag
                 */
                protected has_nodes(): boolean {
                    const ch = this.nodes;
                    return ch && ch.length > 0;
                }

                /**
                 *
                 *
                 * @protected
                 * @returns
                 * @memberof MenuEntryTag
                 */
                protected is_root() {
                    if (this.parent) {
                        return false;
                    } else {
                        return true;
                    }
                }

                /**
                 *
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof MenuEntryTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "li",
                            ref: "container",
                            children: [
                                {
                                    el: "a",
                                    ref: "entry",
                                    children: this.itemlayout(),
                                },
                                { el: "afx-menu", ref: "submenu" },
                            ],
                        },
                    ];
                }

                /**
                 *
                 *
                 * @memberof MenuEntryTag
                 */
                set nodes(v: GenericObject<any>[]) {
                    $(this.refs.container).removeClass("afx_submenu");
                    if (!v || !(v.length > 0)) {
                        $(this.refs.submenu).hide();
                        return;
                    }
                    $(this.refs.container).addClass("afx_submenu");
                    $(this.refs.submenu).show().attr("style", "");
                    const element = this.refs.submenu as MenuTag;
                    element.parent = this;
                    element.root = this.root;
                    element.items = v;
                    // ensure that the data is in sync
                    this._data.nodes = v;
                    if (this.is_root()) {
                        $(this.refs.container).mouseleave((e) => {
                            return $(this.refs.submenu).attr("style", "");
                        });
                    }
                }

                /**
                 *
                 *
                 * @type {GenericObject<any>[]}
                 * @memberof MenuEntryTag
                 */
                get nodes(): GenericObject<any>[] {
                    if (this.data && this.data.nodes) {
                        return this.data.nodes;
                    }
                    return undefined;
                }
                /**
                 *
                 *
                 * @protected
                 * @memberof MenuEntryTag
                 */
                protected mount(): void {
                    $(this.refs.entry).click((e) => this.select(e));
                }

                /**
                 *
                 *
                 * @private
                 * @returns {void}
                 * @memberof MenuEntryTag
                 */
                private submenuoff(): void {
                    const p = this.parent;
                    if (!p) {
                        $(this.refs.submenu).attr("style", "");
                        return;
                    }
                    return p.submenuoff();
                }

                /**
                 *
                 *
                 * @protected
                 * @param {JQuery.ClickEvent} e
                 * @memberof MenuEntryTag
                 */
                protected select(e: JQuery.ClickEvent): void {
                    const evt = {
                        id: this.aid,
                        data: { item: this, event: e },
                    };
                    e.preventDefault();
                    if (this.is_root() && this.has_nodes()) {
                        $(this.refs.submenu).show();
                    } else {
                        this.submenuoff();
                    }
                    this._onmenuselect(evt);
                    if (this.parent) {
                        this.parent.onchildselect(evt);
                    }
                    if (this.root) {
                        this.root.onmenuitemselect(evt);
                    }
                }

                protected abstract itemlayout(): TagLayoutType[];
            }

            /**
             *
             *
             * @class SimpleMenuEntryTag
             * @extends {MenuEntryTag}
             */
            export class SimpleMenuEntryTag extends MenuEntryTag {
                /**
                 *Creates an instance of SimpleMenuEntryTag.
                 * @memberof SimpleMenuEntryTag
                 */
                constructor() {
                    super();
                }
                protected init(): void {
                    super.init();
                    this.switch = false;
                    this.radio = false;
                    this.checked = false;
                }
                protected calibrate(): void {}
                protected reload(d?: any): void {}

                /**
                 *
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set switch(v: boolean) {
                    this.attsw(v, "switch");
                    if (this.radio || v) {
                        $(this.refs.switch).show();
                    } else {
                        $(this.refs.switch).hide();
                    }
                }

                /**
                 *
                 *
                 * @type {boolean}
                 * @memberof SimpleMenuEntryTag
                 */
                get switch(): boolean {
                    return this.hasattr("switch");
                }

                /**
                 *
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set radio(v: boolean) {
                    this.attsw(v, "radio");
                    if (this.switch || v) {
                        $(this.refs.switch).show();
                    } else {
                        $(this.refs.switch).hide();
                    }
                }

                /**
                 *
                 *
                 * @type {boolean}
                 * @memberof SimpleMenuEntryTag
                 */
                get radio(): boolean {
                    return this.hasattr("radio");
                }

                /**
                 *
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set checked(v: boolean) {
                    this.attsw(v, "checked");
                    if (this.data) this.data.checked = v;
                    if (!this.radio && !this.switch) {
                        return;
                    }
                    (this.refs.switch as SwitchTag).swon = v;
                }

                /**
                 *
                 *
                 * @type {boolean}
                 * @memberof SimpleMenuEntryTag
                 */
                get checked(): boolean {
                    return this.hasattr("checked");
                }

                /**
                 *
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set icon(v: string) {
                    $(this.refs.container).removeClass("fix_padding");
                    if (!v) {
                        return;
                    }
                    //$(this).attr("icon", v);
                    const label = this.refs.label as LabelTag;
                    label.icon = v;
                    $(this.refs.container).addClass("fix_padding");
                }

                /**
                 *
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set iconclass(v: string) {
                    if (!v) {
                        return;
                    }
                    const label = this.refs.label as LabelTag;
                    label.iconclass = v;
                }

                /**
                 *
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set text(v: string) {
                    if (v === undefined) {
                        return;
                    }
                    const label = this.refs.label as LabelTag;
                    label.text = v;
                }

                /**
                 *
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set shortcut(v: string) {
                    $(this.refs.shortcut).hide();
                    if (!v) {
                        return;
                    }
                    $(this.refs.shortcut).show();
                    $(this.refs.shortcut).text(v);
                }

                /**
                 *
                 *
                 * @returns {void}
                 * @memberof SimpleMenuEntryTag
                 */
                protected reset_radio(): void {
                    if (!this.has_nodes()) {
                        return;
                    }
                    for (let v of this.nodes) {
                        if (!v.domel.radio) {
                            continue;
                        }
                        v.domel.checked = false;
                    }
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof SimpleMenuEntryTag
                 */
                protected mount(): void {
                    super.mount();
                    (this.refs.switch as SwitchTag).enable = false;
                }

                /**
                 *
                 *
                 * @protected
                 * @param {JQuery.ClickEvent} e
                 * @returns {void}
                 * @memberof SimpleMenuEntryTag
                 */
                protected select(e: JQuery.ClickEvent): void {
                    if (this.switch) {
                        this.checked = !this.checked;
                    } else if (this.radio) {
                        const p = this.parent as SimpleMenuEntryTag;
                        if (p) {
                            p.reset_radio();
                        }
                        this.checked = !this.checked;
                    }
                    return super.select(e);
                }

                /**
                 *
                 *
                 * @returns
                 * @memberof SimpleMenuEntryTag
                 */
                itemlayout() {
                    return [
                        { el: "afx-switch", ref: "switch" },
                        { el: "afx-label", ref: "label" },
                        { el: "span", class: "shortcut", ref: "shortcut" },
                    ];
                }
            }

            /**
             *
             *
             * @export
             * @class MenuTag
             * @extends {AFXTag}
             */
            export class MenuTag extends AFXTag {
                parent: MenuEntryTag;
                root: MenuTag;
                pid: number;
                private _onmenuselect: TagEventCallback;
                private _items: GenericObject<any>[];

                /**
                 *Creates an instance of MenuTag.
                 * @memberof MenuTag
                 */
                constructor() {
                    super();
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof MenuTag
                 */
                protected init(): void {
                    this.contentag = "afx-menu-entry";
                    this.context = false;
                    this._items = [];
                    this._onmenuselect = (e: TagEventType): void => {};
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof MenuTag
                 */
                protected calibrate(): void {}

                /**
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof MenuTag
                 */
                protected reload(d?: any): void {}

                /**
                 *
                 *
                 * @memberof MenuTag
                 */
                set items(data: GenericObject<any>[]) {
                    this._items = data;
                    $(this.refs.container).empty();
                    data.map((item) => this.push(item, false));
                }

                /**
                 *
                 *
                 * @type {GenericObject<any>[]}
                 * @memberof MenuTag
                 */
                get items(): GenericObject<any>[] {
                    return this._items;
                }

                /**
                 *
                 *
                 * @memberof MenuTag
                 */
                set context(v: boolean) {
                    this.attsw(v, "context");
                    $(this.refs.wrapper).removeClass("context");
                    if (!v) {
                        return;
                    }
                    $(this.refs.wrapper).addClass("context");
                    $(this).hide();
                }

                /**
                 *
                 *
                 * @type {boolean}
                 * @memberof MenuTag
                 */
                get context(): boolean {
                    return this.hasattr("context");
                }

                /**
                 *
                 *
                 * @memberof MenuTag
                 */
                set onmenuselect(v: TagEventCallback) {
                    this._onmenuselect = v;
                }

                /**
                 *
                 *
                 * @memberof MenuTag
                 */
                set contentag(v: string) {
                    $(this).attr("contentag", v);
                }

                /**
                 *
                 *
                 * @type {string}
                 * @memberof MenuTag
                 */
                get contentag(): string {
                    return $(this).attr("contentag");
                }

                /**
                 *
                 *
                 * @readonly
                 * @type {TagEventCallback}
                 * @memberof MenuTag
                 */
                get onmenuitemselect(): TagEventCallback {
                    return this.handleselect;
                }

                /**
                 *
                 *
                 * @private
                 * @param {TagEventType} e
                 * @memberof MenuTag
                 */
                private handleselect(e: TagEventType): void {
                    if (this.context) {
                        $(this).hide();
                    }
                    e.id = this.aid;
                    this._onmenuselect(e);
                    this.observable.trigger("menuselect", e);
                }

                /**
                 *
                 *
                 * @param {JQuery.MouseEventBase} e
                 * @returns {void}
                 * @memberof MenuTag
                 */
                show(e: JQuery.MouseEventBase): void {
                    if (!this.context) {
                        return;
                    }
                    $(this)
                        .css("top", e.clientY - 15 + "px")
                        .css("left", e.clientX - 5 + "px")
                        .show();
                }

                /**
                 *
                 *
                 * @private
                 * @returns {boolean}
                 * @memberof MenuTag
                 */
                private is_root(): boolean {
                    return this.root === undefined;
                }

                /**
                 *
                 *
                 * @protected
                 * @returns {void}
                 * @memberof MenuTag
                 */
                protected mount(): void {
                    $(this.refs.container).css("display", "contents");
                    if (!this.context) {
                        return;
                    }
                    $(this.refs.wrapper).mouseleave((e) => {
                        if (!this.is_root()) {
                            return;
                        }
                        return $(this).hide();
                    });
                }

                /**
                 *
                 *
                 * @param {GenericObject<any>} item
                 * @memberof MenuTag
                 */
                unshift(item: GenericObject<any>): void {
                    this.push(item, true);
                }

                /**
                 *
                 *
                 * @param {MenuEntryTag} item
                 * @memberof MenuTag
                 */
                delete(item: MenuEntryTag): void {
                    const el = item.data;
                    const data = this.items;
                    if (data.includes(el)) {
                        data.splice(data.indexOf(el), 1);
                    }
                    $(item).remove();
                }

                /**
                 *
                 *
                 * @param {GenericObject<any>} item
                 * @param {boolean} flag
                 * @returns {MenuEntryTag}
                 * @memberof MenuTag
                 */
                push(item: GenericObject<any>, flag: boolean): MenuEntryTag {
                    let tag = this.contentag;
                    if (item.tag) {
                        tag = item.tag;
                    }
                    const el = $(`<${tag}>`);
                    if (flag) {
                        $(this.refs.container).prepend(el[0]);
                        if (!this.items.includes(item)) {
                            this.items.unshift(item);
                        }
                    } else {
                        el.appendTo(this.refs.container);
                        if (!this.items.includes(item)) {
                            this.items.push(item);
                        }
                    }
                    const entry = el[0] as MenuEntryTag;
                    entry.uify(this.observable);
                    entry.parent = this.parent;
                    entry.root = this.parent ? this.parent.root : this;
                    entry.data = item;
                    item.domel = entry;
                    return entry;
                }

                /**
                 *
                 *
                 * @returns
                 * @memberof MenuTag
                 */
                layout() {
                    return [
                        {
                            el: "ul",
                            ref: "wrapper",
                            children: [
                                { el: "li", class: "afx-corner-fix" },
                                { el: "div", ref: "container" },
                                { el: "li", class: "afx-corner-fix" },
                            ],
                        },
                    ];
                }
            }

            define("afx-menu", MenuTag);
            define("afx-menu-entry", SimpleMenuEntryTag);
        }
    }
}
