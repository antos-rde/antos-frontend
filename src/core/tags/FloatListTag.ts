/*
 * decaffeinate suggestions:
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
             * @class FloatListTag
             * @extends {ListViewTag}
             */
            export class FloatListTag extends ListViewTag {
                protected reload(d?: any): void {
                }
                private _onready: (e: FloatListTag) => void;

                /**
                 *Creates an instance of FloatListTag.
                 * @memberof FloatListTag
                 */
                constructor() {
                    super();
                }

                /**
                 *
                 *
                 * @memberof FloatListTag
                 */
                set onready(v: (e: FloatListTag) => void) {
                    this._onready = v;
                }

                /**
                 *
                 *
                 * @memberof FloatListTag
                 */
                set dir(v: string) {
                    $(this).attr("dir", v);
                    this.calibrate();
                }

                /**
                 *
                 *
                 * @type {string}
                 * @memberof FloatListTag
                 */
                get dir(): string {
                    return $(this).attr("dir");
                }
                // disable some uneccessary functions

                /**
                 *
                 *
                 * @memberof FloatListTag
                 */
                set dropdown(v: boolean) {}

                /**
                 *
                 *
                 * @memberof FloatListTag
                 */
                set buttons(v: GenericObject<any>[]) {}

                /**
                 *
                 *
                 * @protected
                 * @param {*} e
                 * @memberof FloatListTag
                 */
                protected showlist(e: any) {}

                /**
                 *
                 *
                 * @protected
                 * @param {*} e
                 * @memberof FloatListTag
                 */
                protected dropoff(e: any) {}

                /**
                 *
                 *
                 * @protected
                 * @memberof FloatListTag
                 */
                protected ondatachange(): void {
                    this.calibrate();
                }

                /**
                 *
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
                 *
                 *
                 * @param {GenericObject<any>} v
                 * @returns
                 * @memberof FloatListTag
                 */
                push(v: GenericObject<any>) {
                    const el = super.push(v);
                    this.enable_drag(el);
                    return el;
                }

                /**
                 *
                 *
                 * @private
                 * @param {ListViewItemTag} el
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
                                $(window).unbind("mousemove", mouse_move);
                                return $(window).unbind("mouseup", mouse_up);
                            };
                            $(window).on("mousemove", mouse_move);
                            return $(window).on("mouseup", mouse_up);
                        });
                }

                /**
                 *
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
                                if (ctop > gh) {
                                    ctop = 20;
                                    cleft += w + 20;
                                }
                            } else {
                                cleft += w + 20;
                                if (cleft > gw) {
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
