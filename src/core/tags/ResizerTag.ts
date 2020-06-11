namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * A `resizer` tag is basically used to dynamically resize an element using mouse.
             * It is usually put inside a [[TileLayoutTag]] an can be attached to any element. Example:
             *
             * The resizer tag in the following example  will be attached to the first `afx-vbox`,
             * and allows to resize this element using mouse
             *
             * ```xml
             * <afx-hbox>
             *      <afx-vbox>...</afx-vbox>
             *      <afx-resizer></afx-resizer>
             *      <afx-vbox>...</afx-vbox>
             * </afx-hbox>
             * ```
             *
             * @export
             * @class ResizerTag
             * @extends {AFXTag}
             */
            export class ResizerTag extends AFXTag {
                /**
                 * Reference to the element that this tag is attached to
                 *
                 * @private
                 * @type {*}
                 * @memberof ResizerTag
                 */
                private _resizable_el: any;

                /**
                 * Reference to the parent tag of the current tag.
                 * The parent tag should be an instance of a [[TileLayoutTag]]
                 * such as [[VBoxTag]] or [[HBoxTag]]
                 *
                 * @private
                 * @type {*}
                 * @memberof ResizerTag
                 */
                private _parent: any;

                /**
                 * Placeholder of the minimum value that
                 * the attached element can be resized
                 *
                 * @private
                 * @type {number}
                 * @memberof ResizerTag
                 */
                private _minsize: number;

                /**
                 *Creates an instance of ResizerTag.
                 * @memberof ResizerTag
                 */
                constructor() {
                    super();
                }

                /**
                 * Set the properties of the tag to default values
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
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof ResizerTag
                 */
                protected reload(d?: any): void {}
                /**
                 * Set resize direction, two possible values:
                 * - `hz` - horizontal direction, resize by width
                 * - `ve` - vertical direction, resize by height
                 *
                 * @memberof ResizerTag
                 */
                set dir(v: string) {
                    $(this).attr("dir", v);
                }

                /**
                 * Get the resize direction
                 *
                 * @type {string}
                 * @memberof ResizerTag
                 */
                get dir(): string {
                    return $(this).attr("dir");
                }

                /**
                 * Mount the tag to the DOM tree
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
                 * Enable draggable on the element
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
                 * Resize the attached element in the horizontal direction (width)
                 *
                 * @private
                 * @param {JQuery.MouseEventBase} e JQuery mouse event
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
                 * Resize the attached element in the vertical direction (height)
                 *
                 * @protected
                 * @param {JQuery.MouseEventBase} e JQuery mouse event
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
                 * Layout definition of the tag, empty layout
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
