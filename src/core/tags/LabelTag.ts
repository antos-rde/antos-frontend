/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
namespace OS {
    export namespace GUI {
        export namespace tag {
            export class LabelTag extends AFXTag {
                private _text: string | FormattedString;
                constructor() {
                    super();
                }

                protected mount() {
                    
                }

                protected reload(d: any): void {
                    this.text = this.text;
                }

                protected init(): void {
                    this.icon = undefined;
                    this.iconclass = undefined;
                    this.text = undefined;
                }

                protected calibrate(): void {}

                set icon(v: string) {
                    $(this.refs.i).attr("style", "");
                    $(this).attr("icon", v);
                    if (v) {
                        $(this.refs.i)
                            .css("background", `url(${API.handle.get}/${v})`)
                            .css("background-size", "100% 100%")
                            .css("background-repeat", "no-repeat");
                        $(this.refs.i).show();
                    } else {
                        $(this.refs.i).hide();
                    }
                }

                set iconclass(v: string) {
                    $(this).attr("iconclass", v);
                    $(this.refs.iclass).removeClass();
                    if (v) {
                        $(this.refs.iclass).addClass(v);
                        $(this.refs.iclass).show();
                    } else {
                        $(this.refs.iclass).hide();
                    }
                }

                set text(v: string | FormattedString) {
                    this._text = v;
                    if (v && v !== "") {
                        $(this.refs.text).show();
                        $(this.refs.text).html(v.__());
                    } else {
                        $(this.refs.text).hide();
                    }
                }

                get text(): string| FormattedString {
                    return this._text;
                }

                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "span",
                            ref: "container",
                            children: [
                                { el: "i", ref: "iclass" },
                                { el: "i", ref: "i", class: "icon-style" },
                                { el: "i", ref: "text", class: "label-text" },
                            ],
                        },
                    ];
                }
            }

            define("afx-label", LabelTag);
        }
    }
}
