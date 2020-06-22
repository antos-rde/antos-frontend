namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * Menu event data interface definition
             */
            export type MenuEventData = TagEventDataType<MenuEntryTag>;

            /**
             * This class defines the abstract prototype of an menu entry.
             * Any implementation of menu entry tag should extend this class
             *
             * @export
             * @abstract
             * @class MenuEntryTag
             * @extends {AFXTag}
             */
            export abstract class MenuEntryTag extends AFXTag {
                /**
                 * Data placeholder of the menu entry
                 *
                 * @private
                 * @type {GenericObject<any>}
                 * @memberof MenuEntryTag
                 */
                private _data: GenericObject<any>;

                /**
                 * placeholder of `menu entry select` event handle
                 *
                 * @private
                 * @type {TagEventCallback<MenuEventData>}
                 * @memberof MenuEntryTag
                 */
                private _onmenuselect: TagEventCallback<MenuEventData>;

                /**
                 * placeholder of `sub-menu entry select event` handle
                 *
                 * @private
                 * @type {TagEventCallback<MenuEventData>}
                 * @memberof MenuEntryTag
                 */
                private _onchildselect: TagEventCallback<MenuEventData>;

                /**
                 * Reference to the parent menu entry of current one
                 *
                 * @type {MenuEntryTag}
                 * @memberof MenuEntryTag
                 */
                parent: MenuEntryTag;

                /**
                 * Reference to the root menu entry
                 *
                 * @type {MenuTag}
                 * @memberof MenuEntryTag
                 */
                root: MenuTag;

                /**
                 *Creates an instance of MenuEntryTag.
                 * @memberof MenuEntryTag
                 */
                constructor() {
                    super();
                    this._onmenuselect = this._onchildselect = (
                        e: TagEventType<MenuEventData>
                    ): void => {};
                }

                /**
                 * Init the tag before mounting
                 *
                 * @protected
                 * @memberof MenuEntryTag
                 */
                protected init(): void {
                    this.nodes = undefined;
                }
                /**
                 * Set the `menu entry select` event handle
                 *
                 * @memberof MenuEntryTag
                 */
                set onmenuselect(v: TagEventCallback<MenuEventData>) {
                    this._onmenuselect = v;
                }

                /**
                 * Setter: Set the `sub menu entry select` event handle
                 * 
                 * Getter: get the current `sub menu entry select` event handle
                 *
                 * @memberof MenuEntryTag
                 */
                set onchildselect(v: TagEventCallback<MenuEventData>) {
                    this._onchildselect = v;
                }
                get onchildselect(): TagEventCallback<MenuEventData> {
                    return this._onchildselect;
                }
                /**
                 * Setter: Set data to the entry
                 * 
                 * Getter: Get data of the current menu entry
                 *
                 * @memberof MenuEntryTag
                 */
                set data(data: GenericObject<any>) {
                    this._data = data;
                    this.set(data);
                }
                get data(): GenericObject<any> {
                    return this._data;
                }

                /**
                 * Check whether the current menu entry has sub-menu
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
                 * Check whether the current menu entry is the root entry
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
                 * Layout definition of the menu entry
                 * This function define the outer layout of the menu entry.
                 * Custom inner layout of each item implementation should
                 * be defined in [[itemlayout]]
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
                 * Setter: Set the sub-menu data
                 * 
                 * Getter: Get the sub-menu data
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
                get nodes(): GenericObject<any>[] {
                    if (this.data && this.data.nodes) {
                        return this.data.nodes;
                    }
                    return undefined;
                }
                /**
                 * Bind some base event to the menu entry
                 *
                 * @protected
                 * @memberof MenuEntryTag
                 */
                protected mount(): void {
                    $(this.refs.entry).click((e) => this.select(e));
                }

                /**
                 * Hide the sub-menu of the current menu entry
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
                 * This function trigger two event:
                 * - the `onmenuselect` event on the current entry
                 * - the `onchildselect` event on the parent of the current entry
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

                /**
                 * custom inner layout of a menu entry
                 *
                 * @protected
                 * @abstract
                 * @returns {TagLayoutType[]}
                 * @memberof MenuEntryTag
                 */
                protected abstract itemlayout(): TagLayoutType[];
            }

            /**
             * This class extends the [[MenuEntryTag]] prototype. It inner layout is
             * defined with the following elements:
             * - a [[SwitchTag]] acts as checker or radio
             * - a [[LabelTag]] to display the content of the menu entry
             * - a `span` element that display the keyboard shortcut of the entry
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

                /**
                 * Reset some properties to default value
                 *
                 * @protected
                 * @memberof SimpleMenuEntryTag
                 */
                protected init(): void {
                    super.init();
                    this.switch = false;
                    this.radio = false;
                    this.checked = false;
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof SimpleMenuEntryTag
                 */
                protected calibrate(): void {}

                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof SimpleMenuEntryTag
                 */
                protected reload(d?: any): void {}

                /**
                 * Setter: Turn on/off the checker feature of the menu entry
                 * 
                 * Getter: Check whether the checker feature is enabled on this menu entry
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
                get switch(): boolean {
                    return this.hasattr("switch");
                }

                /**
                 * Setter: Turn on/off the radio feature of the menu entry
                 * 
                 * Getter: Check whether the radio feature is enabled
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
                get radio(): boolean {
                    return this.hasattr("radio");
                }

                /**
                 * Setter:
                 * 
                 * Toggle the switch on the menu entry, this setter
                 * only works when the `checker` or `radio` feature is
                 * enabled
                 * 
                 * Getter:
                 * 
                 * Check whether the switch is turned on
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
                get checked(): boolean {
                    return this.hasattr("checked");
                }

                /**
                 * Set the label icon using a VFS path
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
                 * Set the label CSS icon class
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
                 * Set the label text
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
                 * Set the keyboard shortcut text
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
                 * Uncheck all sub-menu items of the current menu entry
                 * that have the radio feature enabled
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
                 * Mount the current tag
                 *
                 * @protected
                 * @memberof SimpleMenuEntryTag
                 */
                protected mount(): void {
                    super.mount();
                    (this.refs.switch as SwitchTag).enable = false;
                }

                /**
                 * Trigger the onmenuselect and onchildselect events
                 *
                 * @protected
                 * @param {JQuery.ClickEvent} e Mouse click event
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
                 * Inner item layout of the menu entry
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
             * A menu tag contains a collection of menu entries in which each
             * entry maybe a leaf entry or may contain a submenu
             *
             * @export
             * @class MenuTag
             * @extends {AFXTag}
             */
            export class MenuTag extends AFXTag {
                /**
                 * Reference to the parent menu entry of the current value.
                 * This value is `undefined` in case of the current menu is
                 * the root menu
                 *
                 * @type {MenuEntryTag}
                 * @memberof MenuTag
                 */
                parent: MenuEntryTag;

                /**
                 * Reference to the root menu
                 *
                 * @type {MenuTag}
                 * @memberof MenuTag
                 */
                root: MenuTag;

                /**
                 * The `pid` of the application that attached to this menu.
                 * This value is optional
                 *
                 * @type {number}
                 * @memberof MenuTag
                 */
                pid?: number;

                /**
                 * placeholder for menu select event handle
                 *
                 * @private
                 * @type {TagEventCallback<MenuEventData>}
                 * @memberof MenuTag
                 */
                private _onmenuselect: TagEventCallback<MenuEventData>;

                /**
                 * Menu data placeholder
                 *
                 * @private
                 * @type {GenericObject<any>[]}
                 * @memberof MenuTag
                 */
                private _items: GenericObject<any>[];

                /**
                 *Creates an instance of MenuTag.
                 * @memberof MenuTag
                 */
                constructor() {
                    super();
                }

                /**
                 * Reset some properties to  default value
                 *
                 * @protected
                 * @memberof MenuTag
                 */
                protected init(): void {
                    this.contentag = "afx-menu-entry";
                    this.context = false;
                    this._items = [];
                    this._onmenuselect = (
                        e: TagEventType<MenuEventData>
                    ): void => {};
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof MenuTag
                 */
                protected calibrate(): void {}

                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof MenuTag
                 */
                protected reload(d?: any): void {}

                /**
                 * Setter: Set the menu items data
                 * 
                 * Getter: Get menu items data
                 *
                 * @memberof MenuTag
                 */
                set items(data: GenericObject<any>[]) {
                    this._items = data;
                    $(this.refs.container).empty();
                    data.map((item) => this.push(item, false));
                }
                get items(): GenericObject<any>[] {
                    return this._items;
                }

                /**
                 * Setter: Set whether the current menu is a context menu
                 * 
                 * Getter: Check whether the current menu is a context menu
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
                get context(): boolean {
                    return this.hasattr("context");
                }

                /**
                 * Set menu select event handle
                 *
                 * @memberof MenuTag
                 */
                set onmenuselect(v: TagEventCallback<MenuEventData>) {
                    this._onmenuselect = v;
                }

                /**
                 * Setter:
                 * 
                 * Set the default tag name of the menu item.
                 * If the tag is not specified in an item data,
                 * this value will be used
                 * 
                 * Getter:
                 * 
                 * Get the default menu entry tag name
                 *
                 * @memberof MenuTag
                 */
                set contentag(v: string) {
                    $(this).attr("contentag", v);
                }
                get contentag(): string {
                    return $(this).attr("contentag");
                }

                /**
                 * Get the reference to the function that triggers
                 * the menu select event
                 *
                 * @readonly
                 * @type {TagEventCallback}
                 * @memberof MenuTag
                 */
                get onmenuitemselect(): TagEventCallback<MenuEventData> {
                    return this.handleselect;
                }

                /**
                 * This function triggers the menu select event
                 *
                 * @private
                 * @param {TagEventType} e
                 * @memberof MenuTag
                 */
                private handleselect(e: TagEventType<MenuEventData>): void {
                    if (this.context) {
                        $(this).hide();
                    }
                    e.id = this.aid;
                    this._onmenuselect(e);
                    this.observable.trigger("menuselect", e);
                }

                /**
                 * Show the current menu. This function is called
                 * only if the current menu is a context menu
                 *
                 * @param {JQuery.MouseEventBase} e JQuery mouse event
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
                 * Test whether the current menu is the root menu
                 *
                 * @private
                 * @returns {boolean}
                 * @memberof MenuTag
                 */
                private is_root(): boolean {
                    return this.root === undefined;
                }

                /**
                 * Mount the menu tag and bind some basic events
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
                 * Add a menu entry to the beginning of the current
                 * menu
                 *
                 * @param {GenericObject<any>} item menu entry data
                 * @memberof MenuTag
                 */
                unshift(item: GenericObject<any>): void {
                    this.push(item, true);
                }

                /**
                 * Delete a menu entry
                 *
                 * @param {MenuEntryTag} item reference to the DOM element of an menu entry
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
                 * Add an menu entry to the beginning or end of the menu
                 *
                 * @param {GenericObject<any>} item menu entry data
                 * @param {boolean} flag indicates whether the entry should be added to the beginning of the menu
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
                 * Menu tag layout definition
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
