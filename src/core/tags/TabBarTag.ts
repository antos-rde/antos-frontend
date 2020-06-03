/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
namespace OS {
    export namespace GUI {
        export namespace tag {
            
            /**
             *
             *
             * @export
             * @class TabBarTag
             * @extends {AFXTag}
             */
            export class TabBarTag extends AFXTag {
                private _selected: number;
                private _ontabclose: (e: TagEventType) => boolean;
                private _ontabselect: TagEventCallback;

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
                 *
                 *
                 * @protected
                 * @memberof TabBarTag
                 */
                protected init(): void {
                    this.selected = -1;
                }

                /**
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof TabBarTag
                 */
                protected reload(d?: any): void {}

                /**
                 *
                 *
                 * @memberof TabBarTag
                 */
                set closable(v: boolean) {
                    this.attsw(v, "closable");
                }

                /**
                 *
                 *
                 * @type {boolean}
                 * @memberof TabBarTag
                 */
                get closable(): boolean {
                    return this.hasattr("closable");
                }

                /**
                 *
                 *
                 * @param {GenericObject<any>} item
                 * @memberof TabBarTag
                 */
                push(item: GenericObject<any>): ListViewItemTag {
                    item.closable = this.closable;
                    return (this.refs.list as ListViewTag).push(item);
                }

                /**
                 *
                 *
                 * @param {ListViewItemTag} el
                 * @memberof TabBarTag
                 */
                delete(el: ListViewItemTag) {
                    (this.refs.list as ListViewTag).delete(el);
                }

                /**
                 *
                 *
                 * @param {GenericObject<any>} item
                 * @memberof TabBarTag
                 */
                unshift(item: GenericObject<any>): ListViewItemTag {
                    item.closable = this.closable;
                    return (this.refs.list as ListViewTag).unshift(item);
                }

                /**
                 *
                 *
                 * @memberof TabBarTag
                 */
                set items(v: GenericObject<any>[]) {
                    for (let i of v) {
                        i.closable = this.closable;
                    }
                    (this.refs.list as ListViewTag).data = v;
                }

                /**
                 *
                 *
                 * @type {GenericObject<any>[]}
                 * @memberof TabBarTag
                 */
                get items(): GenericObject<any>[] {
                    return (this.refs.list as ListViewTag).data;
                }

                /**
                 *
                 *
                 * @memberof TabBarTag
                 */
                set selected(v: number | number[]) {
                    (this.refs.list as ListViewTag).selected = v;
                }

                /**
                 *
                 *
                 * @type {(number | number[])}
                 * @memberof TabBarTag
                 */
                get selected(): number | number[] {
                    return (this.refs.list as ListViewTag).selected;
                }

                /**
                 *
                 *
                 * @memberof TabBarTag
                 */
                set ontabclose(v: (e: TagEventType) => boolean) {
                    this._ontabclose = v;
                }

                /**
                 *
                 *
                 * @memberof TabBarTag
                 */
                set ontabselect(v: TagEventCallback) {
                    this._ontabselect = v;
                }

                /**
                 *
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
                }

                /**
                 *
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
