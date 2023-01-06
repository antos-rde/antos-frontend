namespace OS {
    export namespace GUI {
        export namespace tag {
            
            /**
             * Toast notification tag
             *
             * @export
             * @class ToastNotificationTag
             * @extends {AFXTag}
             */
            export class ToastNotificationTag extends AFXTag {
                /**
                 *Creates an instance of ToastNotificationTag.
                 * @memberof ToastNotificationTag
                 */
                constructor() {
                    super();
                }

               
                /**
                 * Mount the tag
                 *
                 * @protected
                 * @memberof ToastNotificationTag
                 */
                protected mount() {
                    $(this.refs.header).on('click',(e) => {
                        $(this).remove();
                    })
                }

                /**
                 *  Init the tag before mounting
                 *
                 * @protected
                 * @memberof ToastNotificationTag
                 */
                protected init(): void {
                };

                /**
                 * Re-calibrate tag
                 *
                 * @protected
                 * @memberof ToastNotificationTag
                 */
                protected calibrate(): void {}

                /**
                 * Update the current tag, do nothing in this tag
                 *
                 * @param {*} [d]
                 * @memberof ToastNotificationTag
                 */
                reload(d?: any): void {}

                /**
                 * Tag layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof ToastNotificationTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        { 
                            el: "div", id: "toast_container", ref: "container",
                            children:[
                                {
                                    el: "div",
                                    ref: "header",
                                    id: "toast_header",
                                },
                                {
                                    el: "div",
                                    ref: "yield",
                                    id:"toast_content",
                                }
                            ]
                        }
                    ];
                }
            }


            /**
             * This tag manage all notification UI on the desktop
             *
             * @export
             * @class NotificationTag
             * @extends {AFXTag}
             */
            export class NotificationTag extends AFXTag {
                /**
                 *Creates an instance of NotificationTag.
                 * @memberof NotificationTag
                 */
                constructor() {
                    super();
                }

               
                /**
                 * Mount the tag
                 *
                 * @protected
                 * @memberof NotificationTag
                 */
                protected mount() {
                }

                /**
                 *  Init the tag before mounting
                 *
                 * @protected
                 * @memberof NotificationTag
                 */
                protected init(): void {
                };

                /**
                 * Push anotification to a specific location
                 * 
                 * @memberof NotificationTag
                 */
                push(tag: AFXTag, loc: ANCHOR = ANCHOR.NORTH): void
                {
                    if(!this.refs[loc])
                    {
                        return;
                    }
                    switch(loc)
                    {
                        case ANCHOR.NORTH:
                        case ANCHOR.NORTH_EST:
                        case ANCHOR.NORTH_WEST:
                            $(this.refs[loc]).prepend(tag);
                            break;
                        case ANCHOR.SOUTH:
                        case ANCHOR.SOUTH_EST:
                        case ANCHOR.SOUTH_WEST:
                            $(this.refs[loc]).append(tag);
                            break;
                        default: break;
                    }
                    this.calibrate();
                }
                /**
                 * Re-calibrate tag
                 *
                 * @protected
                 * @memberof NotificationTag
                 */
                protected calibrate(): void {}

                /**
                 * Update the current tag, do nothing in this tag
                 *
                 * @param {*} [d]
                 * @memberof NotificationTag
                 */
                reload(d?: any): void {}

                /**
                 * Tag layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof NotificationTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        { el: "div", id: "north", ref: "NORTH" },
                        { el: "div", id: "south", ref: "SOUTH" },
                        { el: "div", id: "north_west", ref: "NORTH_WEST" },
                        { el: "div", id: "south_west", ref: "SOUTH_WEST" },
                        { el: "div", id: "north_est", ref: "NORTH_EST" },
                        { el: "div", id: "south_est", ref: "SOUTH_EST" }
                    ];
                }
            }

            define("afx-notification", NotificationTag);
            define("afx-toast-notification", ToastNotificationTag);
        }
    }
}
