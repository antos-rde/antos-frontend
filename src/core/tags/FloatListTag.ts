namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * A float list is a list of items in which each
             * item can be moved (drag and drop) freely
             *
             * @export
             * @class FloatListTag
             * @extends {ListViewTag}
             */
            export class FloatListTag extends ListViewTag {
                /**
                 * Update the current tag, do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof FloatListTag
                 */
                protected reload(d?: any): void {}

                /**
                 * Variable that hold the onready callback of
                 * the tag. This callback will be called after
                 * the tag is mounted
                 *
                 * @private
                 * @memberof FloatListTag
                 */
                private _onready: (e: FloatListTag) => void;

                /**
                 *Creates an instance of FloatListTag.
                 * @memberof FloatListTag
                 */
                constructor() {
                    super();
                }

                /**
                 * set the onready callback function to the tag.
                 * This callback will be called after
                 * the tag is mounted
                 *
                 * @memberof FloatListTag
                 */
                set onready(v: (e: FloatListTag) => void) {
                    this._onready = v;
                }


                /**
                 * Disable the dropdown option in this list
                 *
                 * @memberof FloatListTag
                 */
                set dropdown(v: boolean) {}

                /**
                 * Disable the list buttons configuration in this
                 * list
                 *
                 * @memberof FloatListTag
                 */
                set buttons(v: GenericObject<any>[]) {}

                /**
                 * Disable the `showlist` behavior in this list
                 *
                 * @protected
                 * @param {*} e
                 * @memberof FloatListTag
                 */
                protected showlist(e: any) {}

                /**
                 * Disable the `dropoff` behavior in this list
                 *
                 * @protected
                 * @param {*} e
                 * @memberof FloatListTag
                 */
                protected dropoff(e: any) {}

                /**
                 * Function called when the data of the list
                 * is changed
                 *
                 * @protected
                 * @memberof FloatListTag
                 */
                protected ondatachange(): void {
                    this.calibrate();
                }

                /**
                 * Mount the list to the DOM tree
                 *
                 * @protected
                 * @returns {void}
                 * @memberof FloatListTag
                 */
                protected mount(): void {
                    $(this.refs.current).hide();
                    $(this.refs.container)
                        .css("width", "100%")
                        .css("height", "100%");
                    $(this.refs.mlist)
                        .css("position", "absolute")
                        .css("display", "block")
                        .css("width", "100%");
                    this.observable.on("resize", (e) => this.calibrate());
                    if (this._onready) {
                        return this._onready(this);
                    }
                }

                /**
                 * Push an element to the list
                 *
                 * @param {GenericObject<any>} v an element data
                 * @returns
                 * @memberof FloatListTag
                 */
                push(v: GenericObject<any>) {
                    const el = super.push(v);
                    $(el)
                        .css("user-select", "none")
                        .css("cursor", "default")
                        .css("display", "block")
                        .css("position", "absolute");
                    el.enable_drag();
                    $(el).on("dragging", (evt) => {
                        const e = evt.originalEvent as CustomEvent;
                        const globalof = $(this.refs.mlist).offset();
                        const offset = e.detail.offset;
                        let top = e.detail.current.clientY - offset.top - globalof.top;
                        let left =
                            e.detail.current.clientX - globalof.left - offset.left;
                        left = left < 0 ? 0 : left;
                        top = top < 0 ? 0 : top;
                        $(el)
                            .css("top", `${top}px`)
                            .css("left", `${left}px`);
                    })
                    return el;
                }

                /**
                 * Calibrate the view of the list
                 *
                 * @memberof FloatListTag
                 */
                calibrate(): void {
                    let ctop = 20;
                    let cleft = 20;
                    $(this.refs.mlist).css(
                        "height",
                        `${$(this.refs.container).height()}px`
                    );
                    const gw = $(this.refs.mlist).width();
                    const gh = $(this.refs.mlist).height();

                    $(this.refs.mlist)
                        .children()
                        .each((i, e) => {
                            $(e)
                                .css("top", `${ctop}px`)
                                .css("left", `${cleft}px`);
                            const w = $(e).width();
                            const h = $(e).height();
                            if (this.dir === "column") {
                                ctop += h + 20;
                                if (ctop + h > gh) {
                                    ctop = 20;
                                    cleft += w + 20;
                                }
                            } else {
                                cleft += w + 20;
                                if (cleft + w > gw) {
                                    cleft = 20;
                                    ctop += h + 20;
                                }
                            }
                        });
                }
            }

            define("afx-float-list", FloatListTag);
        }
    }
}
