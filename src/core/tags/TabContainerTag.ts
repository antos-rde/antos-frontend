/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
namespace OS {
    export namespace GUI {
        export interface TabContainerTabType {
            container: HTMLElement;
            [propName: string]: any;
        }
        export namespace tag {
            /**
             *
             *
             * @export
             * @class TabContainerTag
             * @extends {AFXTag}
             */
            export class TabContainerTag extends AFXTag {
                private _selectedTab: TabContainerTabType;
                private _ontabselect: TagEventCallback<TabContainerTabType>;

                /**
                 *Creates an instance of TabContainerTag.
                 * @memberof TabContainerTag
                 */
                constructor() {
                    super();
                    this._ontabselect = (e) => {};
                    
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof TabContainerTag
                 */
                protected init(): void {
                    this.dir = "column"; // or row
                }

                /**
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof TabContainerTag
                 */
                protected reload(d?: any): void {}

                /**
                 *
                 *
                 * @memberof TabContainerTag
                 */
                set ontabselect(f: TagEventCallback<TabContainerTabType>) {
                    this._ontabselect = f;
                }

                /**
                 *
                 *
                 * @memberof TabContainerTag
                 */
                set dir(v: "row" | "column") {
                    $(this).attr("dir", v);
                    if (!v) {
                        return;
                    }
                    (this.refs.wrapper as TileLayoutTag).dir = v;
                }

                /**
                 *
                 *
                 * @type {("row"| "column")}
                 * @memberof TabContainerTag
                 */
                get dir(): "row" | "column" {
                    return $(this).attr("dir") as any;
                }

                /**
                 *
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
                }

                /**
                 *
                 *
                 * @type {TabContainerTabType}
                 * @memberof TabContainerTag
                 */
                get selectedTab(): TabContainerTabType {
                    return this._selectedTab;
                }

                /**
                 *
                 *
                 * @memberof TabContainerTag
                 */
                set tabbarwidth(v: number) {
                    if (!v) {
                        return;
                    }
                    $(this.refs.bar).attr("data-width", `${v}`);
                    (this.refs.wrapper as TileLayoutTag).calibrate();
                }

                /**
                 *
                 *
                 * @memberof TabContainerTag
                 */
                set tabbarheigh(v: number) {
                    $(this.refs.bar).attr("data-height", `${v}`);
                    (this.refs.wrapper as TileLayoutTag).calibrate();
                }

                /**
                 *
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
                    this.observable.one("mounted", (id)=>{
                        $(this.refs.yield).children().each((i, e) => {
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
                            $(e).css("width", "100%").css("height", "100%").hide();
                            const el = (this.refs.bar as TabBarTag).push(item);
                            el.selected = true;
                        });
                    })
                    
                    this.observable.on("resize", (e) => this.calibrate());
                    this.calibrate();
                }

                /**
                 *
                 *
                 * @memberof TabContainerTag
                 */
                calibrate(): void {
                    $(this.refs.wrapper).css("height", `${$(this).height()}px`);
                }

                /**
                 *
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
