/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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

class PushNotification extends this.OS.GUI.BaseService {
    constructor(args) {
        super("PushNotification", args);
        this.iconclass = "fa fa-bars";
        this.cb = undefined;
        this.pending = [];
        this.logs = [];
        this.logmon = undefined;
    }
    init() {
        this.view = false;
        return this._gui.htmlToScheme(PushNotification.scheme, this, this.host);
    }

    spin(b) {
        if (b && (this.iconclass === "fa fa-bars")) {
            this.iconclass = "fa fa-spinner fa-spin";
            this.update();
            return $(this._gui.workspace).css("cursor", "wait");
        } else if (!b && (this.iconclass === "fa fa-spinner fa-spin")) {
            this.iconclass = "fa fa-bars";
            this.update();
            return $(this._gui.workspace).css("cursor", "auto");
        }
    }

    main() {
        this.mlist = this.find("notifylist");
        this.mfeed = this.find("notifeed");
        this.nzone = this.find("notifyzone");
        this.fzone = this.find("feedzone");
        (this.find("btclear")).set("onbtclick", e => this.mlist.set("data", []));
        (this.find("bterrlog")).set("onbtclick", e => this.showLogReport());
        this.subscribe("notification", o => this.pushout('INFO', o));
        this.subscribe("fail", o => this.pushout('FAIL', o));
        this.subscribe("error", o => this.pushout('ERROR', o));
        this.subscribe("info", o => this.pushout('INFO', o));
        

        this.subscribe("loading", o => {
            this.pending.push(o.id);
            return this.spin(true);
        });

        this.subscribe("loaded", o => {
            const i = this.pending.indexOf(o.id);
            if (i >= 0) { this.pending.splice(i, 1); }
            if (this.pending.length === 0) { return this.spin(false); }
        });
        
        this.nzone.set("height", "100%");
        this.fzone.set("height", "100%");

        ($(this.nzone)).css("right", 0)
            .css("top", "0")
            .css("bottom", "0")
            .hide();
        return ($(this.fzone))
            //.css("z-index", 99999)
            .css("bottom", "0")
            .css("bottom", "0")
            .hide();
    }

    showLogReport() {
        return this._gui.launch("Syslog");
    }

    addLog(s, o) {
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
            tag: "afx-bug-list-item"
        };
        if (this.logmon) {
            return this.logmon.addLog(log);
        } else {
            return this.logs.push(log);
        }
    }

    pushout(s, o) {
        const d = {
            text: `[${s}] ${o.name} (${o.id}): ${o.data.m}`,
            icon: o.data.icon,
            iconclass: o.data.iconclass,
            closable: true
        };
        if (s !== "INFO") { this.addLog(s, o); }
        this.mlist.unshift(d);
        return this.notifeed(d);
    }

    notifeed(d) {
        let timer;
        this.mfeed.unshift(d, true);
        ($(this.fzone)).show();
        return timer = setTimeout(() => {
                this.mfeed.remove(d.domel);
                if (this.mfeed.get("data").length === 0) { ($(this.fzone)).hide(); }
                return clearTimeout(timer);
            }
        , 3000);
    }

    awake(evt) {
        if  (this.view) { ($(this.nzone)).hide(); } else { ($(this.nzone)).show(); }
        this.view = !this.view;
        if (!this.cb) {
            this.cb = e => {
                if (!($(e.target)).closest($(this.nzone)).length && !($(e.target)).closest(evt.data.item).length) {
                    ($(this.nzone)).hide();
                    $(document).unbind("click", this.cb);
                    return this.view = !this.view;
                }
            };
        }
        if (this.view) {
            return $(document).on("click", this.cb);
        } else {
            return $(document).unbind("click", this.cb);
        }
    }
        
    cleanup(evt) {}
}
        // do nothing
PushNotification.scheme = `\
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
this.OS.register("PushNotification", PushNotification);