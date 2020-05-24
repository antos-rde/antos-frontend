/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Ant = this

class BugListItemTag extends this.OS.GUI.tag["afx-list-item-proto"] {
    constructor(r, o) {
        super(r, o);
    }
    
    __data__(v) {
        if (!v) { return; }
        this.refs.error.set("text", v.text);
        this.refs.time.set("text", v.time);
        if (v.icon) { this.refs.error.set("icon", v.icon); }
        if (!v.icon) {
            this.refs.error.set("iconclass", v.iconclass ? v.iconclass : "fa fa-bug");
        }
        return this.set("closable", v.closable);
    }

    __selected(v) {
        return this.get("data").selected = v;
    }


    itemlayout() {
        return {
            el: "div", children: [
                { el: "afx-label", ref: "error", class: "afx-bug-list-item-error" },
                { el: "afx-label", ref: "time", class: "afx-bug-list-item-time" }
            ]
        };
    }
}
        

this.OS.GUI.define("afx-bug-list-item", BugListItemTag);

class Syslog extends this.OS.GUI.BaseApplication {
    constructor(args) {
        super("Syslog", args);
    }

    main() {
        this.loglist = this.find("loglist");
        this.logdetail = this.find("logdetail");
        
        this._gui.pushService("Syslog/PushNotification")
            .then(srv => {
                this.srv = srv;
                if (this.srv && this.srv.logs) { this.loglist.set("data", this.srv.logs); }
                return this.srv.logmon = this;
        }).catch(e => {
                this.error(__("Unable to load push notification service"), e);
                return this.quit();
        });

        $(this.find("txturi")).val(Ant.OS.setting.system.error_report);
        this.loglist.set("onlistselect", e => {
            let data;
            if (e && e.data) { data = e.data.item.get("data"); }
            if (!data) { return; }
            let stacktrace = "None";
            if (data.error) { stacktrace = data.error.stack; }
            return $(this.logdetail).text(Syslog.template.format(
                data.text,
                data.type,
                data.time,
                data.name,
                data.id,
                stacktrace
            )
            );
        });
        this.loglist.set("onitemclose", e => {
            let el;
            if (e && e.data) { el = e.data.item; }
            if (!el) { return true; }
            const data = el.get("data");
            console.log(data);
            if (!data.selected) { return true; }
            $(this.logdetail).text("");
            return true;
        });

        this.find("btnreport").set("onbtclick", e => {
            const uri = $(this.find("txturi")).val();
            if (uri === "") { return; }
            const el = this.loglist.get("selectedItem");
            if (!el) { return; }
            const data = el.get("data");
            if (!data) { return; }
            return Ant.OS.API.post(uri, data)
                .then(d => {
                    return this.notify(__("Error reported"));
            }).catch(e => {
                    return this.notify(__("Unable to report error: {0}", e.toString()));
            });
        });

        return this.find("btclean").set("onbtclick", e => {
            if (!this.srv) { return; }
            this.srv.logs = [];
            this.loglist.set("data", this.srv.logs);
            return $(this.logdetail).text("");
        });
    }

    addLog(log) {
        return this.loglist.push(log);
    }
    
    cleanup() {
        if (this.srv) { return this.srv.logmon = undefined; }
    }
}

Syslog.template = `\
{0}
Log type: {1}
Log time: {2}
Process: {3} ({4})
detail:

{5}\
`;
Syslog.singleton = true;
this.OS.register("Syslog", Syslog);