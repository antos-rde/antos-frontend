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
 self.OS.systemSetting = function(conf) {
    if (conf.desktop) { Ant.OS.setting.desktop = conf.desktop; }
    if (conf.applications) { Ant.OS.setting.applications = conf.applications; }
    if (conf.appearance) { Ant.OS.setting.appearance = conf.appearance; }
    if (!Ant.OS.setting.appearance.wp) { Ant.OS.setting.appearance.wp = {
        url: "os://resources/themes/system/wp/wp3.jpg",
        size: "cover",
        repeat: "repeat"
    }; }
    if (!Ant.OS.setting.appearance.wps) { Ant.OS.setting.appearance.wps = []; }
    if (!Ant.OS.setting.applications) { Ant.OS.setting.applications = {}; }
    Ant.OS.setting.user = conf.user;
    if (conf.VFS) { Ant.OS.setting.VFS = conf.VFS; }
    if (!Ant.OS.setting.desktop.path) { Ant.OS.setting.desktop.path = "home://.desktop"; }
    if (!Ant.OS.setting.desktop.menu) { Ant.OS.setting.desktop.menu = {}; }
    if (!Ant.OS.setting.VFS.mountpoints) { Ant.OS.setting.VFS.mountpoints = [
        //TODO: multi app try to write to this object, it neet to be cloned
        { text: "__(Applications)", path: 'app://', iconclass: "fa  fa-adn", type: "app" },
        { text: "__(Home)", path: 'home://', iconclass: "fa fa-home", type: "fs" },
        { text: "__(Desktop)", path: Ant.OS.setting.desktop.path , iconclass: "fa fa-desktop", type: "fs" },
        { text: "__(OS)", path: 'os://', iconclass: "fa fa-inbox", type: "fs" },
        { text: "__(Google Drive)", path: 'gdv://', iconclass: "fa fa-inbox", type: "fs" },
        { text: "__(Shared)", path: 'shared://' , iconclass: "fa fa-share-square", type: "fs" }
    ]; }

    if (conf.system) { Ant.OS.setting.system = conf.system; }
    if (!Ant.OS.setting.system.startup) { Ant.OS.setting.system.startup = {
        services: [
            "Syslog/PushNotification",
            "Syslog/Calendar"
        ],
        apps: []
    }; }
    if (!Ant.OS.setting.system.error_report) {
        Ant.OS.setting.system.error_report = "https://os.iohub.dev/report";
    }
    if (!Ant.OS.setting.system.pkgpaths) { Ant.OS.setting.system.pkgpaths = {
        user: "home://.packages",
        system: "os://packages"
     }; }
    if (!Ant.OS.setting.system.locale) { Ant.OS.setting.system.locale = "en_GB"; }
    if (!Ant.OS.setting.system.menu) { Ant.OS.setting.system.menu = {}; }
    if (!Ant.OS.setting.system.repositories) { Ant.OS.setting.system.repositories = []; }
    if (!Ant.OS.setting.appearance.theme) { Ant.OS.setting.appearance.theme = "antos_dark"; }
    if (!Ant.OS.setting.appearance.themes) {
        Ant.OS.setting.appearance.themes = [
            {
                text: "AntOS light",
                name: "antos_light"
            },
             {
                text: "AntOS dark",
                name: "antos_dark"
            }
        ];
    }
    if (!Ant.OS.setting.VFS.gdrive) { Ant.OS.setting.VFS.gdrive = {
        CLIENT_ID: "",
        API_KEY: "",
        apilink: "https://apis.google.com/js/api.js",
        DISCOVERY_DOCS: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        SCOPES: 'https://www.googleapis.com/auth/drive'
    }; }

        //search for app
    return Ant.OS.API.onsearch("__(Applications)", function(t) {
        const ar = [];
        const term = new RegExp(t, "i");
        for (let k in Ant.OS.setting.system.packages) {
            const v = Ant.OS.setting.system.packages[k];
            if (v.app) {var e, k1, v1;
            
                if ((v.name.match(term)) || (v.description && v.description.match(term))) {
                    v1 = {};
                    for (k1 in v) { e = v[k1]; if (k1 !== "selected") { v1[k1] = e; } }
                    v1.detail = [{ text: v1.path }];
                    v1.complex = true;
                    ar.push(v1);
                } else if (v.mimes) {
                    for (let m of Array.from(v.mimes)) {
                        if (t.match((new RegExp(m, "g")))) {
                            v1 = {};
                            for (k1 in v) { e = v[k1]; if (k1 !== "selected") { v1[k1] = v[k1]; } }
                            v1.detail = [{ text: v1.path }];
                            v1.complex = true;
                            ar.push(v1);
                            break;
                        }
                    }
                }
            }
        }
        return ar;
    });
};