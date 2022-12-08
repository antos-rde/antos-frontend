namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * A tile layout organize it child elements
             * in a fixed horizontal or vertical direction.
             *
             * The size of each child element is attributed based
             * on its configuration of automatically based on the
             * remaining space in the layout
             *
             *
             * @export
             * @class TileLayoutTag
             * @extends {AFXTag}
             */
            export class TileLayoutTag extends AFXTag {
                /**
                 *C reates an instance of TileLayoutTag.
                 * @memberof TileLayoutTag
                 */
                constructor() {
                    super();
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof TileLayoutTag
                 */
                protected init(): void {}
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof TileLayoutTag
                 */
                protected reload(d?: any): void {}

                /**
                 * Setter: Set the name of the tile container, should be: `hbox` or `vbox`
                 * 
                 * Getter: Get the name of the tile container
                 *
                 * @memberof TileLayoutTag
                 */
                set name(v: string) {
                    if (!v) {
                        return;
                    }
                    $(this).attr("name", v);
                    $(this.refs.yield)
                        .removeClass()
                        .addClass(`afx-${v}-container`);
                    this.calibrate();
                }
                get name(): string {
                    return $(this).attr("name");
                }

                /**
                 * Setter:
                 * 
                 * SET the layout direction, should be:
                 * - `row`: horizontal direction
                 * - `column`: vertical direction
                 * 
                 * Getter:
                 * 
                 * Get layout direction
                 *
                 * @memberof TileLayoutTag
                 */
                set dir(v: "row" | "column") {
                    if (!v) {
                        return;
                    }
                    $(this).attr("dir", v);
                    $(this.refs.yield).css("flex-direction", v);
                    this.calibrate();
                }
                get dir(): "row" | "column" {
                    return $(this).attr("dir") as any;
                }

                /**
                 * Mount the element
                 *
                 * @protected
                 * @returns {void}
                 * @memberof TileLayoutTag
                 */
                protected mount(): void {
                    $(this).css("display", "block");
                    $(this.refs.yield)
                        .css("display", "flex")
                        .css("width", "100%")
                        .css("height", "100%");
                    this.observable.on("resize", (e) => this.calibrate());
                    return this.calibrate();
                }

                /**
                 * re-organize the layout
                 *
                 * @returns {void}
                 * @memberof TileLayoutTag
                 */
                calibrate(): void {
                    if (this.dir === "row") {
                        return this.hcalibrate();
                    }
                    if (this.dir === "column") {
                        return this.vcalibrate();
                    }
                }

                /**
                 * Organize the layout in horizontal direction, only work when
                 * the layout direction set to horizontal
                 *
                 * @private
                 * @returns {void}
                 * @memberof TileLayoutTag
                 */
                private hcalibrate(): void {
                    const auto_width = [];
                    let ocwidth = 0;
                    const avaiWidth = $(this).width();
                    $(this.refs.yield)
                        .children()
                        .each(function (e) {
                            $(this).css("height", "100%");
                            let attv = $(this).attr("data-width");
                            let dw = 0;
                            if (attv && attv !== "grow") {
                                if (attv[attv.length - 1] === "%") {
                                    dw =
                                        (parseInt(attv.slice(0, -1)) *
                                            avaiWidth) /
                                        100;
                                } else {
                                    dw = parseInt(attv);
                                }
                                $(this).css("width", `${dw}px`);
                                ocwidth += dw;
                            } else {
                                $(this).css("flex-grow", "1");
                                auto_width.push(this);
                            }
                        });

                    const csize = (avaiWidth - ocwidth) / auto_width.length;
                    if (csize > 0) {
                        $.each(auto_width, (i, v) =>
                            $(v).css("width", `${csize}px`)
                        );
                    }
                }

                /**
                 * Organize the layout in vertical direction, only work when
                 * the layout direction set to vertical
                 *
                 * @private
                 * @returns {void}
                 * @memberof TileLayoutTag
                 */
                private vcalibrate(): void {
                    const auto_height = [];
                    let ocheight = 0;
                    const avaiheight = $(this).height();
                    $(this.refs.yield)
                        .children()
                        .each(function (e) {
                            let dh = 0;
                            $(this).css("width", "100%");
                            let attv = $(this).attr("data-height");
                            if (attv && attv !== "grow") {
                                if (attv[attv.length - 1] === "%") {
                                    dh =
                                        (parseInt(attv.slice(0, -1)) *
                                            avaiheight) /
                                        100;
                                } else {
                                    dh = parseInt(attv);
                                }
                                $(this).css("height", `${dh}px`);
                                ocheight += dh;
                            } else {
                                $(this).css("flex-grow", "1");
                                auto_height.push(this);
                            }
                        });

                    const csize = (avaiheight - ocheight) / auto_height.length;
                    if (csize > 0) {
                        $.each(auto_height, (i, v) =>
                            $(v).css("height", `${csize}px`)
                        );
                    }
                }

                /**
                 * Layout definition
                 *
                 * @returns
                 * @memberof TileLayoutTag
                 */
                layout() {
                    return [
                        {
                            el: "div",
                            ref: "yield",
                        },
                    ];
                }
            }

            /**
             * A HBox organize its child elements in horizontal direction
             *
             * @export
             * @class HBoxTag
             * @extends {TileLayoutTag}
             */
            export class HBoxTag extends TileLayoutTag {
                /**
                 * Creates an instance of HBoxTag.
                 * @memberof HBoxTag
                 */
                constructor() {
                    super();
                }

                /**
                 * Mount the tag
                 *
                 * @protected
                 * @memberof HBoxTag
                 */
                protected mount(): void {
                    super.mount();
                    this.dir = "row";
                    this.name = "hbox";
                }
            }

            /**
             * A VBox organize its child elements in vertical direction
             *
             * @export
             * @class VBoxTag
             * @extends {TileLayoutTag}
             */
            export class VBoxTag extends TileLayoutTag {
                /**
                 *Creates an instance of VBoxTag.
                 * @memberof VBoxTag
                 */
                constructor() {
                    super();
                }

                /**
                 * Mount the tag
                 *
                 * @protected
                 * @memberof VBoxTag
                 */
                protected mount(): void {
                    super.mount();
                    this.dir = "column";
                    this.name = "vbox";
                }
            }

            define("afx-tile", TileLayoutTag);
            define("afx-hbox", HBoxTag);
            define("afx-vbox", VBoxTag);
        }
    }
}
