namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * This tag define a basic button and its behavior
             *
             * @export
             * @class ButtonTag
             * @extends {AFXTag}
             */
            export class ButtonTag extends AFXTag {
                /**
                 * Variable hold the button click callback handle
                 *
                 * @private
                 * @type {TagEventCallback<JQuery.MouseEventBase>}
                 * @memberof ButtonTag
                 */
                private _onbtclick: TagEventCallback<JQuery.MouseEventBase>;

                /**
                 * Custom user data
                 *
                 * @type {any}
                 * @memberof ButtonTag
                 */
                private _data: any;

                /**
                 * Custom user data setter/gettter
                 * 
                 * @memberof ButtonTag
                 */
                set data(v: any)
                {
                    this._data = v;
                    this.set(v);
                }
                get data(): any
                {
                    return this._data;
                }

                /**
                 *Creates an instance of ButtonTag.
                 * @memberof ButtonTag
                 */
                constructor() {
                    super();
                }

                /**
                 * Set the click callback handle for the target button
                 *
                 * @memberof ButtonTag
                 */
                set onbtclick(v: TagEventCallback<JQuery.MouseEventBase>) {
                    this._onbtclick = v;
                }

                /**
                 * Set the path to the button icon, the path should be
                 * a VFS file path
                 *
                 * @memberof ButtonTag
                 */
                set icon(v: string) {
                    $(this).attr("icon", v);
                    (this.refs.label as LabelTag).icon = v;
                }

                /**
                 * Set the icon class to the button, this property
                 * allows to style the button icon using CSS
                 *
                 * @memberof ButtonTag
                 */
                set iconclass(v: string) {
                    $(this).attr("iconclass", v);
                    (this.refs.label as LabelTag).iconclass = v;
                }
                

                /**
                 * Set the icon class on the right side of the button, this property
                 * allows to style the button icon using CSS
                 *
                 * @memberof ButtonTag
                 */
                set iconclass$(v: string) {
                    $(this).attr("iconclass_end", v);
                    (this.refs.label as LabelTag).iconclass$ = v;
                }

                /**
                 * Set the CSS class of the label icon on the right side
                 *
                 * @memberof ButtonTag
                 */
                set iconclass_end(v: string) {
                    this.iconclass$ = v;
                }

                /**
                 * Setter: Set the text of the button
                 *
                 * Getter: Get the current button test
                 *
                 * @memberof ButtonTag
                 */
                set text(v: string | FormattedString) {
                    (this.refs.label as LabelTag).text = v;
                }

                get text(): string | FormattedString {
                    return (this.refs.label as LabelTag).text;
                }

                /**
                 * Setter: Enable or disable the button
                 *
                 * Getter: Get the `enable` property of the button
                 *
                 * @memberof ButtonTag
                 */
                set enable(v: boolean) {
                    $(this.refs.button).prop("disabled", !v);
                }
                get enable(): boolean {
                    return !$(this.refs.button).prop("disabled");
                }

                /**
                 * Setter: set or remove the attribute `selected` of the button
                 *
                 * Getter: check whether the attribute `selected` of the button is set
                 *
                 * @memberof ButtonTag
                 */
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

                /**
                 * Setter: activate or deactivate the toggle mode of the button
                 *
                 * Getter: Check whether the button is in toggle mode
                 *
                 * @memberof ButtonTag
                 */
                set toggle(v: boolean) {
                    this.attsw(v, "toggle");
                }
                get toggle(): boolean {
                    return this.hasattr("toggle");
                }

                /**
                 * Mount the tag
                 *
                 * @protected
                 * @memberof ButtonTag
                 */
                protected mount() {
                    $(this.refs.button).on("click", (e) => {
                        if (this.toggle) {
                            this.selected = !this.selected;
                        }
                        const evt: TagEventType<JQuery.MouseEventBase> = {
                            id: this.aid,
                            data: e,
                        };
                        this._onbtclick(evt);
                        this.observable.trigger("btclick", evt);
                    });
                }

                /**
                 *  Init the tag before mounting
                 *
                 * @protected
                 * @memberof ButtonTag
                 */
                protected init(): void {
                    this.enable = true;
                    this.toggle = false;
                    this._onbtclick = (e) => {};
                }

                /**
                 * Re-calibrate the button, do nothing in this tag
                 *
                 * @protected
                 * @memberof ButtonTag
                 */
                protected calibrate(): void {}

                /**
                 * Update the current tag, do nothing in this tag
                 *
                 * @param {*} [d]
                 * @memberof ButtonTag
                 */
                reload(d?: any): void {}

                /**
                 * Button layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof ButtonTag
                 */
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
