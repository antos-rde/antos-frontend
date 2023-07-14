namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * Tag event data type definition
             */
            type TabEventData = TagEventDataType<ListViewItemTag>;
            /**
             * a TabBar allows to control a collection of tabs
             *
             * @export
             * @class TabBarTag
             * @extends {AFXTag}
             */
            export class TabBarTag extends AFXTag {
                /**
                 * Placeholder of currently selected tab index
                 *
                 * @private
                 * @type {number}
                 * @memberof TabBarTag
                 */
                private _selected: number;

                /**
                 * Placeholder of tab close event handle
                 *
                 * @private
                 * @memberof TabBarTag
                 */
                private _ontabclose: (e: TagEventType<TabEventData>) => boolean;

                /**
                 * Placeholder of tab select event handle
                 *
                 * @private
                 * @type {TagEventCallback<TabEventData>}
                 * @memberof TabBarTag
                 */
                private _ontabselect: TagEventCallback<TabEventData>;

                /**
                 * Cache of touch event
                 * 
                 * @private
                 * @meberof TabBarTag
                 */
                private _previous_touch: {x: number, y: number};
                /**
                 *Creates an instance of TabBarTag.
                 * @memberof TabBarTag
                 */
                constructor() {
                    super();
                    this._ontabclose = (e) => true;
                    this._ontabselect = (e) => {};
                }

                /**
                 * Init the tag
                 *
                 * @protected
                 * @memberof TabBarTag
                 */
                protected init(): void {
                    this.selected = -1;
                    this.dir = "row";
                    this._previous_touch = {x: 0, y:0};
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof TabBarTag
                 */
                protected reload(d?: any): void {}

                /**
                 * Setter: Enable/disable a tab to be closed
                 *
                 * Getter: Check whether tabs can be closed
                 *
                 * @memberof TabBarTag
                 */
                set closable(v: boolean) {
                    this.attsw(v, "closable");
                }
                get closable(): boolean {
                    return this.hasattr("closable");
                }

                /**
                 * Setter:
                 * 
                 * Set the tab bar direction:
                 * - `row`: horizontal direction
                 * - `column`: vertical direction
                 * 
                 * Getter:
                 * 
                 * Get the tab bar direction
                 *
                 * @memberof TabBarTag
                 */
                set dir(v: string) {
                    $(this).attr("dir", v);
                    if (!v) {
                        return;
                    }
                    console.log("direction is", v);
                    (this.refs.list as ListViewTag).dir = v;
                }
                get dir(): string {
                    return $(this).attr("dir") as any;
                }

                /**
                 * Add a tab in the end of the tab bar
                 *
                 * @param {GenericObject<any>} item tab data
                 * @memberof TabBarTag
                 */
                push(item: GenericObject<any>): ListViewItemTag {
                    item.closable = this.closable;
                    return (this.refs.list as ListViewTag).push(item);
                }

                /**
                 * Delete a tab
                 *
                 * @param {ListViewItemTag} el reference to DOM element of a tab
                 * @memberof TabBarTag
                 */
                delete(el: ListViewItemTag) {
                    (this.refs.list as ListViewTag).delete(el);
                }

                /**
                 * Add a tab to the beginning of the tab bar
                 *
                 * @param {GenericObject<any>} item tab data
                 * @memberof TabBarTag
                 */
                unshift(item: GenericObject<any>): ListViewItemTag {
                    item.closable = this.closable;
                    return (this.refs.list as ListViewTag).unshift(item);
                }

                /**
                 * Setter: Set tabs data
                 *
                 * Getter: Get all tabs data
                 *
                 * @memberof TabBarTag
                 */
                set items(v: GenericObject<any>[]) {
                    for (let i of v) {
                        i.closable = this.closable;
                    }
                    (this.refs.list as ListViewTag).data = v;
                }
                get items(): GenericObject<any>[] {
                    return (this.refs.list as ListViewTag).data;
                }

                /**
                 * Setter: Select a tab by its index
                 *
                 * Getter: Get the currently selected tab
                 *
                 * @memberof TabBarTag
                 */
                set selected(v: number | number[]) {
                    (this.refs.list as ListViewTag).selected = v;
                }
                get selected(): number | number[] {
                    return (this.refs.list as ListViewTag).selected;
                }
                /**
                 * Get the latest selected item
                 *
                 * @readonly
                 * @type {ListViewItemTag}
                 * @memberof TabBarTag
                 */
                get selectedItem(): ListViewItemTag {
                    return (this.refs.list as ListViewTag).selectedItem;
                }

                /**
                 * Set the tab close event handle
                 *
                 * @memberof TabBarTag
                 */
                set ontabclose(v: (e: TagEventType<TabEventData>) => boolean) {
                    this._ontabclose = v;
                }

                /**
                 * Set the tab select event handle
                 *
                 * @memberof TabBarTag
                 */
                set ontabselect(v: TagEventCallback<TabEventData>) {
                    this._ontabselect = v;
                }

                /**
                 * Mount the tab bar and bind some basic events
                 *
                 * @protected
                 * @memberof TabBarTag
                 */
                protected mount(): void {
                    $(this.refs.list).css("height", "100%");
                    (this.refs.list as ListViewTag).onitemclose = (e) => {
                        e.id = this.aid;
                        return this._ontabclose(e);
                    };
                    (this.refs.list as ListViewTag).onlistselect = (e) => {
                        this._ontabselect(e);
                        return this.observable.trigger("tabselect", e);
                    };
                    
                    const list_container = $(".list-container", this.refs.list);
                    list_container.each((i,el) => {
                        el.addEventListener("touchstart", e => {
                            this._previous_touch.x = e.touches[0].pageX;
                            this._previous_touch.y = e.touches[0].pageY;
                        }, {passive: true});
                        el.addEventListener("touchmove", e => {
                            const offset = {x:0, y:0};
                            offset.x = this._previous_touch.x - e.touches[0].pageX ;
                            offset.y = this._previous_touch.y - e.touches[0].pageY; 
                            if(this.dir == "row")
                            {
                                el.scrollLeft += offset.x;
                            }
                            else
                            {
                                el.scrollTop += offset.y;
                            }
                            this._previous_touch.x = e.touches[0].pageX;
                            this._previous_touch.y = e.touches[0].pageY;
                        }, {passive: true});
                        el.addEventListener("wheel", (evt)=>{
                            if(this.dir == "row")
                            {
                                el.scrollLeft += (evt as WheelEvent).deltaY;
                            }
                            else
                            {
                                el.scrollTop += (evt as WheelEvent).deltaY;
                            }
                        }, {passive: true});
                    });
                }

                /**
                 * Scroll the tabbar to end
                 * 
                 * @memberof TabBarTag
                 */
                scroll_to_end()
                {
                    const list_container = $(".list-container", this.refs.list)[0];
                    if(this.dir == "column")
                    {
                        list_container.scrollTo({ top: list_container.scrollHeight, behavior: 'smooth' });
                    }
                    else
                    {
                        list_container.scrollTo({ left: list_container.scrollWidth, behavior: 'smooth' });
                    }
                }

                /**
                 * Scroll the tabbar to begin
                 * 
                 * @memberof TabBarTag
                 */
                scroll_to_start()
                {
                    const list_container = $(".list-container", this.refs.list)[0];
                    if(this.dir == "column")
                    {
                        list_container.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    else
                    {
                        list_container.scrollTo({ left: 0, behavior: 'smooth' });
                    }
                }

                /**
                 * TabBar layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof TabBarTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "afx-list-view",
                            ref: "list",
                        },
                    ];
                }
            }

            define("afx-tab-bar", TabBarTag);
        }
    }
}
