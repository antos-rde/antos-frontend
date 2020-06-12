namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * An overlay tag is a layout tag that alway stay on top of
             * the virtual desktop environment. Tile layout elements ([[VBoxTag]], [[HboxTag]])
             * can be used inside this tag to compose elements
             *
             * @export
             * @class OverlayTag
             * @extends {AFXTag}
             */
            export class OverlayTag extends AFXTag {
                /**
                 * Tag width placeholder
                 *
                 * @private
                 * @type {string}
                 * @memberof OverlayTag
                 */
                private _width: string;

                /**
                 * Tag height place holder
                 *
                 * @private
                 * @type {string}
                 * @memberof OverlayTag
                 */
                private _height: string;

                /**
                 *Creates an instance of OverlayTag.
                 * @memberof OverlayTag
                 */
                constructor() {
                    super();
                }
                //.css "display", "flex"
                //.css "flex-direction", "column"
                //$(@refs.yield).css "flex", "1"

                /**
                 * Put the tag on top of the virtual desktop environment
                 *
                 * @protected
                 * @memberof OverlayTag
                 */
                protected init(): void {
                    $(this.refs.yield)
                        .css("position", "relative")
                        .css("width", "100%")
                        .css("height", "100%");
                    $(this).css("position", "absolute").css("z-index", 1000000);
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof OverlayTag
                 */
                protected reload(d?: any): void {}

                /**
                 * Setter:
                 * 
                 * Set the width of the tag, the tag width should be in form of:
                 * `100px` of `80%`
                 * 
                 * Getter:
                 * 
                 * Get the tag width
                 *
                 * @memberof OverlayTag
                 */
                set width(v: string) {
                    if (!v) {
                        return;
                    }
                    this._width = v;
                    this.calibrate();
                }
                get width(): string {
                    return this._width;
                }

                /**
                 * Setter:
                 * 
                 * Set the tag height, the tag height should be in form of:
                 * `100px` of `80%`
                 * 
                 * Getter:
                 * 
                 * Get the tag height
                 *
                 * @memberof OverlayTag
                 */
                set height(v: string) {
                    if (!v) {
                        return;
                    }
                    this._height = v;
                    this.calibrate();
                }
                get height(): string {
                    return this._height;
                }

                /**
                 * Calibrate the element when mounting
                 *
                 * @protected
                 * @returns {void}
                 * @memberof OverlayTag
                 */
                protected mount(): void {
                    return this.calibrate();
                }

                /**
                 * Calibrate the width and height of the tag
                 *
                 * @returns {void}
                 * @memberof OverlayTag
                 */
                calibrate(): void {
                    $(this).css("width", this.width).css("height", this.height);
                    return this.observable.trigger("resize", {
                        id: this.aid,
                        data: {
                            w: this.width,
                            h: this.height,
                        },
                    });
                }

                /**
                 * Layout definition of the tag
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof OverlayTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "afx-vbox",
                            ref: "yield",
                        },
                    ];
                }
            }
            define("afx-overlay", OverlayTag);
        }
    }
}
