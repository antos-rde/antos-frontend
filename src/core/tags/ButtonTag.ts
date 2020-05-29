/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
namespace OS {
    export namespace GUI {
        export namespace tag {
            export class ButtonTag extends AFXTag {
                private _selected: boolean;
                private _onbtclick: TagEventCallback;
                constructor() {
                    super();
                }
                set onbtclick(v: TagEventCallback)
                {
                    this._onbtclick = v;
                }
                set icon(v: string) {
                    $(this).attr("icon", v);
                    (this.refs.label as LabelTag).icon = v;
                }

                set iconclass(v: string) {
                    $(this).attr("iconclass", v);
                    (this.refs.label as LabelTag).iconclass = v;
                }

                set text(v: string |  FormatedString) {
                    (this.refs.label as LabelTag).text = v;
                }
                get text(): string| FormatedString {
                    return (this.refs.label as LabelTag).text;
                }
                set enable(v: boolean) {
                    $(this.refs.button).prop("disabled", !v);
                }

                get enable(): boolean {
                    return !$(this.refs.button).prop("disabled");
                }

                set selected(v: boolean) {
                    $(this.refs.button).removeClass();
                    this.attsw(v, "selected");
                    if (v) {
                        $(this.refs.button).addClass("selected");
                    }
                }
                get selected(): boolean {
                    return this.hasattr("selected");
                }

                set toggle(v: boolean) {
                    this.attsw(v, "toggle");
                }

                get toggle(): boolean {
                    return this.hasattr("toggle");
                }

                protected mount() {
                    $(this.refs.button).click((e) => {
                        const evt: TagEventType = {
                            id: this.aid,
                            data: e,
                        };
                        this._onbtclick(evt);
                        this.observable.trigger("btclick", evt);
                        if (this.toggle) {
                            return (this.selected = !this.selected);
                        }
                    });
                }
                protected init(): void {
                    this.enable = true;
                    this.toggle = false;
                    this._onbtclick = (e) => {};
                }
                protected calibrate(): void {}
                reload(d?: any): void {}
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "Button",
                            ref: "button",
                            children: [{ el: "afx-label", ref: "label" }],
                        },
                    ];
                }
            }
            define("afx-button", ButtonTag);
        }
    }
}
