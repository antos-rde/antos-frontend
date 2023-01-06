namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * A stack pannel allows to navigate back and forth between pannels
             * (container widget). Each container widget  in the stack should be
             * composed inside a [[HBoxTag]]
             *
             *
             * @export
             * @class StackPanelTag
             * @extends {AFXTag}
             */
            export class StackPanelTag extends TabContainerTag {
                private _current_pannel_index: number;
                /**
                 * Mount the tag and bind basic events
                 *
                 * @protected
                 * @memberof StackPanelTag
                 */
                protected mount(): void {
                    this._current_pannel_index = -1;
                    super.mount();
                    this.observable.one("mounted", (id) => {
                        this.tabbarheight = 0;
                        $(this.refs.bar).hide();
                        this.navigateNext();
                    });
                }

                /**
                 * Set the tab select event handle
                 *
                 * @memberof StackPanelTag
                 */
                set ontabselect(f: TagEventCallback<TabContainerTabType>) {
                }
                /**
                 * Navigate to the next panel
                 *
                 * @memberof StackPanelTag
                 */
                navigateNext(): void
                {
                    if(this._current_pannel_index >= this.tabs.length)
                        return;
                    this._current_pannel_index++;
                    this.navigate();
                }
                 /**
                 * Navigate back to the previous panel
                 *
                 * @memberof StackPanelTag
                 */
                navigateBack(): void
                {
                    if(this._current_pannel_index <= 0)
                        return;
                    this._current_pannel_index--;
                    this.navigate()
                }
                /**
                 * Navigate to a custom panel
                 *
                 * @memberof StackPanelTag
                 */
                private navigate()
                {
                    this.selectedIndex = this._current_pannel_index;
                }
            }
            define("afx-stack-panel", StackPanelTag);
        }
    }
}