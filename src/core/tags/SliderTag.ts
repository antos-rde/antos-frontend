namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * A slider or track bar is a graphical control element with which
             * a user may set a value by moving an indicator, usually horizontally
             *
             * @class SliderTag
             * @extends {AFXTag}
             */
            export class SliderTag extends AFXTag {
                /**
                 * Slider max value placeholder
                 *
                 * @private
                 * @type {number}
                 * @memberof SliderTag
                 */
                private _max: number;

                /**
                 * Current slider value placeholder
                 *
                 * @private
                 * @type {number}
                 * @memberof SliderTag
                 */
                private _value: number;

                /**
                 * Placeholder of the on change event handle
                 *
                 * @private
                 * @type {TagEventCallback<number>}
                 * @memberof SliderTag
                 */
                private _onchange: TagEventCallback<number>;

                /**
                 * Placeholder of the on changing event handle
                 *
                 * @private
                 * @type {TagEventCallback<number>}
                 * @memberof SliderTag
                 */
                private _onchanging: TagEventCallback<number>;

                /**
                 * Creates an instance of SliderTag.
                 * @memberof SliderTag
                 */
                constructor() {
                    super();
                }

                /**
                 *  Init the default value of the slider:
                 * - `max`: 100
                 * - `value`: 0
                 *
                 * @protected
                 * @memberof SliderTag
                 */
                protected init(): void {
                    this.enable = true;
                    this._max = 100;
                    this._value = 0;
                    this._onchange = this._onchanging = () => {};
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof SliderTag
                 */
                protected reload(d?: any): void {}

                /**
                 * Set value change event handle.
                 * This handle will be triggered when the
                 * slider indicator is released
                 *
                 * @memberof SliderTag
                 */
                set onvaluechange(f: TagEventCallback<number>) {
                    this._onchange = f;
                }

                /**
                 * Set value changing event handle.
                 * This handle is triggered when moving the
                 * slider indicator
                 *
                 * @memberof SliderTag
                 */
                set onvaluechanging(f: TagEventCallback<number>) {
                    this._onchanging = f;
                }

                /**
                 * Setter: Enable/disable the slider
                 * 
                 * Getter: Check whether the slider is enabled
                 *
                 * @memberof SliderTag
                 */
                set enable(v: boolean) {
                    this.attsw(v, "enable");
                    if (v) {
                        $(this)
                            .on("mouseover",() => {
                                return $(this.refs.point).show();
                            })
                            .on("mouseout",() => {
                                return $(this.refs.point).hide();
                            });
                    } else {
                        $(this.refs.point).hide();
                        $(this).off("mouseover").off("mouseout");
                    }
                }
                get enable(): boolean {
                    return this.hasattr("enable");
                }

                /**
                 * Setter: Set the slider value
                 * 
                 * Getter: Get the current slider value
                 *
                 * @memberof SliderTag
                 */
                set value(v: number) {
                    this._value = v;
                    this.calibrate();
                }
                get value(): number {
                    return this._value;
                }

                /**
                 * Setter: Set the maximum value of the slider
                 * 
                 * Getter: Get the maximum value of the slider
                 *
                 * @memberof SliderTag
                 */
                set max(v: number) {
                    this._max = v;
                    this.calibrate();
                }
                get max(): number {
                    return this._max;
                }

                /**
                 * Mount the tag and bind some basic events
                 *
                 * @protected
                 * @memberof SliderTag
                 */
                protected mount(): void {
                    this.enable_dragging();
                    $(this.refs.point).css("position", "absolute");
                    $(this.refs.point).hide();
                    this.observable.on("resize", (e) => {
                        return this.calibrate();
                    });
                    $(this.refs.container).on("click",(e) => {
                        const offset = $(this.refs.container).offset();
                        const left = e.clientX - offset.left;
                        const maxw = $(this.refs.container).width();
                        this.value = (left * this.max) / maxw;
                        this.calibrate();
                        const evt = { id: this.aid, data: this.value };
                        this._onchange(evt);
                        return this._onchanging(evt);
                    });
                    this.calibrate();
                }

                /**
                 * Calibrate the slide based on its value and max value
                 *
                 * @memberof SliderTag
                 */
                calibrate(): void {
                    if (this.value > this.max) {
                        this.value = this.max;
                    }
                    $(this.refs.container).css("width", $(this).width() + "px");
                    const w =
                        ($(this.refs.container).width() * this.value) /
                        this.max;
                    $(this.refs.prg)
                        .css("width", w + "px")
                        .css("height", $(this.refs.container).height() + "px");
                    if (this.enable) {
                        const ow = w - $(this.refs.point).width() / 2;
                        const top = Math.floor(
                            ($(this.refs.prg).height() -
                                $(this.refs.point).height()) /
                                2
                        );
                        $(this.refs.point)
                            .css("left", ow + "px")
                            .css("top", top + "px");
                    }
                }

                /**
                 * enable dragging on the slider indicator
                 *
                 * @private
                 * @memberof SliderTag
                 */
                private enable_dragging(): void {
                    $(this.refs.point)
                        .css("user-select", "none")
                        .css("cursor", "default");
                    $(this.refs.point).on("mousedown", (e) => {
                        e.preventDefault();
                        const offset = $(this.refs.container).offset();
                        $(window).on("mousemove", (e) => {
                            let left = e.clientX - offset.left;
                            left = left < 0 ? 0 : left;
                            const maxw = $(this.refs.container).width();
                            left = left > maxw ? maxw : left;
                            this.value = (left * this.max) / maxw;
                            this.calibrate();
                            return this._onchanging({
                                id: this.aid,
                                data: this.value,
                            });
                        });

                        $(window).on("mouseup", (e) => {
                            this._onchange({
                                id: this.aid,
                                data: this.value,
                            });
                            $(window).off("mousemove", null);
                            return $(window).off("mouseup", null);
                        });
                    });
                }

                /**
                 * Layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof SliderTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "div",
                            class: "container",
                            ref: "container",
                            children: [
                                { el: "div", class: "progress", ref: "prg" },
                                { el: "div", class: "dragpoint", ref: "point" },
                            ],
                        },
                    ];
                }
            }

            define("afx-slider", SliderTag);
        }
    }
}
