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
             * @class SliderTag
             * @extends {AFXTag}
             */
            class SliderTag extends AFXTag {
                private _max: number;
                private _value: number;
                private _onchange: TagEventCallback<number>;
                private _onchanging: TagEventCallback<number>;

                /**
                 *Creates an instance of SliderTag.
                 * @memberof SliderTag
                 */
                constructor() {
                    super();
                }

                /**
                 *
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
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof SliderTag
                 */
                protected reload(d?: any): void {}

                /**
                 *
                 *
                 * @memberof SliderTag
                 */
                set onvaluechange(f: TagEventCallback<number>) {
                    this._onchange = f;
                }

                /**
                 *
                 *
                 * @memberof SliderTag
                 */
                set onvaluechanging(f: TagEventCallback<number>) {
                    this._onchanging = f;
                }

                /**
                 *
                 *
                 * @memberof SliderTag
                 */
                set enable(v: boolean) {
                    this.attsw(v, "enable");
                    if (v) {
                        $(this)
                            .mouseover(() => {
                                return $(this.refs.point).show();
                            })
                            .mouseout(() => {
                                return $(this.refs.point).hide();
                            });
                    } else {
                        $(this.refs.point).hide();
                        $(this).unbind("mouseover").unbind("mouseout");
                    }
                }

                /**
                 *
                 *
                 * @type {boolean}
                 * @memberof SliderTag
                 */
                get enable(): boolean {
                    return this.hasattr("enable");
                }

                /**
                 *
                 *
                 * @memberof SliderTag
                 */
                set value(v: number) {
                    this._value = v;
                    this.calibrate();
                }

                /**
                 *
                 *
                 * @type {number}
                 * @memberof SliderTag
                 */
                get value(): number {
                    return this._value;
                }

                /**
                 *
                 *
                 * @memberof SliderTag
                 */
                set max(v: number) {
                    this._max = v;
                    this.calibrate();
                }

                /**
                 *
                 *
                 * @type {number}
                 * @memberof SliderTag
                 */
                get max(): number {
                    return this._max;
                }

                /**
                 *
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
                    $(this.refs.container).click((e) => {
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
                 *
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
                 *
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
                            $(window).unbind("mousemove", null);
                            return $(window).unbind("mouseup", null);
                        });
                    });
                }

                /**
                 *
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
