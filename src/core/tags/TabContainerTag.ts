namespace OS {
    export namespace GUI {
        /**
         * Tab container data type definition
         *
         * @export
         * @interface TabContainerTabType
         */
        export interface TabContainerTabType {
            /**
             * Reference to the DOM element of the current container
             *
             * @type {HTMLElement}
             * @memberof TabContainerTabType
             */
            container: HTMLElement;

            [propName: string]: any;
        }
        export namespace tag {
            /**
             * A tab container allows to attach each tab on a {@link TabBarTag}
             * with a container widget. The attached container widget should be
             * composed inside a {@link HBoxTag}
             *
             * The tab bar in a tab container can be configured to display tabs
             * in horizontal (row) or vertical (column) order. Default to vertical order
             *
             * Once a tab is selected, its attached container will be shown
             *
             * @export
             * @class TabContainerTag
             * @extends {AFXTag}
             */
            export class TabContainerTag extends AFXTag {
                /**
                 * Reference to the currently selected tab DOM element
                 *
                 * @private
                 * @type {TabContainerTabType}
                 * @memberof TabContainerTag
                 */
                private _selectedTab: TabContainerTabType;

                /**
                 * Placeholder of the tab select event handle
                 *
                 * @protected
                 * @type {TagEventCallback<TabContainerTabType>}
                 * @memberof TabContainerTag
                 */
                protected _ontabselect: TagEventCallback<TabContainerTabType>;

                /**
                 *Creates an instance of TabContainerTag.
                 * @memberof TabContainerTag
                 */
                constructor() {
                    super();
                    this._ontabselect = (e) => { };
                }

                /**
                 * Init the tab bar direction to vertical (column)
                 *
                 * @protected
                 * @memberof TabContainerTag
                 */
                protected init(): void {
                    this.dir = "column"; // or row
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof TabContainerTag
                 */
                protected reload(d?: any): void { }

                /**
                 * Set the tab select event handle
                 *
                 * @memberof TabContainerTag
                 */
                set ontabselect(f: TagEventCallback<TabContainerTabType>) {
                    this._ontabselect = f;
                }


                /**
                 * Get all tab items in the container
                 *
                 * @readonly
                 * @type {TabContainerTabType[]}
                 * @memberof TabContainerTag
                 */
                get tabs(): TabContainerTabType[]
                {
                    return (this.refs.bar as TabBarTag).items as TabContainerTabType[];
                }

                /**
                 * Setter: Select a tab by its index
                 * Getter: Get the current selected index
                 * 
                 * @memberof TabContainerTag
                 */
                set selectedIndex(i: number) {
                    (this.refs.bar as TabBarTag).selected = i;
                }
                get selectedIndex(): number {
                    return (this.refs.bar as TabBarTag).selected as number;
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
                 * @memberof TabContainerTag
                 */
                set dir(v: "row" | "column") {
                    $(this).attr("dir", v);
                    if (!v) {
                        return;
                    }
                    (this.refs.wrapper as TileLayoutTag).dir = v;
                    if(v == "row")
                    {
                        (this.refs.bar as TabBarTag).dir = "column";
                    }
                    else
                    {
                        (this.refs.bar as TabBarTag).dir = "row";
                    }
                }
                get dir(): "row" | "column" {
                    return $(this).attr("dir") as any;
                }

                /**
                 * Setter:
                 * 
                 * Select a tab using the its tab data type.
                 * This will show the attached container to the tab
                 * 
                 * Getter:
                 * 
                 * Get the tab data of the currently selected Tab
                 *
                 * @memberof TabContainerTag
                 */
                set selectedTab(v: TabContainerTabType) {
                    if (!v) {
                        return;
                    }
                    const selected = this._selectedTab;
                    this._selectedTab = v;
                    if (selected) {
                        $(selected.container).hide();
                    }
                    $(v.container).show();
                    this.observable.trigger("resize", undefined);
                    $(v.container).attr("tabindex",-1).css("outline", "none").trigger("focus");
                }
                get selectedTab(): TabContainerTabType {
                    return this._selectedTab;
                }

                /**
                 * Set the tab bar width, this function only
                 * works when the tab bar direction is set to
                 * `row`
                 *
                 * @memberof TabContainerTag
                 */
                set tabbarwidth(v: number) {
                    if (!v) {
                        return;
                    }
                    $(this.refs.bar).attr("data-width", `${v}`);
                    this.observable.trigger("resize", undefined);
                }

                /**
                 * Set the tab bar height, this function only works
                 * when the tab bar direction is set to `column`
                 *
                 * @memberof TabContainerTag
                 */
                set tabbarheight(v: number) {
                    if (!v) {
                        return;
                    }
                    $(this.refs.bar).attr("data-height", `${v}`);
                    this.observable.trigger("resize", undefined);
                }

                /**
                 * Add a new tab with container to the container
                 * 
                 * item should be in the following format:
                 * 
                 * ```ts
                 * {
                 *  text: string,
                 *  icon?: string,
                 *  iconclass?: string,
                 *  container: HTMLElement
                 * }
                 * ```
                 *
                 * @param {GenericObject<any>} item tab descriptor
                 * @param {boolean} insert insert the tab content to the container ?
                 * @returns {ListViewItemTag} the tab DOM element
                 * @memberof TabContainerTag
                 */
                public addTab(item: GenericObject<any>, insert: boolean): ListViewItemTag {
                    if (insert) {
                        $(this.refs.yield).append(item.container);
                    }
                    $(item.container)
                        .css("width", "100%")
                        .css("height", "100%")
                        .hide();
                    const el = (this.refs.bar as TabBarTag).push(
                        item
                    );
                    el.selected = true;
                    return el;
                }

                /**
                 * Remove a tab from the container
                 *
                 * @param {ListViewItemTag} tab the tab item to be removed
                 * @memberof TabContainerTag
                 */
                public removeTab(tab: ListViewItemTag): void {
                    if (tab.data.container) {
                        $(tab.data.container).remove();
                    }
                    (this.refs.bar as TabBarTag).delete(tab);
                }

                /**
                 * Mount the tag and bind basic events
                 *
                 * @protected
                 * @memberof TabContainerTag
                 */
                protected mount(): void {
                    (this.refs.bar as TabBarTag).ontabselect = (e) => {
                        const data = (e.data.item as ListViewItemTag)
                            .data as TabContainerTabType;
                        this.selectedTab = data;
                        return this._ontabselect({ data: data, id: this.aid });
                    };
                    this.observable.one("mounted", (id) => {
                        $(this.refs.yield)
                            .children()
                            .each((i, e) => {
                                const item = {} as GenericObject<any>;
                                if ($(e).attr("tabname")) {
                                    item.text = $(e).attr("tabname");
                                }
                                if ($(e).attr("icon")) {
                                    item.icon = $(e).attr("icon");
                                }
                                if ($(e).attr("iconclass")) {
                                    item.iconclass = $(e).attr("iconclass");
                                }
                                item.container = e;
                                this.addTab(item, false);
                            });
                    });

                    this.observable.on("resize", (e) => this.calibrate());
                    this.calibrate();
                }

                /**
                 * calibrate the  tab container
                 *
                 * @memberof TabContainerTag
                 */
                calibrate(): void {
                    $(this.refs.wrapper).css("height", `${$(this).height()}px`);
                }

                /**
                 * Layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof TabContainerTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "afx-tile",
                            ref: "wrapper",
                            children: [
                                { el: "afx-tab-bar", ref: "bar" },
                                { el: "div", ref: "yield" },
                            ],
                        },
                    ];
                }
            }

            define("afx-tab-container", TabContainerTag);
        }
    }
}
