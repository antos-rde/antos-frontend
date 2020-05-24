/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
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

class AppearanceHandle extends SettingHandle {
    constructor(scheme, parent) {
        let v;
        super(scheme, parent);
        this.wplist = this.find("wplist");
        this.wpreview = this.find("wp-preview");
        this.wpsize = this.find("wpsize");
        this.wprepeat = this.find("wprepeat");
        this.themelist = this.find("theme-list");
        this.syswp = undefined;
        this.wplist.set("onlistselect", e => {
            const data = e.data.item.get("data");
            $(this.wpreview)
                .css("background-image", `url(${data.path.asFileHandle().getlink()})` )
                .css("background-size", "cover");
            this.parent.systemsetting.appearance.wp.url = data.path;
            return this.parent._gui.wallpaper();
        });

        this.wplist.set("buttons", [
            {
                text: "+", onbtclick: e => {
                    return this.parent.openDialog("FileDialog", {
                        title: __("Select image file"),
                        mimes: ["image/.*"]
                    }).then(d => {
                        this.parent.systemsetting.appearance.wps.push(d.file.path);
                        return this.wplist.set("data", this.getwplist());
                    });
                }
            }
        ]);
        
        this.wpsize.set("onlistselect", e => {
            this.parent.systemsetting.appearance.wp.size = e.data.item.get("data").text;
            return this.parent._gui.wallpaper();
        });

        const sizes = [
            { text: "cover", selected: this.parent.systemsetting.appearance.wp.size === "cover" },
            { text: "auto", selected: this.parent.systemsetting.appearance.wp.size === "auto" },
            { text: "contain", selected: this.parent.systemsetting.appearance.wp.size === "contain" }
        ];
        this.wpsize.set("data", sizes);
        
        const repeats = [
            { text: "repeat", selected: this.parent.systemsetting.appearance.wp.repeat === "repeat" },
            { text: "repeat-x", selected: this.parent.systemsetting.appearance.wp.repeat === "repeat-x" },
            { text: "repeat-y", selected: this.parent.systemsetting.appearance.wp.repeat === "repeat-y" },
            { text: "no-repeat", selected: this.parent.systemsetting.appearance.wp.repeat === "no-repeat" }
        ];
        this.wprepeat.set("onlistselect", e => {
            this.parent.systemsetting.appearance.wp.repeat = e.data.item.get("data").text;
            return this.parent._gui.wallpaper();
        });
        this.wprepeat.set("data", repeats);
        const currtheme = this.parent.systemsetting.appearance.theme;
        for (v of Array.from(this.parent.systemsetting.appearance.themes)) { v.selected = v.name === currtheme; }
        this.themelist.set("data" , this.parent.systemsetting.appearance.themes);
        this.themelist.set("onlistselect", e => {
            let data;
            if (e && e.data) { data = e.data.item.get("data"); }
            if (!data) { return; }
            if (data.name === this.parent.systemsetting.appearance.theme) { return; }
            this.parent.systemsetting.appearance.theme = data.name;
            return this.parent._gui.loadTheme(data.name, true);
        });
        if (!this.syswp) {
            const path = "os://resources/themes/system/wp";
            path.asFileHandle().read()
                .then(d => {
                    if (d.error) { return this.parent.error(__("Cannot read wallpaper list from {0}", path)); }
                    for (v of Array.from(d.result)) {
                        v.text = v.filename;
                        v.iconclass = "fa fa-file-image-o";
                    }
                    this.syswp = d.result;
                    return this.wplist.set("data", this.getwplist());
            }).catch(e => this.parent.error(__("Unable to read: {0}", path), e));
        } else {
            
            this.wplist.set("data", this.getwplist());
        }
    }
    
    getwplist() {
        let v;
        let list = [];
        for (v of Array.from(this.parent.systemsetting.appearance.wps)) {
            const file = v.asFileHandle();
            list.push({
                text: file.basename,
                path: file.path,
                selected: file.path === this.parent.systemsetting.appearance.wp.url,
                iconclass: "fa fa-file-image-o"
            });
        }
        list = list.concat(this.syswp);
        for (v of Array.from(list)) { v.selected = v.path === this.parent.systemsetting.appearance.wp.url; }
        return list;
    }
}