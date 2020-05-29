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
             * @class ResizerTag
             * @extends {AFXTag}
             */
            export class ResizerTag extends AFXTag {
                private _resizable_el: any;
                private _parent: any;
                private _minsize: number;

                /**
                 *Creates an instance of ResizerTag.
                 * @memberof ResizerTag
                 */
                constructor() {
                    super();
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof ResizerTag
                 */
                protected init(): void {
                    this.dir = "hz";
                    this._resizable_el = undefined;
                    this._parent = $(this).parent().parent()[0];
                    this._minsize = 0;
                }

                /**
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof ResizerTag
                 */
                protected reload(d?: any): void {
                }
                /**
                 *
                 *
                 * @memberof ResizerTag
                 */
                set dir(v: string) {
                    $(this).attr("dir", v);
                }

                /**
                 *
                 *
                 * @type {string}
                 * @memberof ResizerTag
                 */
                get dir(): string {
                    return $(this).attr("dir");
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof ResizerTag
                 */
                protected mount(): void {
                    let att: string;
                    $(this).css(" display", "block");
                    const tagname = $(this._parent).prop("tagName");
                    this._resizable_el =
                        $(this).prev().length === 1
                            ? $(this).prev()[0]
                            : undefined;
                    if (tagname === "AFX-HBOX") {
                        this.dir = "hz";
                        $(this).css("cursor", "col-resize");
                        $(this).addClass("horizontal");
                        if (this._resizable_el) {
                            att = $(this._resizable_el).attr("min-width");
                            if (att) {
                                this._minsize = parseInt(att);
                            }
                        }
                    } else if (tagname === "AFX-VBOX") {
                        this.dir = "ve";
                        $(this).css("cursor", "row-resize");
                        $(this).addClass("vertical");
                        if (this._resizable_el) {
                            att = $(this._resizable_el).attr("min-height");
                            if (att) {
                                this._minsize = parseInt(att);
                            }
                        }
                    } else {
                        this.dir = "none";
                    }
                    if (this._minsize === 0) {
                        this._minsize = 10;
                    }
                    this.make_draggable();
                }

                /**
                 *
                 *
                 * @private
                 * @memberof ResizerTag
                 */
                private make_draggable(): void {
                    $(this).css("user-select", "none");
                    $(this).on("mousedown", (e) => {
                        e.preventDefault();
                        $(window).on("mousemove", (evt) => {
                            if (!this._resizable_el) {
                                return;
                            }
                            if (this.dir === "hz") {
                                return this.horizontalResize(evt);
                            } else if (this.dir === "ve") {
                                return this.verticalResize(evt);
                            }
                        });

                        return $(window).on("mouseup", function (evt) {
                            $(window).unbind("mousemove", null);
                            $(window).unbind("mouseup", null);

                            return $(window).unbind("mouseup", null);
                        });
                    });
                }

                /**
                 *
                 *
                 * @private
                 * @param {JQuery.MouseEventBase} e
                 * @returns {void}
                 * @memberof ResizerTag
                 */
                private horizontalResize(e: JQuery.MouseEventBase): void {
                    if (!this._resizable_el) {
                        return;
                    }
                    const offset = $(this._resizable_el).offset();
                    let w = Math.round(e.clientX - offset.left);
                    if (w < this._minsize) {
                        w = this._minsize;
                    }
                    $(this._resizable_el).attr("data-width", w.toString());
                    this.observable.trigger("resize", {
                        id: this.aid,
                        data: { w },
                    });
                }

                /**
                 *
                 *
                 * @protected
                 * @param {JQuery.MouseEventBase} e
                 * @returns {void}
                 * @memberof ResizerTag
                 */
                protected verticalResize(e: JQuery.MouseEventBase): void {
                    if (!this._resizable_el) {
                        return;
                    }
                    const offset = $(this._resizable_el).offset();
                    let h = Math.round(e.clientY - offset.top);
                    if (h < this._minsize) {
                        h = this._minsize;
                    }
                    $(this._resizable_el).attr("data-height", h.toString());
                    return this.observable.trigger("resize", {
                        id: this.aid,
                        data: { h },
                    });
                }

                /**
                 *
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof ResizerTag
                 */
                protected layout(): TagLayoutType[] {
                    return [];
                }
            }

            define("afx-resizer", ResizerTag);
        }
    }
}
