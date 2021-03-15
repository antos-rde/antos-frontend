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
            private pending: number[];
            private cb: (e: JQuery.ClickEvent) => void;
            private view: boolean;
            private mlist: TAG.ListViewTag;
            private mfeed: TAG.ListViewTag;
            private nzone: TAG.OverlayTag;
            private fzone: TAG.OverlayTag;

            logs: GenericObject<any>[];
            logmon: Syslog;

            /**
             *Creates an instance of PushNotification.
             * @param {AppArgumentsType[]} args
             * @memberof PushNotification
             */
            constructor(args: AppArgumentsType[]) {
                super("PushNotification", args);
                this.iconclass = "fa fa-bars";
                this.cb = undefined;
                this.pending = [];
                this.logs = [];
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
             * @private
             * @param {boolean} b
             * @memberof PushNotification
             */
            private spin(b: boolean): void {
                if (b && this.iconclass === "fa fa-bars") {
                    this.iconclass = "fa fa-spinner fa-spin";
                    this.update();
                    $(this._gui.workspace).css("cursor", "wait");
                } else if (!b && this.iconclass === "fa fa-spinner fa-spin") {
                    this.iconclass = "fa fa-bars";
                    this.update();
                    $(this._gui.workspace).css("cursor", "auto");
                }
            }

            /**
             *
             *
             * @memberof PushNotification
             */
            main(): void {
                this.mlist = this.find("notifylist") as TAG.ListViewTag;
                this.mfeed = this.find("notifeed") as TAG.ListViewTag;
                this.nzone = this.find("notifyzone") as TAG.OverlayTag;
                this.fzone = this.find("feedzone") as TAG.OverlayTag;
                (this.find("btclear") as TAG.ButtonTag).onbtclick = (e) =>
                    (this.mlist.data = []);
                (this.find("bterrlog") as TAG.ButtonTag).onbtclick = (e) =>
                    this.showLogReport();
                this.subscribe("notification", (o) => this.pushout("INFO", o));
                this.subscribe("fail", (o) => this.pushout("FAIL", o));
                this.subscribe("error", (o) => this.pushout("ERROR", o));
                this.subscribe("info", (o) => this.pushout("INFO", o));

                this.subscribe("loading", (o) => {
                    this.pending.push(o.id);
                    return this.spin(true);
                });

                this.subscribe("loaded", (o) => {
                    const i = this.pending.indexOf(o.id);
                    if (i >= 0) {
                        this.pending.splice(i, 1);
                    }
                    if (this.pending.length === 0) {
                        return this.spin(false);
                    }
                });

                this.nzone.height = "100%";
                this.fzone.height = "100%";

                $(this.nzone)
                    .css("right", 0)
                    .css("top", "0")
                    .css("bottom", "0")
                    .hide();
                $(this.fzone)
                    //.css("z-index", 99999)
                    .css("bottom", "0")
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
                this._gui.launch("Syslog", []);
            }

            /**
             *
             *
             * @private
             * @param {string} s
             * @param {GenericObject<any>} o
             * @memberof PushNotification
             */
            private addLog(s: string, o: GenericObject<any>): void {
                const logtime = new Date();
                const log = {
                    type: s,
                    name: o.name,
                    text: `${o.data.m}`,
                    id: o.id,
                    icon: o.data.icon,
                    iconclass: o.data.iconclass,
                    error: o.data.e,
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
             * @param {GenericObject<any>} o
             * @memberof PushNotification
             */
            private pushout(s: string, o: GenericObject<any>): void {
                const d = {
                    text: `[${s}] ${o.name} (${o.id}): ${o.data.m}`,
                    icon: o.data.icon,
                    iconclass: o.data.iconclass,
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
                let timer: number;
                this.mfeed.unshift(d);
                $(this.fzone).show();
                timer = window.setTimeout(() => {
                    this.mfeed.delete(d.domel);
                    if (this.mfeed.data.length === 0) {
                        $(this.fzone).hide();
                    }
                    return clearTimeout(timer);
                }, 3000);
            }

            /**
             *
             *
             * @param {GUI.TagEventType} evt
             * @memberof PushNotification
             */
            awake(evt: GUI.TagEventType<GUI.tag.MenuEventData>): void {
                if (this.view) {
                    $(this.nzone).hide();
                } else {
                    $(this.nzone).show();
                }
                this.view = !this.view;
                if (!this.cb) {
                    this.cb = (e) => {
                        if (
                            !$(e.target).closest($(this.nzone)).length &&
                            !$(e.target).closest(evt.data.item).length
                        ) {
                            $(this.nzone).hide();
                            $(document).unbind("click", this.cb);
                            this.view = !this.view;
                        }
                    };
                }
                if (this.view) {
                    $(document).on("click", this.cb);
                } else {
                    $(document).unbind("click", this.cb);
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
        <afx-hbox data-height="30">
            <afx-button text = "__(Clear all)" data-id = "btclear" ></afx-button>
            <afx-button iconclass = "fa fa-bug" data-id = "bterrlog" data-width = "25"></afx-button>
        </afx-hbox>
        <afx-list-view data-id="notifylist"></afx-list-view>
    </afx-overlay>
    <afx-overlay data-id = "feedzone" width = "250">
        <afx-list-view data-id = "notifeed">
        </afx-list-view>
    </afx-overlay>
</div>\
`;
}
