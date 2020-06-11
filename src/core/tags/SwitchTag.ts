namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * A switch tag is basically used to visualize an boolean data value.
             *
             * @export
             * @class SwitchTag
             * @extends {AFXTag}
             */
            export class SwitchTag extends AFXTag {
                /**
                 * Placeholder for the onchange event handle
                 *
                 * @private
                 * @type {TagEventCallback<boolean>}
                 * @memberof SwitchTag
                 */
                private _onchange: TagEventCallback<boolean>;

                /**
                 * Turn on/off the switch
                 *
                 * @memberof SwitchTag
                 */
                set swon(v: boolean) {
                    this.attsw(v, "swon");
                    $(this.refs.switch).removeClass();
                    if (v) {
                        $(this.refs.switch).addClass("swon");
                    }
                }

                /**
                 * Check whether the switch is turned on
                 *
                 * @type {boolean}
                 * @memberof SwitchTag
                 */
                get swon(): boolean {
                    return this.hasattr("swon");
                }

                /**
                 * Enable the switch
                 *
                 * @memberof SwitchTag
                 */
                set enable(v: boolean) {
                    this.attsw(v, "enable");
                }

                /**
                 * Check whether the switch is enabled
                 *
                 * @type {boolean}
                 * @memberof SwitchTag
                 */
                get enable(): boolean {
                    return this.hasattr("enable");
                }

                /**
                 * Set the onchange event handle
                 *
                 * @memberof SwitchTag
                 */
                set onswchange(v: TagEventCallback<boolean>) {
                    this._onchange = v;
                }

                /**
                 * Mount the tag and bind the click event to the switch
                 *
                 * @protected
                 * @memberof SwitchTag
                 */
                protected mount(): void {
                    $(this.refs.switch).click((e) => {
                        return this.makechange(e);
                    });
                }

                /**
                 * This function will turn the switch (on/off)
                 * and trigger the onchange event
                 *
                 * @private
                 * @param {JQuery.ClickEvent} e
                 * @returns
                 * @memberof SwitchTag
                 */
                private makechange(e: JQuery.ClickEvent) {
                    if (!this.enable) {
                        return;
                    }
                    this.swon = !this.swon;
                    const evt = { id: this.aid, data: this.swon };
                    this._onchange(evt);
                    return this.observable.trigger("switch", evt);
                }

                /**
                 * Tag layout definition
                 *
                 * @protected
                 * @returns
                 * @memberof SwitchTag
                 */
                protected layout() {
                    return [
                        {
                            el: "span",
                            ref: "switch",
                        },
                    ];
                }

                /**
                 * Init the tag:
                 * - switch is turn off
                 * - switch is enabled
                 *
                 * @protected
                 * @memberof SwitchTag
                 */
                protected init(): void {
                    this.swon = false;
                    this.enable = true;
                    this._onchange = (e) => {};
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof SwitchTag
                 */
                protected calibrate(): void {}

                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof SwitchTag
                 */
                protected reload(d?: any): void {}
            }

            define("afx-switch", SwitchTag);
        }
    }
}
