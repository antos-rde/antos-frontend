/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
namespace OS {
    export namespace GUI {
        export namespace tag {
            export class SwitchTag extends AFXTag {
                private _onchange: TagEventCallback;
                private _onchanging: TagEventCallback;
                constructor() {
                    super();
                    
                }

                set swon(v: boolean) {
                    this.attsw(v, "swon");
                    $(this.refs.switch).removeClass();
                    if (v) {
                        $(this.refs.switch).addClass("swon");
                    }
                }

                get swon(): boolean {
                    return this.hasattr("swon");
                }

                set enable(v: boolean) {
                    this.attsw(v, "enable");
                }

                get enable(): boolean {
                    return this.hasattr("enable");
                }

                set onswchange(v: TagEventCallback) {
                    this._onchange = v;
                }

                protected mount(): void {
                    $(this.refs.switch).click((e) => {
                        return this.makechange(e);
                    });
                }

                private makechange(e: JQuery.ClickEvent) {
                    if (!this.enable) {
                        return;
                    }
                    this.swon = !this.swon;
                    const evt = { id: this.aid, data: this.swon };
                    this._onchange(evt);
                    return this.observable.trigger("switch", evt);
                }

                protected layout() {
                    return [
                        {
                            el: "span",
                            ref: "switch",
                        },
                    ];
                }

                protected init(): void {
                    this.swon = false;
                    this.enable = true;
                }
                protected calibrate(): void {}
                protected reload(d?: any): void {}
            }

            define("afx-switch", SwitchTag);
        }
    }
}
