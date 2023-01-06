/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             *
             *
             * @class BugListItemTag
             * @extends {ListViewItemTag}
             */
            class BugListItemTag extends ListViewItemTag {
                /**
                 *Creates an instance of BugListItemTag.
                 * @memberof BugListItemTag
                 */
                constructor() {
                    super();
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof BugListItemTag
                 */
                protected init(): void {}

                /**
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof BugListItemTag
                 */
                protected reload(d?: any): void {}

                /**
                 *
                 *
                 * @protected
                 * @returns {void}
                 * @memberof BugListItemTag
                 */
                protected ondatachange(): void {
                    if (!this.data) {
                        return;
                    }
                    const etag = this.refs.error as LabelTag;
                    const ttag = this.refs.time as LabelTag;
                    etag.text = this.data.text;
                    ttag.text = this.data.time;
                    if (this.data.icon) {
                        etag.icon = this.data.icon;
                    }
                    if (!this.data.icon) {
                        etag.iconclass = this.data.iconclass
                            ? this.data.iconclass
                            : "fa fa-bug";
                    }
                    this.closable = this.data.closable;
                }

                /**
                 *
                 *
                 * @protected
                 * @returns
                 * @memberof BugListItemTag
                 */
                protected itemlayout() {
                    return {
                        el: "div",
                        children: [
                            {
                                el: "afx-label",
                                ref: "error",
                                class: "afx-bug-list-item-error",
                            },
                            {
                                el: "afx-label",
                                ref: "time",
                                class: "afx-bug-list-item-time",
                            },
                        ],
                    };
                }
            }
            define("afx-bug-list-item", BugListItemTag);
        }
    }
    const template = `\
{0}
Log type: {1}
Log time: {2}
Process: {3} ({4})
detail:

{5}\
`;
    export namespace application {
        import TAG = GUI.tag;

        /**
         *
         *
         * @export
         * @class SystemReport
         * @extends {BaseApplication}
         */
        export class SystemReport extends BaseApplication {
            private loglist: TAG.ListViewTag;
            private logdetail: HTMLElement;
            private srv: PushNotification;
            constructor(args: AppArgumentsType[]) {
                super("SystemReport", args);
            }

            /**
             *
             *
             * @memberof SystemReport
             */
            /**
             *
             *
             * @memberof SystemReport
             */
            main(): void {
                this.loglist = this.find("loglist") as TAG.ListViewTag;
                this.logdetail = this.find("logdetail");

                this._gui
                    .pushService("SystemServices/PushNotification")
                    .then((srv) => {

                        this.srv = srv as PushNotification;
                        if (this.srv && this.srv.logs) {
                            this.loglist.data = this.srv.logs;
                        }
                        this.srv.logmon = this;
                    })
                    .catch((e) => {
                        this.error(
                            __("Unable to load push notification service"),
                            e
                        );
                        this.quit(false);
                    });

                $(this.find("txturi")).val(Ant.OS.setting.system.error_report);
                this.loglist.onlistselect = (e) => {
                    let data;
                    if (e && e.data) {
                        data = e.data.item.data;
                    }
                    if (!data) {
                        return;
                    }
                    let stacktrace = "None";
                    if (data.error) {
                        stacktrace = data.error.stack;
                    }
                    $(this.logdetail).text(
                        template.format(
                            data.text,
                            data.type,
                            data.time,
                            data.name,
                            data.id,
                            stacktrace
                        )
                    );
                };

                this.loglist.onitemclose = (e) => {
                    let el: TAG.ListViewItemTag;
                    if (e && e.data) {
                        el = e.data.item;
                    }
                    if (!el) {
                        return true;
                    }
                    const data = el.data;
                    if (!data.selected) {
                        return true;
                    }
                    $(this.logdetail).text("");
                    return true;
                };
                const bt = this.find("btnreport") as TAG.ButtonTag;
                bt.onbtclick = async (e) => {
                    const uri = $(this.find("txturi")).val();
                    if (uri === "") {
                        return;
                    }
                    const el = this.loglist.selectedItem;
                    if (!el) {
                        return;
                    }
                    const data = el.data;
                    if (!data) {
                        return;
                    }
                    try {
                        const d = await Ant.OS.API.post(uri as string, data);
                        return this.notify(__("Error reported"));
                    } catch (e) {
                        return this.notify(
                            __("Unable to report error: {0}", e.toString())
                        );
                    }
                };

                (this.find("btclean") as TAG.ButtonTag).onbtclick = (e) => {
                    if (!this.srv) {
                        return;
                    }
                    this.srv.logs = [];
                    this.loglist.data = this.srv.logs;
                    return $(this.logdetail).text("");
                };
            }

            /**
             *
             *
             * @param {GenericObject<any>} log
             * @memberof SystemReport
             */
            addLog(log: GenericObject<any>): void {
                this.loglist.push(log);
            }

            /**
             *
             *
             * @returns {void}
             * @memberof SystemReport
             */
            cleanup(): void {
                if (this.srv) {
                    return (this.srv.logmon = undefined);
                }
            }
        }

        SystemReport.singleton = true;
    }
}
