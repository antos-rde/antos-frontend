namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * This tag define a basic text input and its behavior
             *
             * @export
             * @class InputTag
             * @extends {AFXTag}
             */
            export class InputTag extends AFXTag {

                /**
                 *Creates an instance of InputTag.
                 * @memberof InputTag
                 */
                constructor() {
                    super();
                }

                /**
                 * Set the path to the header icon, the path should be
                 * a VFS file path
                 *
                 * @memberof InputTag
                 */
                set icon(v: string) {
                    $(this).attr("icon", v);
                    (this.refs.label as LabelTag).icon = v;
                }

                /**
                 * Set the icon class to the header
                 *
                 * @memberof InputTag
                 */
                set iconclass(v: string) {
                    $(this).attr("iconclass", v);
                    (this.refs.label as LabelTag).iconclass = v;
                }

                /**
                 * Alias to header setter/getter
                 *
                 * @memberof InputTag
                 */
                set text(v: string | FormattedString) {
                   this.label = v;
                }

                get text(): string | FormattedString {
                    return this.label;
                }

                /**
                 * Setter: Set the text of the label
                 *
                 * Getter: Get the current label test
                 *
                 * @memberof InputTag
                 */
                set label(v: string | FormattedString) {
                    (this.refs.label as LabelTag).text = v;
                }

                get label(): string | FormattedString {
                    return (this.refs.label as LabelTag).text;
                }

                /**
                 * Setter: Enable or disable the input
                 *
                 * Getter: Get the `enable` property of the input
                 *
                 * @memberof InputTag
                 */
                set disable(v: boolean) {
                    $(this.refs.area).prop("disabled", v);
                    $(this.refs.input).prop("disabled", v);
                }
                get disable(): boolean {
                    return !$(this.input).prop("disabled");
                }

                /**
                 * Setter: set verbosity of the input
                 *
                 * Getter: Get the  current input verbosity
                 *
                 * @memberof InputTag
                 */
                set verbose(v: boolean) {
                    this.attsw(v, "verbose");
                    this.calibrate();
                }
                get verbose(): boolean {
                    return this.hasattr("verbose");
                }                
                
                /**
                 * JQuery style generic event handling on the input element
                 * 
                 * @param {string} enname: JQuery event name
                 * @param {JQuery.TypeEventHandler<HTMLInputElement | HTMLTextAreaElement, unknown, any, any, string>} handle: JQuery handle
                 * @memberof InputTag
                 */
                on(ename: string, handle:JQuery.TypeEventHandler<HTMLInputElement | HTMLTextAreaElement, unknown, any, any, string> ): void
                {
                    $(this.input).on(ename, handle);
                }
                /**
                 * Manually trigger an event
                 * 
                 * @param {string} evt: JQuery event name
                 * @memberof InputTag
                 */
                trigger(evt: string)
                {
                    $(this.input).trigger(evt);
                }
                /**
                 * Mount the tag
                 *
                 * @protected
                 * @memberof InputTag
                 */
                protected mount() {
                    // Do nothing
                }
                /**
                 * Get the current active input element
                 * 
                 * @memberof InputTag
                 */
                get  input(): HTMLInputElement | HTMLTextAreaElement
                {
                    if(this.verbose)
                    {
                        return this.refs.area as HTMLTextAreaElement;
                    }
                    return this.refs.input as HTMLInputElement;
                }

                /**
                 * Get/set the current active input value
                 * 
                 * @memberof InputTag
                 */
                get value(): string{
                    return this.input.value;
                }
                set value(v: string)
                {
                    this.input.value = v;
                }
                /**
                 * Get/set input type
                 * This only affects the inline input element
                 * 
                 * @memberof InputTag
                 */
                get type(): string{
                    if(this.verbose) return undefined;

                    return (this.input as HTMLInputElement).type;
                }
                set type(v: string)
                {
                    if(!this.verbose)
                    {
                        (this.input as HTMLInputElement).type = v;
                    }
                }

                /**
                 * Get/set input name
                 * 
                 * @memberof InputTag
                 */
                get name(): string{
                    return (this.input as HTMLInputElement).name;
                }
                set name(v: string)
                {
                    (this.input as HTMLInputElement).name = v;
                }

                /**
                 *  Init the tag before mounting
                 *
                 * @protected
                 * @memberof InputTag
                 */
                protected init(): void {
                    this.disable = false;
                    this.verbose = false;
                    this.type = "text";
                }

                /**
                 * Re-calibrate, do nothing in this tag
                 *
                 * @protected
                 * @memberof InputTag
                 */
                protected calibrate(): void
                {
                    /*$(this.refs.area)
                        .css("width", "100%");
                    $(this.refs.input)
                        .css("width", "100%");*/
                    if(this.verbose)
                    {
                        $(this.refs.area).show();
                        $(this.refs.input).hide();
                        (this.refs.input as HTMLInputElement).value = "";
                    }
                    else
                    {
                        $(this.refs.area).hide();
                        $(this.refs.input).show();
                        (this.refs.area as HTMLTextAreaElement).value = "";
                    }
                }

                /**
                 * Update the current tag, do nothing in this tag
                 *
                 * @param {*} [d]
                 * @memberof InputTag
                 */
                reload(d?: any): void {}

                /**
                 * Input layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof InputTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "afx-label",
                            ref: "label"
                        },
                        {
                            el: "input",
                            ref:"input"
                        },
                        {
                            el: "textarea",
                            ref: "area"
                        },
                        {
                            el: "div"
                        }
                    ];
                }
            }

            define("afx-input", InputTag);
        }
    }
}
