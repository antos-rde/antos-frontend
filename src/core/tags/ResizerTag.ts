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
                 * Reference to the resize event callback
                 *
                 * @private
                 * @type {TagEventCallback<any>}
                 * @memberof ResizerTag
                 */
                private _onresize: TagEventCallback<any>;

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
                protected reload(d?: any): void { }
                /**
                 * Setter:
                 *
                 * Set resize direction, two possible values:
                 * - `hz` - horizontal direction, resize by width
                 * - `ve` - vertical direction, resize by height
                 *
                 * Getter:
                 *
                 * Get the resize direction
                 *
                 * @memberof ResizerTag
                 */
                set dir(v: string) {
                    let att: string;
                    $(this).attr("dir", v);
                    $(this).off("pointerdown", null);
                    if (v === "hz") {
                        $(this).css("cursor", "col-resize");
                        $(this).addClass("horizontal");
                        if (this._resizable_el) {
                            att = $(this._resizable_el).attr("min-width");
                            if (att) {
                                this._minsize = parseInt(att);
                            }
                        }
                    } else if (v === "ve") {
                        $(this).css("cursor", "row-resize");
                        $(this).addClass("vertical");
                        if (this._resizable_el) {
                            att = $(this._resizable_el).attr("min-height");
                            if (att) {
                                this._minsize = parseInt(att);
                            }
                        }
                    }
                    if (this._minsize === 0) {
                        this._minsize = 10;
                    }
                    this.make_draggable();
                }
                get dir(): string {
                    return $(this).attr("dir");
                }


                /**
                 * Getter : Check whether the resizer should attach to its next or previous element
                 * 
                 * Setter: if `v=true` select next element as attached element of the resizer, otherwise
                 * select the previous element
                 * @readonly
                 * @type {boolean}
                 * @memberof ResizerTag
                 */
                get attachnext(): boolean {
                    return this.hasattr("attachnext");
                }
                set attachnext(v: boolean) {
                    this.attsw(v, "attachnext");
                }

                /**
                 * Setter:
                 * - set the resize event callback
                 *
                 * Getter:
                 * - get the resize event callback
                 *
                 * @memberof ResizerTag
                 */
                set onelresize(v: TagEventCallback<any>) {
                    this._onresize = v;
                }
                get onelresize(): TagEventCallback<any> {
                    return this._onresize;
                }

                /**
                 * Mount the tag to the DOM tree
                 *
                 * @protected
                 * @memberof ResizerTag
                 */
                protected mount(): void {
                    $(this).css(" display", "block");
                    const tagname = $(this._parent).prop("tagName");
                    if (this.attachnext) {
                        this._resizable_el =
                            $(this).next().length === 1
                                ? $(this).next()[0]
                                : undefined;
                    }
                    else {
                        this._resizable_el =
                            $(this).prev().length === 1
                                ? $(this).prev()[0]
                                : undefined;
                    }

                    if (tagname === "AFX-HBOX") {
                        this.dir = "hz";
                    } else if (tagname === "AFX-VBOX") {
                        this.dir = "ve";
                    } else {
                        this.dir = "hz";
                    }
                }

                /**
                 * Enable draggable on the element
                 *
                 * @private
                 * @memberof ResizerTag
                 */
                private make_draggable(): void {
                    $(this).css("user-select", "none");
                    if (!this.dir || this.dir == "none") {
                        return;
                    }
                    $(this).on("pointerdown", (e) => {
                        e.preventDefault();
                        $(window).on("pointermove", (evt) => {
                            if (!this._resizable_el) {
                                return;
                            }
                            if (this.dir === "hz") {
                                return this.horizontalResize(evt as JQuery.MouseEventBase);
                            } else if (this.dir === "ve") {
                                return this.verticalResize(evt as JQuery.MouseEventBase);
                            }
                        });

                        return $(window).on("pointerup", function (evt) {
                            $(window).off("pointermove", null);
                            $(window).off("pointerup", null);

                            return $(window).off("pointerup", null);
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
                    let w = 0;
                    if (this.attachnext) {
                        w = Math.round(offset.left + $(this._resizable_el).width() - e.clientX);
                    }
                    else {
                        w = Math.round(e.clientX - offset.left);
                    }
                    if (w < this._minsize) {
                        w = this._minsize;
                    }
                    $(this._resizable_el).attr("data-width", w.toString());
                    let evt = {
                        id: this.aid,
                        data: { w },
                    };
                    if (this.onelresize) {
                        this.onelresize(evt);
                    }
                    this.observable.trigger("resize", evt);
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
                    let h = 0;
                    if (this.attachnext) {
                        h = Math.round(offset.top + $(this._resizable_el).height() - e.clientY);
                    }
                    else {
                        h = Math.round(e.clientY - offset.top);
                    }
                    if (h < this._minsize) {
                        h = this._minsize;
                    }
                    $(this._resizable_el).attr("data-height", h.toString());
                    let evt = {
                        id: this.aid,
                        data: { h },
                    };
                    if (this.onelresize) {
                        this.onelresize(evt);
                    }
                    return this.observable.trigger("resize", evt);
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
