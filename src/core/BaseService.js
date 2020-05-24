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

class BaseService extends this.OS.GUI.BaseModel {
    constructor(name, args) {
        super(name, args);
        this.icon = undefined;
        this.iconclass = "fa-paper-plane-o";
        this.text = "";
        this.timer = undefined;
        this.holder = undefined;
        this.onmenuselect = d => {
            return this.awake(d);
        };
    }

    init(){}
        //implement by user
        // event registe, etc
        // scheme loader
    
    update() {
        return this.domel.set("data", this);
    }

    meta() {
        return Ant.OS.APP[this.name].meta;
    }
    attach(h) {
        return this.holder = h;
    }
    
    watch( t, f) {
        var func = () => {
            f();
            return this.timer = setTimeout((() => func()), t);
        };
        return func();
    }
    onexit(evt) {
        if (this.timer) { console.log("clean timer"); }
        if (this.timer) { clearTimeout(this.timer); }
        this.cleanup(evt);
        if (this.scheme) { return ($(this.scheme)).remove(); }
    }
        
    main() {}
    show() {}
    awake(e) {}
        //implement by user to tart the service
    cleanup(evt) {}
}
        //implemeted by user
BaseService.type = 2;
BaseService.singleton = true;
this.OS.GUI.BaseService = BaseService;