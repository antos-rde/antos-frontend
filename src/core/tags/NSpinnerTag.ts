namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * A simple number sinner tag
             *
             * @export
             * @class NSpinnerTag
             * @extends {AFXTag}
             */
            export class NSpinnerTag extends AFXTag {
                /**
                 * Placeholder for value change event handle
                 *
                 * @private
                 * @type {TagEventCallback<number>}
                 * @memberof NSpinnerTag
                 */
                private _onchange: TagEventCallback<number>;

                /**
                 * Placeholder for the spinner data
                 *
                 * @private
                 * @type {number}
                 * @memberof NSpinnerTag
                 */
                private _value: number;

                /**
                 * Place holder for the spinner step
                 *
                 * @type {number}
                 * @memberof NSpinnerTag
                 */
                step: number;

                /**
                 *Creates an instance of NSpinnerTag.
                 * @memberof NSpinnerTag
                 */
                constructor() {
                    super();
                    this._onchange = (e) => {};
                }

                /**
                 * Init the spinner value to `0` and step to `1`
                 *
                 * @protected
                 * @memberof NSpinnerTag
                 */
                protected init(): void {
                    this._value = 0;
                    this.step = 1;
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof NSpinnerTag
                 */
                protected reload(d?: any): void {}

                /**
                 * Set the value change event handle
                 *
                 * @memberof NSpinnerTag
                 */
                set onvaluechange(f: TagEventCallback<number>) {
                    this._onchange = f;
                }

                /**
                 * Mount the tag and bind basic events
                 *
                 * @protected
                 * @memberof NSpinnerTag
                 */
                protected mount(): void {
                    $(this.refs.holder).attr("type", "text");
                    $(this.refs.incr).on("click",(e) => {
                        this.value = this.value + this.step;
                    });

                    $(this.refs.decr).on("click",(e) => {
                        this.value = this.value - this.step;
                    });

                    // @observable.on "calibrate", () -> @calibrate()
                    this.observable.on("resize", () => this.calibrate());

                    $(this.refs.holder).on("keyup", (e) => {
                        if (e.which === 13) {
                            let val = parseInt(
                                (this.refs.holder as HTMLInputElement).value
                            );
                            if (!isNaN(val)) {
                                if (val < 0) {
                                    val = this.value;
                                }
                                return (this.value = val);
                            }
                        }
                    });
                    this.calibrate();
                }

                /**
                 * Calibrate the layout of the spinner
                 *
                 * @memberof NSpinnerTag
                 */
                calibrate(): void {
                }

                /**
                 * Setter: Set the spinner value
                 *
                 * Getter: Get the spinner value
                 *
                 * @memberof NSpinnerTag
                 */
                set value(v: number) {
                    if(this._value === v || isNaN(v))
                    {
                        return;
                    }
                    this._value = v;
                    $(this.refs.holder).val(this._value);
                    const evt = { id: this.aid, data: v };
                    this._onchange(evt);
                    this.observable.trigger("nspin", evt);
                }
                get value(): number {
                    return this._value;
                }

                /**
                 * Spinner layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof NSpinnerTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "input",
                            ref: "holder",
                        },
                        {
                            el: "ul",
                            ref: "spinner",
                            children: [
                                {
                                    el: "li",
                                    class: "incr",
                                    ref: "incr",
                                    children: [{ el: "i" }],
                                },
                                {
                                    el: "li",
                                    class: "decr",
                                    ref: "decr",
                                    children: [{ el: "i" }],
                                },
                            ],
                        },
                    ];
                }
            }

            define("afx-nspinner", NSpinnerTag);
        }
    }
}
