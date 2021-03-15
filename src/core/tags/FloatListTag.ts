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
                 * Setter:
                 * 
                 * Set the direction of the list item layout.
                 * Two directions are available:
                 * - `vertical`
                 * - `horizontal`
                 *
                 * This setter acts as a DOM attribute
                 * 
                 * Getter:
                 * 
                 * Get the currently set direction of list
                 * item layout
                 *
                 * @memberof FloatListTag
                 */
                set dir(v: string) {
                    $(this).attr("dir", v);
                    this.calibrate();
                }
                get dir(): string {
                    return $(this).attr("dir");
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
                    this.enable_drag(el);
                    return el;
                }

                /**
                 * Enable drag and drop on the list
                 *
                 * @private
                 * @param {ListViewItemTag} el the list item DOM element
                 * @memberof FloatListTag
                 */
                private enable_drag(el: ListViewItemTag): void {
                    $(el)
                        .css("user-select", "none")
                        .css("cursor", "default")
                        .css("display", "block")
                        .css("position", "absolute")
                        .on("mousedown", (evt) => {
                            const globalof = $(this.refs.mlist).offset();
                            evt.preventDefault();
                            const offset = $(el).offset();
                            offset.top = evt.clientY - offset.top;
                            offset.left = evt.clientX - offset.left;
                            const mouse_move = function (
                                e: JQuery.MouseEventBase
                            ) {
                                let top = e.clientY - offset.top - globalof.top;
                                let left =
                                    e.clientX - globalof.left - offset.left;
                                left = left < 0 ? 0 : left;
                                top = top < 0 ? 0 : top;
                                return $(el)
                                    .css("top", `${top}px`)
                                    .css("left", `${left}px`);
                            };

                            var mouse_up = function (e: JQuery.MouseEventBase) {
                                $(window).off("mousemove", mouse_move);
                                return $(window).off("mouseup", mouse_up);
                            };
                            $(window).on("mousemove", mouse_move);
                            return $(window).on("mouseup", mouse_up);
                        });
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
                            if (this.dir === "vertical") {
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
