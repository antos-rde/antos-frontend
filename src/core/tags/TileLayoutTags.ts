namespace OS {
    export namespace GUI {
        export namespace tag {
            
            type TileItemDirection = "row" | "column" | "row-reverse" | "column-reverse";

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
                
                private _padding: number;

                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof TileLayoutTag
                 */
                protected init(): void {
                    this.padding = 0;
                }
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
                set dir(v: TileItemDirection) {
                    if (!v) {
                        return;
                    }
                    $(this).attr("dir", v);
                    this.reversed = this.reversed;
                    this.calibrate();
                }
                get dir(): TileItemDirection {
                    return $(this).attr("dir") as any;
                }
                /**
                 * Setter:
                 * 
                 * SET content padding
                 * 
                 * Getter:
                 * 
                 * Get content padding
                 *
                 * @memberof TileLayoutTag
                 */
                set padding(v: number)
                {
                    $(this).attr("padding", v);
                    this._padding = v;
                }
                get padding(): number
                {
                    return this._padding;
                }
                /**
                 * setter: Reverse order of the content in the tile
                 * 
                 * getter: return if the tile's content is in reversed order
                 * 
                 * @meberof TileLayoutTags
                 */
                set reversed(v: boolean)
                {
                    this.attsw(v, "reversed");
                    if(!this.dir)
                    {
                        return;
                    }
                    let newdir = "row";
                    if(this.dir.startsWith("column"))
                    {
                        newdir = "column"
                    }
                    if(v)
                    {
                        newdir += "-reverse";
                    }
                    $(this.refs.yield).css("flex-direction", newdir);
                }
                get reversed(): boolean
                {
                     return this.hasattr("reversed");
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
                        .css("display", "flex");
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
                    $(this.refs.yield)
                        .css("padding", this.padding)
                        .css("width", `${$(this).width() - this.padding*2}px`)
                        .css("height", `${$(this).height() - this.padding*2}px`);
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
                    const avaiWidth = $(this).width() - this.padding * 2;
                    const avaiheight = $(this).innerHeight() - this.padding * 2;
                    $(this.refs.yield)
                        .children()
                        .each(function (e) {
                            $(this).css("height", "100%");
                            let attv = $(this).attr("data-width");
                            let dw = 0;
                            if (!attv || attv == "grow") {
                                $(this).css("flex-grow", "1");
                                auto_width.push(this);
                                return;
                            }
                            if(attv == "content")
                            {
                                ocwidth += $(this).width();
                                return;
                            }
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
                        });

                    const csize = (avaiWidth - ocwidth) / auto_width.length;
                    if (csize > 0) {
                        $.each(auto_width, (i, v) =>
                            $(v).css("width", `${csize}px`)
                        );
                    }
                    this.observable.trigger("hboxchange", {
                        id: this.aid,
                        data: { w: avaiWidth, h: avaiheight },
                    });
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
                    const avaiheight = $(this).innerHeight() - this.padding * 2;
                    const avaiwidth = $(this).width() - this.padding * 2;
                    $(this.refs.yield)
                        .children()
                        .each(function (e) {
                            let dh = 0;
                            $(this).css("width", "100%");
                            let attv = $(this).attr("data-height");
                            if (!attv || attv == "grow") {
                                $(this).css("flex-grow", "1");
                                auto_height.push(this);
                                return;
                            }
                            if(attv == "content")
                            {
                                 ocheight += $(this).height();
                                return;
                            }
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
                        });

                    const csize = (avaiheight - ocheight) / auto_height.length;
                    if (csize > 0) {
                        $.each(auto_height, (i, v) =>
                            $(v).css("height", `${csize}px`)
                        );
                    }

                    this.observable.trigger("vboxchange", {
                        id: this.aid,
                        data: { w: avaiwidth, h: avaiheight },
                    });
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
