namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * menu event data type definition
             */
            export type StackMenuEventData = TagEventDataType<ListViewItemTag>;
            /**
             * The layout of a simple stack menu item
             *
             * @export
             * @class SimpleStackMenuItemTag
             * @extends {ListViewItemTag}
             */
            export class SimpleStackMenuItemTag extends ListViewItemTag {
                /**
                 *Creates an instance of SimpleStackMenuItemTag.
                 * @memberof SimpleStackMenuItemTag
                 */
                constructor() {
                    super();
                }

                /**
                 * Reset some property to default
                 *
                 * @protected
                 * @memberof SimpleStackMenuItemTag
                 */
                protected init(): void {
                    this.closable = false;
                    this.data = {};
                    this.switch = false;
                    this.radio = false;
                    this.checked = false;
                }
                /**
                 * Mount the current tag
                 *
                 * @protected
                 * @memberof SimpleStackMenuItemTag
                 */
                 protected mount(): void {
                    super.mount();
                    (this.refs.switch as SwitchTag).enable = false;
                }
                /**
                 * Setter: Turn on/off the checker feature of the menu entry
                 * 
                 * Getter: Check whether the checker feature is enabled on this menu entry
                 *
                 * @memberof SimpleStackMenuItemTag
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
                 * Setter: select/unselect the current item
                 *
                 * Getter: Check whether the current item is selected
                 *
                 * @memberof SimpleStackMenuItemTag
                 */
                 set selected(v: boolean) {
                    
                    if(v)
                    {
                        if (this.switch) {
                            this.checked = !this.checked;
                        } else if (this.radio) {
                            // reset radio
                            const p = this.parentElement;
                            if (p) {
                               for(let item of Array.from(p.children))
                               {
                                    const el = item as SimpleStackMenuItemTag;
                                    if(el.radio)
                                    {
                                        el.checked = false;
                                    }
                               }
                            }
                            this.checked = !this.checked;
                        }
                    }
                    super.selected = v;
                }
                get selected(): boolean {
                    return this.hasattr("selected");
                }

                /**
                 * Setter: Turn on/off the radio feature of the menu entry
                 * 
                 * Getter: Check whether the radio feature is enabled
                 *
                 * @memberof SimpleStackMenuItemTag
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
                 * @memberof SimpleStackMenuItemTag
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
                 * Set the keyboard shortcut text
                 *
                 * @memberof SimpleStackMenuItemTag
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
                 * Do nothing
                 *
                 * @protected
                 * @memberof SimpleStackMenuItemTag
                 */
                protected calibrate(): void {
                }

                /**
                 * Refresh the inner label when the item data
                 * is changed
                 *
                 * @protected
                 * @returns {void}
                 * @memberof SimpleStackMenuItemTag
                 */
                protected ondatachange(): void {
                    const v = this.data;
                    if (!v) {
                        return;
                    }
                    if(v.nodes  && v.nodes.length > 0)
                    {
                        $(this.refs.submenu).show();
                    }
                    else
                    {
                        $(this.refs.submenu).hide();
                    }
                    const label = this.refs.label as LabelTag;
                    this.set(v);
                    label.set(v);
                    if (v.selected) {
                        this.selected = v.selected;
                    }
                }

                /**
                 * Re-render the list item
                 *
                 * @protected
                 * @memberof SimpleStackMenuItemTag
                 */
                protected reload(): void {
                    this.data = this.data;
                }

                /**
                 * List item custom layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType}
                 * @memberof SimpleStackMenuItemTag
                 */
                protected itemlayout(): TagLayoutType {
                    return {
                        el:"div",
                        children: [
                            { el: "afx-switch", ref: "switch" },
                            { el: "afx-label", ref: "label" },
                            { el: "span", class: "shortcut", ref: "shortcut" },
                            { el: "span", class: "afx-submenu", ref: "submenu" },
                        ]
                    };
                }
            }
            /**
             * A stack menu is a multilevel menu that
             * uses a single list view to navigate all menu levels
             * instead of using a traditional cascade style menu
             *
             * @export
             * @class StackMenuTag
             * @extends {AFXTag}
             */
            export class StackMenuTag extends AFXTag {
                /**
                 * Data stack, the list always displays the
                 * element on the top of the stack
                 * 
                 * @type {GenericObject<any>[][]}
                 * @memberof StackMenuTag
                 */
                private stack: GenericObject<any>[][];
                /**
                 * Update the current tag, do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof StackMenuTag
                 */
                protected reload(d?: any): void {}
                 /**
                 * Placeholder of tab select event handle
                 *
                 * @private
                 * @type {TagEventCallback<TabEventData>}
                 * @memberof StackMenuTag
                 */
                private _onmenuselect: TagEventCallback<StackMenuEventData>;
                /**
                 * Stack menu constructor
                 *
                 * @memberof StackMenuTag
                 */
                constructor() {
                    super();
                }
                /**
                 * Reset to default some property value
                 *
                 * @protected
                 * @memberof StackMenuTag
                 */
                protected init(): void {
                    this.stack = [];
                    this._onmenuselect = (_) => {};
                    this.context = false;
                }

                /**
                 * Recalcutate the menu coordinate in case of
                 * context menu
                 *
                 * @protected
                 * @memberof StackMenuTag
                 */
                protected calibrate(): void {
                    if(this.context)
                    {
                        const offset = $(this).position();
                        let left = offset.left;
                        let top = offset.top;
                        const ph = $(this).parent().height();
                        const pw = $(this).parent().width();
                        
                        const dy = top + $(this).height() - ph;
                        const dx = left + $(this).width() - pw;
                        if(dx < 0 && dy < 0)
                        {
                            return;
                        }
                        top -= dy > 0?dy:0;
                        left -= dx > 0?dx:0;
                        $(this)
                            .css("top", top + "px")
                            .css("left", left + "px");
                    }
                }

                /**
                 * Reset the menu to its initial state
                 * 
                 * @memberof StackMenuTag
                 */
                reset(): void {
                    const btn = this.refs.title as ButtonTag;
                    const list = this.refs.list as ListViewTag;
                    list.selected = -1;
                    btn.data = undefined;
                    if(this.stack.length > 0)
                    {
                        let arr = this.stack[0];
                        this.stack = [];
                        list.data = arr[1] as any;
                        $(btn).hide();
                    }
                }

                /**
                 * Mount the tab bar and bind some basic events
                 *
                 * @protected
                 * @memberof StackMenuTag
                 */
                protected mount(): void {
                    const btn = this.refs.title as ButtonTag;
                    const list = this.refs.list as ListViewTag;
                    list.itemtag = "afx-stack-menu-item";
                    btn.onbtclick = (_) => {
                        let arr = this.stack.pop();
                        if(this.stack.length == 0)
                        {
                            $(btn).hide();
                            btn.data = undefined;
                        }
                        else
                        {
                            btn.data = arr[0];
                            btn.iconclass = "bi bi-backspace";
                        }
                        list.data = arr[1] as any;
                    };
                    list.onlistselect = (e) => {
                        let data = e.data.item.data;
                        e.id = this.aid;
                        if(btn.data && btn.data.onchildselect)
                        {
                            btn.data.onchildselect(e);
                        }
                        if(data.onmenuselect)
                        {
                            data.onmenuselect(e);
                        }
                        this._onmenuselect(e);
                        this.observable.trigger("menuselect", e);
                        if(data.nodes && data.nodes.length > 0)
                        {
                            this.stack.push([btn.data, list.data]);
                            btn.data = data;
                            btn.iconclass = "bi bi-backspace";
                            $(btn).show();
                            list.selected = -1;
                            list.data = data.nodes;
                            if(this.context)
                            {
                                this.calibrate();
                            }
                        } else if (this.context) {
                            $(this).hide();
                        }
                    };
                }
                /**
                 * Setter: set current selected item index
                 * 
                 * Getter: Get current selected item index
                 *
                 * @memberof StackMenuTag
                 */
                set selected(i: number | number[])
                {
                    const list = this.refs.list as ListViewTag;
                    list.selected = i;
                }
                get selected(): number | number[]
                {
                    const list = this.refs.list as ListViewTag;
                    return list.selected;
                }

                /**
                 * Setter: Set whether the current menu is a context menu
                 * 
                 * Getter: Check whether the current menu is a context menu
                 *
                 * @memberof StackMenuTag
                 */
                set context(v: boolean) {
                    this.attsw(v, "context");
                    $(this).removeClass("context");
                    if (!v) {
                        return;
                    }
                    $(this).addClass("context");
                    $(this).hide();
                }
                get context(): boolean {
                    return this.hasattr("context");
                }

                /**
                 * Get the latest selected item
                 *
                 * @readonly
                 * @type {ListViewItemTag}
                 * @memberof StackMenuTag
                 */
                get selectedItem(): ListViewItemTag {
                    const list = this.refs.list as ListViewTag;
                    return list.selectedItem;
                }

                /**
                 * Get all the selected items
                 *
                 * @readonly
                 * @type {ListViewItemTag[]}
                 * @memberof StackMenuTag
                 */
                get selectedItems(): ListViewItemTag[] {
                    const list = this.refs.list as ListViewTag;
                    return list.selectedItems;
                }

                /**
                 * The following setter/getter are keep for backward compatible
                 * with the MenuTag interface
                 * 
                 * Setter: Set the menu data
                 * 
                 * Getter: Get the menu data
                 *
                 * @deprecated
                 * @memberof StackMenuTag
                 */
                set items(v: GenericObject<any>[]) {
                    this.nodes = v;
                }
                get items(): GenericObject<any>[] {
                    return this.nodes;
                }

                /**
                 * Setter: Set the menu data
                 * 
                 * Getter: Get the menu data
                 *
                 * @memberof StackMenuTag
                 */
                set nodes(v: GenericObject<any>[]) {
                    this.stack = [];
                    this.reset();
                    (this.refs.list as ListViewTag).data = v;
                    $(this.refs.title).hide();
                }
                get nodes(): GenericObject<any>[] {
                    return (this.refs.list as ListViewTag).data;
                }
                /**
                 * Set the `menu entry select` event handle
                 *
                 * @memberof StackMenuTag
                 */
                set onmenuselect(v: TagEventCallback<StackMenuEventData>) {
                    this._onmenuselect = v;
                }

                /**
                 * Show the current menu. This function is called
                 * only if the current menu is a context menu
                 *
                 * @param {JQuery.MouseEventBase} e JQuery mouse event
                 * @returns {void}
                 * @memberof StackMenuTag
                 */
                show(e?: JQuery.MouseEventBase): void {
                    const list = this.refs.list as ListViewTag;
                    const btn = this.refs.title as ButtonTag;
                    if (!this.context) {
                        return;
                    }
                    if(e)
                    {
                        const offset = $(this).parent().offset();
                        let top = e.clientY - offset.top - 15;
                        let left = e.clientX - offset.left -  5;

                        $(this)
                            .css("top", top + "px")
                            .css("left", left + "px");
                        
                    }
                    const doropoff = (e) => {
                       if($(e.target).closest(`[list-id="${list.aid}"]`).length > 0)
                       {
                           return;
                       } 
                       if($(e.target).closest(btn).length > 0)
                       {
                           return;
                       }
                        $(this).hide();
                        $(document).off("click", doropoff);
                    };
                    $(document).on("click", doropoff);
                    $(this).show();
                    this.calibrate();
                }

                /**
                 * TabBar layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof StackMenuTag
                 */
                protected layout(): TagLayoutType[] {
                    return [

                        {
                            el: "afx-button",
                            ref: "title"
                        },
                        {
                            el: "afx-list-view",
                            ref: "list",
                        }
                    ];
                }
            }
            define("afx-stack-menu", StackMenuTag);
            define("afx-stack-menu-item", SimpleStackMenuItemTag);
        }
    }
}