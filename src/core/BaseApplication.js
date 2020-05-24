/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
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
class BaseApplication extends this.OS.GUI.BaseModel {
    constructor(name, args) {
        super(name, args);
        if ((!Ant.OS.setting.applications[this.name]) || (Array.isArray(OS.setting.applications[this.name]))) {
            Ant.OS.setting.applications[this.name] = {};
        }
        this.setting = Ant.OS.setting.applications[this.name];
        this.keycomb = {
            ALT: {},
            CTRL: {},
            SHIFT: {},
            META: {}
        };
    }
    init() {
        this.off("*");
        this.on("exit", () => this.quit());
        // first register some base event to the app
        this.on("focus", () => {
            this.sysdock.set("selectedApp", this);
            this.appmenu.pid = this.pid;
            this.appmenu.set("items", (this.baseMenu() || []));
            this.appmenu.set("onmenuselect", d => {
                return this.trigger("menuselect", d);
            });
            if (this.dialog) { return this.dialog.show(); }
        });
        this.on("hide", () => {
            this.sysdock.set("selectedApp", null);
            this.appmenu.set("items", []);
            if (this.dialog) { return this.dialog.hide(); }
        });
        this.on("menuselect", d => {
            switch (d.data.item.get("data").dataid) {
                case `${this.name}-about`: return this.openDialog("AboutDialog");
                case `${this.name}-exit`: return this.trigger("exit");
            }
        });
        this.on("apptitlechange", () => this.sysdock.update());
        this.updateLocale(this.systemsetting.system.locale);
        return this.loadScheme();
    }

    loadScheme() {
        //now load the scheme
        const path = `${this.meta().path}/scheme.html`;
        return this.render(path);
    }

    load(promise) {
        const q = this._api.mid();
        return new Promise((resolve, reject) => {
            this._api.loading(q, this.name);
            return promise.then(() => {
                this._api.loaded(q, this.name, "OK");
                return resolve();
        }).catch(e => {
                this._api.loaded(q, this.name, "FAIL");
                return reject(__e(e));
            });
        });
    }

    bindKey(k, f) {
        const arr = k.split("-");
        if (arr.length !== 2) { return; }
        const fnk = arr[0].toUpperCase();
        const c = arr[1].toUpperCase();
        if (!this.keycomb[fnk]) { return; }
        return this.keycomb[fnk][c] = f;
    }

    updateLocale(name) {
        const meta = this.meta();
        if (!meta || !meta.locales) { return; }
        if (!meta.locales[name]) { return; }
        return (() => {
            const result = [];
            for (let k in meta.locales[name]) {
                const v = meta.locales[name][k];
                result.push(this._api.lang[k] = v);
            }
            return result;
        })();
    }

    shortcut(fnk, c, e) {
        if (!this.keycomb[fnk]) { return true; }
        if (!this.keycomb[fnk][c]) { return true; }
        this.keycomb[fnk][c](e);
        return false;
    }
    
    applySetting(k) {}
    applyAllSetting() {
         return (() => {
             const result = [];
             for (let k in this.setting) {
                 const v = this.setting[k];
                 result.push(this.applySetting(k));
             }
             return result;
         })();
     }
    registry(k, v) {
        this.setting[k] = v;
        return this.publish("appregistry", k);
    }

    show() {
        return this.trigger("focus");
    }
    
    blur() {
        if (this.appmenu && (this.pid === this.appmenu.pid)) { this.appmenu.set("items", []); }
        return this.trigger("blur");
    }
    
    hide() {
        return this.trigger("hide");
    }
    
    toggle() {
        return this.trigger("toggle");
    }

    title() {
        return this.scheme.get("apptitle");
    }
        
    onexit(evt) {
        this.cleanup(evt);
        if (!evt.prevent) {
            if (this.pid === this.appmenu.pid) { this.appmenu.set("items", []); }
            return ($(this.scheme)).remove();
        }
    }
    meta() { return Ant.OS.APP[this.name].meta; }
    baseMenu() {
        let mn =
            [{
                text: Ant.OS.APP[this.name].meta.name,
                child: [
                    { text: "__(About)", dataid: `${this.name}-about` },
                    { text: "__(Exit)", dataid: `${this.name}-exit` }
                ]
            }];
        mn = mn.concat(this.menu() || []);
        return mn;
    }
            
    main() {}
        //main program
        // implement by subclasses
    menu() {
        // implement by subclasses
        // to add menu to application
        return [];
    }
    open() {}
        //implement by subclasses
    data() {}
        //implement by subclasses
        // to return app data
    
    cleanup(e) {}
}
        //implement by subclasses
        // to handle the exit event
        // use e.preventDefault() to
        // discard the quit command
BaseApplication.type = 1;
this.OS.GUI.BaseApplication = BaseApplication;