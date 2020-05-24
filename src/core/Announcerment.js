/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
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
class Announcer {
    constructor() {
        this.observable = {};
        this.enable = true;
    }
    
    disable() {
        this.off("*");
        return this.enable = false;
    }

    on(evtName, callback) {
        if (!this.enable) { return; }
        if (!this.observable[evtName]) { this.observable[evtName] = { one: new Set(), many: new Set() }; }
        return this.observable[evtName].many.add(callback);
    }

    one(evtName, callback) {
        if (!this.enable) { return; }
        if (!this.observable[evtName]) { this.observable[evtName] = { one: new Set(), many: new Set() }; }
        return this.observable[evtName].one.add(callback);
    }

    off(evtName, callback) {
        const fn = (evt, cb) => {
            if (!this.observable[evt]) { return; }
            if (cb) {
                this.observable[evt].one.delete(cb);
                return this.observable[evt].many.delete(cb);
            } else {
                if (this.observable[evt]) { return delete this.observable[evt]; }
            }
        };
        if (evtName === "*") { return (() => {
            const result = [];
            for (let k in this.observable) {
                const v = this.observable[k];
                result.push(fn(k, callback));
            }
            return result;
        })(); } else { return fn(evtName, callback); }
    }
   
    trigger(evtName, data) {
        const trig = (name, d) => {
            const names = [name, "*"];
            return (() => {
                const result = [];
                for (let evt of Array.from(names)) {
                    if (!this.observable[evt]) { continue; }
                    this.observable[evt].one.forEach(f => f(d));
                    this.observable[evt].one = new Set();
                    result.push(this.observable[evt].many.forEach(f => f(d)));
                }
                return result;
            })();
        };
        
        if (evtName === "*") {
            return (() => {
                const result = [];
                for (let k in this.observable) {
                    const v = this.observable[k];
                    if (k !== "*") {
                        result.push(trig(k, data));
                    }
                }
                return result;
            })();
        } else {
            return trig(evtName, data);
        }
    }
}

Ant.OS.API.Announcer = Announcer;
Ant.OS.announcer = {
        observable: new Ant.OS.API.Announcer(),
        quota: 0,
        listeners: {},
        on(e, f, a) {
            if (!Ant.OS.announcer.listeners[a.pid]) { Ant.OS.announcer.listeners[a.pid] = []; }
            Ant.OS.announcer.listeners[a.pid].push({ e, f });
            return Ant.OS.announcer.observable.on(e, f);
        },
        trigger(e, d) { return Ant.OS.announcer.observable.trigger(e, d); },
        osfail(m, e) {
            return Ant.OS.announcer.ostrigger("fail", { m,  e });
        },
        oserror(m, e) {
            return Ant.OS.announcer.ostrigger("error", { m,  e });
        },
        osinfo(m) {
            return Ant.OS.announcer.ostrigger("info", { m,  e: null });
        },
        ostrigger(e, d) {
            return Ant.OS.announcer.trigger(e, { id: 0, data: d, name: "OS" });
        },
        unregister(app) {
            if (!Ant.OS.announcer.listeners[app.pid] || !(Ant.OS.announcer.listeners[app.pid].length > 0)) { return; }
            for (let i of Array.from(Ant.OS.announcer.listeners[app.pid])) { Ant.OS.announcer.observable.off(i.e, i.f); }
            return delete Ant.OS.announcer.listeners[app.pid];
        },
            // Ant.OS.announcer.listeners[app.pid]
        getMID() {
            Ant.OS.announcer.quota += 1;
            return Ant.OS.announcer.quota;
        }
    };