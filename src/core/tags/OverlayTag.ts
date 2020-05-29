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
             * @export
             * @class OverlayTag
             * @extends {AFXTag}
             */
            export class OverlayTag extends AFXTag {
                private _width: string;
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
                 *
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
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof OverlayTag
                 */
                protected reload(d?: any): void {}

                /**
                 *
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

                /**
                 *
                 *
                 * @type {string}
                 * @memberof OverlayTag
                 */
                get width(): string {
                    return this._width;
                }

                /**
                 *
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

                /**
                 *
                 *
                 * @type {string}
                 * @memberof OverlayTag
                 */
                get height(): string {
                    return this._height;
                }

                /**
                 *
                 *
                 * @protected
                 * @returns {void}
                 * @memberof OverlayTag
                 */
                protected mount(): void {
                    return this.calibrate();
                }

                /**
                 *
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
                 *
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
