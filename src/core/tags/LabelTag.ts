namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * This class defines basic AFX label tag.
             * A label contains a text and an icon (optional)
             *
             * @export
             * @class LabelTag
             * @extends {AFXTag}
             */
            export class LabelTag extends AFXTag {
                /**
                 * placeholder of the text to be displayed
                 *
                 * @private
                 * @type {(string | FormattedString)}
                 * @memberof LabelTag
                 */
                private _text: string | FormattedString;

                /**
                 *Creates an instance of LabelTag.
                 * @memberof LabelTag
                 */
                constructor() {
                    super();
                }

                /**
                 * this implementation does nothing in this tag
                 *
                 * @protected
                 * @memberof LabelTag
                 */
                protected mount() {
                    $(this.refs.container)
                        .css("display", "flex")
                        .css("flex-direction", "row");
                    $(this.refs.iclass)
                        .css("flex-shrink",0);
                    $(this.refs.i)
                        .css("flex-shrink",0);
                    $(this.refs.text)
                        .css("flex",1);
                }

                /**
                 * Refresh the text in the label
                 *
                 * @protected
                 * @param {*} d
                 * @memberof LabelTag
                 */
                protected reload(d: any): void {
                    this.text = this.text;
                }

                /**
                 * Reset to default some property value
                 *
                 * @protected
                 * @memberof LabelTag
                 */
                protected init(): void {
                    this.icon = undefined;
                    this.iconclass = undefined;
                    this.text = undefined;
                    this.selectable = false;
                }

                /**
                 * This implementation of the function does nothing
                 *
                 * @protected
                 * @memberof LabelTag
                 */
                protected calibrate(): void {}

                /**
                 * Set the VFS path of the label icon
                 *
                 * @memberof LabelTag
                 */
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

                /**
                 * Set the CSS class of the label icon
                 *
                 * @memberof LabelTag
                 */
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

                /**
                 * Setter: Set the text of the label
                 * 
                 * Getter: Get the text displayed on the label
                 *
                 * @memberof LabelTag
                 */
                set text(v: string | FormattedString) {
                    this._text = v;
                    if (v && v !== "") {
                        $(this.refs.text).show();
                        $(this.refs.text).html(v.__());
                    } else {
                        $(this.refs.text).hide();
                    }
                }
                get text(): string | FormattedString {
                    return this._text;
                }


                /**
                 * Setter: Turn on/off text selection
                 *
                 * Getter: Check whether the label is selectable
                 *
                 * @memberof LabelTag
                 */
                set selectable(v: boolean) {
                    this.attsw(v, "selectable");
                    if(v)
                    {
                        $(this.refs.text)
                            .css("user-select", "text")
                            .css("cursor", "text");
                    }
                    else
                    {
                        $(this.refs.text)
                            .css("user-select", "none")
                            .css("cursor", "default");
                    }
                }
                get swon(): boolean {
                    return this.hasattr("selectable");
                }

                /**
                 * Lqbel layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof LabelTag
                 */
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
