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

class BaseModel {
    constructor(name, args) {
        this.name = name;
        this.args = args;
        this.observable = new Announcer();
        this._api = Ant.OS.API;
        this._gui = Ant.OS.GUI;
        this.systemsetting = Ant.OS.setting;
        this.on("exit", () => this.quit());
        this.host = this._gui.workspace;
        this.dialog = undefined;
    }
    
    render(p) {
        return Ant.OS.GUI.loadScheme(p, this, this.host);
    }

    quit(force) {
        const evt = new Ant.OS.GUI.BaseEvent("exit", force);
        this.onexit(evt);
        if (!evt.prevent) {
            this.observable.off("*");
            delete this.observable;
            if (this.dialog) { this.dialog.quit(); }
            return Ant.OS.PM.kill(this);
        }
    }

    path() {
        const mt = this.meta();
        if (mt && mt.path) { return mt.path; }
        return null;
    }
    
    // call a server side script
    call(cmd, func) {
        return this._api.apigateway(cmd, false, func);
    }
    
    // get a stream
    stream() {
        return this._api.apigateway(null, true, null);
    }

    init() {}
        //implement by sub class
    onexit(e) {}
        //implement by subclass
   
    one(e, f) { return this.observable.one(e, f); }
    on(e, f) { return this.observable.on(e, f); }
    off(e, f) {
        if (!f) { return this.observable.off(e); }
        return this.observable.off(e, f);
    }
    trigger(e, d) { return this.observable.trigger(e, d); }

    subscribe(e, f) {
        return Ant.OS.announcer.on(e, f, this);
    }

    openDialog(d, data) {
        return new Promise((resolve, reject) => {
            if (this.dialog) {
                this.dialog.show();
                return;
            }
            if (typeof d === "string") {
                if (!Ant.OS.GUI.subwindows[d]) {
                    this.error(__("Dialog {0} not found", d));
                    return;
                }
                this.dialog = new (Ant.OS.GUI.subwindows[d])();
            } else {
                this.dialog = d;
            }
            //@dialog.observable = riot.observable() unless @dialog
            this.dialog.parent = this;
            this.dialog.handle = resolve;
            this.dialog.reject = reject;
            this.dialog.pid = this.pid;
            this.dialog.data = data;
            if (data && data.title) { this.dialog.title = data.title; }
            return this.dialog.init();
        });
    }

    ask(data) {
        return this._gui.openDialog("YesNoDialog", data);
    }
    
    publish(t, m, e) {
        const mt = this.meta();
        let icon = undefined;
        if (mt.icon) { icon = `${mt.path}/${mt.icon}`; }
        return Ant.OS.announcer.trigger(t, {
            id: this.pid,
            name: this.name,
            data: {
                m,
                icon,
                iconclass: mt.iconclass,
                e
            }
        });
    }

    notify(m) {
        return this.publish("notification", m);
    }

    warn(m) {
        return this.publish("warning", m);
    }

    error(m, e) {
        return this.publish("error", m, e ? e : (this._api.throwe(m)));
    }
        
    fail(m) {
        return this.publish("fail", m);
    }

    throwe() {
        return this._api.throwe(this.name);
    }
    
    update() {
        if (this.scheme) { return this.scheme.update(); }
    }
        
    find(id) { if (this.scheme) { return ($(`[data-id='${id}']`, this.scheme))[0]; } }
    
    select(sel) { if (this.scheme) { return $(sel, this.scheme); } }
}
this.OS.GUI.BaseModel = BaseModel;