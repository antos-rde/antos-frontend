// Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

// AnTOS Web desktop is is licensed under the GNU General Public
// License v3.0, see the LICENCE file for more information

// This program is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as
// published by the Free Software Foundation, either version 3 of
// the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.

// You should have received a copy of the GNU General Public License
//along with this program. If not, see https://www.gnu.org/licenses/.

namespace OS {
    export namespace application {
        import TAG = GUI.tag;

        /**
         *
         *
         * @export
         * @class PushNotification
         * @extends {BaseService}
         */
        export class PushNotification extends BaseService {
            private cb: (e: JQuery.ClickEvent) => void;
            private view: boolean;
            private mlist: TAG.ListViewTag;
            private nzone: TAG.OverlayTag;

            logs: GenericObject<any>[];
            logmon: SystemReport;

            /**
             *Creates an instance of PushNotification.
             * @param {AppArgumentsType[]} args
             * @memberof PushNotification
             */
            constructor(args: AppArgumentsType[]) {
                super("PushNotification", args);
                this.iconclass = "fa fa-bars";
                this.cb = undefined;
                this.logs = [];
                this.text = __("Notification");
                this.logmon = undefined;
            }

            /**
             *
             *
             * @returns {void}
             * @memberof PushNotification
             */
            init(): void {
                this.view = false;
                return this._gui.htmlToScheme(scheme, this, this.host);
            }

            /**
             *
             *
             * @memberof PushNotification
             */
            main(): void {
                this.mlist = this.find("notifylist") as TAG.ListViewTag;
                this.nzone = this.find("notifyzone") as TAG.OverlayTag;
                (this.find("btclear") as TAG.ButtonTag).onbtclick = (e) =>
                    (this.mlist.data = []);
                (this.find("bterrlog") as TAG.ButtonTag).onbtclick = (e) =>
                    this.showLogReport();
                this.subscribe("notification", (o) => this.pushout("INFO", o));
                this.subscribe("fail", (o) => this.pushout("FAIL", o));
                this.subscribe("error", (o) => this.pushout("ERROR", o));
                this.subscribe("info", (o) => this.pushout("INFO", o));

                this.nzone.height = "100%";

                $(this.nzone)
                    .css("right", 0)
                    .css("top", "0")
                    .css("bottom", "0")
                    .hide();
            }

            /**
             *
             *
             * @private
             * @returns {void}
             * @memberof PushNotification
             */
            private showLogReport(): void {
                this._gui.launch("SystemReport", []);
            }

            /**
             *
             *
             * @private
             * @param {string} s
             * @param {API.AnnouncementDataType} o
             * @memberof PushNotification
             */
            private addLog(s: string, o: API.AnnouncementDataType<any>): void {
                const logtime = new Date();
                const log = {
                    type: s,
                    name: o.name,
                    text: `${o.message}`,
                    id: o.id,
                    icon: o.icon,
                    iconclass: o.iconclass,
                    error: o.u_data,
                    time: logtime,
                    closable: true,
                    tag: "afx-bug-list-item",
                };
                if (this.logmon) {
                    this.logmon.addLog(log);
                } else {
                    this.logs.push(log);
                }
            }

            /**
             *
             *
             * @private
             * @param {string} s
             * @param {API.AnnouncementDataType} o
             * @memberof PushNotification
             */
            private pushout(s: string, o: API.AnnouncementDataType<any>): void {
                const d = {
                    text: `[${s}] ${o.name} (${o.id}): ${o.message}`,
                    icon: o.icon,
                    iconclass: o.iconclass,
                    closable: true,
                };
                if (s !== "INFO") {
                    this.addLog(s, o);
                }
                this.mlist.unshift(d);
                this.notifeed(d);
            }

            /**
             *
             *
             * @private
             * @param {GenericObject<any>} d
             * @memberof PushNotification
             */
            private notifeed(d: GenericObject<any>): void {
                GUI.toast(d,{timeout: 3, location: GUI.ANCHOR.NORTH});
            }

            /**
             *
             *
             * @param {GUI.TagEventType} evt
             * @memberof PushNotification
             */
            awake(evt: GUI.TagEventType<GUI.tag.StackMenuEventData>): void {
                if (this.view) {
                    $(this.nzone).hide();
                } else {
                    $(this.nzone).show();
                }
                console.log(evt, evt.data.item.aid);
                this.view = !this.view;
                if (!this.cb) {
                    this.cb = (e) => {
                        const list_id = $(evt.data.item).attr("list-id");
                        console.log(e.target, list_id);
                        if (
                            !$(e.target).closest($(this.nzone)).length &&
                            !$(e.target).closest(`[list-id="${list_id}"]`).length
                            //!$(e.target).closest($(evt.data.item)).length
                        ) {
                            $(this.nzone).hide();
                            $(document).off("click", this.cb);
                            this.view = !this.view;
                        }
                    };
                }
                if (this.view) {
                    $(document).on("click", this.cb);
                } else {
                    $(document).off("click", this.cb);
                }
            }

            /**
             *
             *
             * @param {BaseEvent} evt
             * @memberof PushNotification
             */
            cleanup(evt: BaseEvent): void {}
        }
    }
    // do nothing
    const scheme = `\
<div>
    <afx-overlay data-id = "notifyzone" width = "250px">
        <afx-hbox data-height="35">
            <afx-button text = "__(Clear all)" data-id = "btclear" ></afx-button>
            <afx-button iconclass = "fa fa-bug" data-id = "bterrlog" data-width = "40"></afx-button>
        </afx-hbox>
        <afx-list-view data-id="notifylist"></afx-list-view>
    </afx-overlay>
</div>\
`;
}
