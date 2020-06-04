/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
namespace OS {
    export namespace GUI {
        /**
         *
         *
         * @export
         * @interface ColorType
         */
        export interface ColorType {
            r: number;
            g: number;
            b: number;
            a?: number;
            text?: string;
            hex?: string;
        }
        export namespace tag {
            /**
             *
             *
             * @export
             * @class ColorPickerTag
             * @extends {AFXTag}
             */
            export class ColorPickerTag extends AFXTag {
                private _selectedColor: ColorType;
                private _oncolorselect: TagEventCallback<ColorType>;

                /**
                 *Creates an instance of ColorPickerTag.
                 * @memberof ColorPickerTag
                 */
                constructor() {
                    super();
                    this._oncolorselect = (e) => {};
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof ColorPickerTag
                 */
                protected init(): void {}

                /**
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof ColorPickerTag
                 */
                protected reload(d?: any): void {}

                /**
                 *
                 *
                 * @readonly
                 * @type {ColorType}
                 * @memberof ColorPickerTag
                 */
                get selectedColor(): ColorType {
                    return this._selectedColor;
                }

                /**
                 *
                 *
                 * @memberof ColorPickerTag
                 */
                set oncolorselect(v: TagEventCallback<ColorType>) {
                    this._oncolorselect = v;
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof ColorPickerTag
                 */
                protected mount(): void {
                    $(this.refs.wrapper)
                        .css("width", "310px")
                        .css("height", "190px")
                        .css("display", "block")
                        .css("padding", "3px");
                    $(this.refs.palette)
                        .css("width", "284px")
                        .css("height", "155px")
                        .css("float", "left");
                    $(this.refs.colorval)
                        .css("width", "15px")
                        .css("height", "155px")
                        .css("text-align", "center")
                        .css("margin-left", "3px")
                        .css("display", "block")
                        .css("float", "left");

                    $(this.refs.inputwrp).css("margin-top", "3px");

                    $(this.refs.hextext)
                        .css("width", "70px")
                        .css("margin-left", "3px")
                        .css("margin-right", "5px");

                    this.build_palette();
                }

                /**
                 *
                 *
                 * @private
                 * @memberof ColorPickerTag
                 */
                private build_palette(): void {
                    const colorctx = ($(this.refs.palette).get(
                        0
                    ) as HTMLCanvasElement).getContext("2d");
                    let gradient = colorctx.createLinearGradient(
                        0,
                        0,
                        $(this.refs.palette).width(),
                        0
                    );
                    // fill color
                    gradient.addColorStop(0, "rgb(255,   0,   0)");
                    gradient.addColorStop(0.15, "rgb(255,   0, 255)");
                    gradient.addColorStop(0.33, "rgb(0,     0, 255)");
                    gradient.addColorStop(0.49, "rgb(0,   255, 255)");
                    gradient.addColorStop(0.67, "rgb(0,   255,   0)");
                    gradient.addColorStop(0.84, "rgb(255, 255,   0)");
                    gradient.addColorStop(1, "rgb(255,   0,   0)");
                    gradient.addColorStop(0, "rgb(0,   0,   0)");
                    // Apply gradient to canvas
                    colorctx.fillStyle = gradient;
                    colorctx.fillRect(
                        0,
                        0,
                        colorctx.canvas.width,
                        colorctx.canvas.height
                    );

                    // Create semi transparent gradient (white -> trans. -> black)
                    gradient = colorctx.createLinearGradient(
                        0,
                        0,
                        0,
                        $(this.refs.palette).width()
                    );
                    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
                    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
                    gradient.addColorStop(0.5, "rgba(0,     0,   0, 0)");
                    gradient.addColorStop(1, "rgba(0,     0,   0, 1)");
                    // Apply gradient to canvas
                    colorctx.fillStyle = gradient;
                    colorctx.fillRect(
                        0,
                        0,
                        colorctx.canvas.width,
                        colorctx.canvas.height
                    );
                    // now add mouse move event
                    const getHex = function (c) {
                        let s = c.toString(16);
                        if (s.length === 1) {
                            s = "0" + s;
                        }
                        return s;
                    };

                    const pick_color = (e) => {
                        $(this.refs.palette).css("cursor", "crosshair");
                        const offset = $(this.refs.palette).offset();
                        const x = e.pageX - offset.left;
                        const y = e.pageY - offset.top;
                        const color = colorctx.getImageData(x, y, 1, 1);
                        const data: ColorType = {
                            r: color.data[0],
                            g: color.data[1],
                            b: color.data[2],
                            text:
                                "rgb(" +
                                color.data[0] +
                                ", " +
                                color.data[1] +
                                ", " +
                                color.data[2] +
                                ")",
                            hex:
                                "#" +
                                getHex(color.data[0]) +
                                getHex(color.data[1]) +
                                getHex(color.data[2]),
                        };
                        return data;
                    };

                    const mouse_move_h = (e) => {
                        const data = pick_color(e);
                        return $(this.refs.colorval).css(
                            "background-color",
                            data.text
                        );
                    };

                    $(this.refs.palette).mouseenter((e) => {
                        return $(this.refs.palette).on(
                            "mousemove",
                            mouse_move_h
                        );
                    });

                    $(this.refs.palette).mouseout((e) => {
                        $(this.refs.palette).unbind("mousemove", mouse_move_h);
                        if (this.selectedColor) {
                            return $(this.refs.colorval).css(
                                "background-color",
                                this.selectedColor.text
                            );
                        }
                    });

                    $(this.refs.palette).on("click", (e) => {
                        const data = pick_color(e);
                        $(this.refs.rgbtext).html(data.text);
                        $(this.refs.hextext).val(data.hex);
                        this._selectedColor = data;
                        const evt = { id: this.aid, data };
                        this._oncolorselect(evt);
                        return this.observable.trigger("colorselect", data);
                    });
                }

                /**
                 *
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof ColorPickerTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "div",
                            ref: "wrapper",
                            children: [
                                {
                                    el: "canvas",
                                    class: "color-palette",
                                    ref: "palette",
                                },
                                { el: "color-sample", ref: "colorval" },
                                { el: "div", class: "afx-clear" },
                                {
                                    el: "div",
                                    ref: "inputwrp",
                                    children: [
                                        { el: "input", ref: "hextext" },
                                        { el: "span", ref: "rgbtext" },
                                    ],
                                },
                            ],
                        },
                    ];
                }
            }

            define("afx-color-picker", ColorPickerTag);
        }
    }
}
