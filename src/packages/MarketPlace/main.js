/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
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

class MarketPlace extends this.OS.GUI.BaseApplication {
    constructor(args) {
        super("MarketPlace", args);
    }
    
    main() {
        this.installdir = this.systemsetting.system.pkgpaths.user;
        // test repository
        this.apps_meta = [];
        this.repo = this.find("repo");
        this.repo.set("onlistselect", e => {
            const data = e.data.item.get("data");
            if (!data) { return; }
            return this.fetchApps(data);
        });
        
        this.refreshRepoList();
        
        this.applist = this.find("applist");
        this.applist.set("onlistselect", e => {
            const data = e.data.item.get("data");
            return this.appDetail(data);
        });

        this.container =  this.find("container");
        this.appname = this.find("appname");
        this.appdesc = this.find("app-desc");
        this.appdetail = this.find("app-detail");
        this.btinstall = this.find("bt-install");
        this.btremove = this.find("bt-remove");
        this.btexec = this.find("bt-exec");
        this.searchbox = this.find("searchbox");
        ($(this.container)).css("visibility", "hidden");
        this.btexec.set("onbtclick", e => {
            const el = this.applist.get("selectedItem");
            if (!el) { return; }
            const app = el.get("data");
            if (app.pkgname) { return this._gui.launch(app.pkgname); }
        });

        this.btinstall.set("onbtclick", e => {
            if (this.btinstall.get("dirty")) {
                return this.updatePackage()
                    .then(() => this.notify(__("Package updated")))
                    .catch(e => this.error(e.toString(), e));
            }
            return this.remoteInstall()
                .then(n => this.notify(__("Package installed: {0}", n)))
                .catch(e => this.error(e.toString(), e));
        });

        this.btremove.set("onbtclick", e => {
            return this.uninstall()
                .then(() => this.notify(__("Packaged uninstalled")))
                .catch(e => this.error(e.toString(), e));
        });

        this.bindKey("CTRL-R", () => {
            return this.menuOptionsHandle("repos");
        });
        
        return $(this.searchbox).keyup(e => this.search(e));
    }

    refreshRepoList() {
        const list = (Array.from(this.systemsetting.system.repositories));
        list.unshift({
            text: "Installed"
        });
        return this.repo.set("data", list);
    }

    search(e) {
        let v;
        switch (e.which) {
            case 37:
                return e.preventDefault();
            case 38:
                this.applist.selectPrev();
                return e.preventDefault();
            case 39:
                return e.preventDefault();
            case 40:
                this.applist.selectNext();
                return e.preventDefault();
            case 13:
                return e.preventDefault();
            default:
                var text = this.searchbox.value;
                if (text.length === 2) { this.applist.set("data", ((() => {
                    const result1 = [];
                    for (v of Array.from(this.apps_meta)) {                         result1.push(v);
                    }
                    return result1;
                })())); }
                if (text.length < 3) { return; }
                var result = [];
                var term = new RegExp(text, 'i');
                for (v of Array.from(this.apps_meta)) { if (v.text.match(term)) { result.push(v); } }
                return this.applist.set("data", result);
        }
    }


    fetchApps(data) {
        let v;
        if (!data.url) {
            const pkgcache = this.systemsetting.system.packages;
            const list = [];
            for (let k in pkgcache) {
                v = pkgcache[k];
                list.push({
                    pkgname: v.pkgname ? v.pkgname : v.app,
                    name: v.name,
                    text: v.name,
                    icon: v.icon,
                    iconclass: v.iconclass,
                    category: v.category,
                    author: v.info.author,
                    version: v.version,
                    description: `${v.path}/REAME.md`
                });
            }
            this.apps_meta = list;
            this.applist.set("data", list);
            return;
        }
        
        return this._api.get((data.url + "?_=" + (new Date().getTime())) , "json")
            .then(d => {
                for (v of Array.from(d)) {
                    v.text = v.name;
                    v.iconclass = "fa fa-adn";
                }
                this.apps_meta = d;
                return this.applist.set("data", d);
        }).catch(e => {
                return this.error(__("Fail to fetch packages list from: {0}", data.url), e);
        });
    }

    appDetail(d) {
        ($(this.container)).css("visibility", "visible");
        ( $(this.appname) ).html(d.name);
        (this.find("vstat")).set("text", "");
        if (d.description) {
            d.description.asFileHandle().read().then(text => {
                const converter = new showdown.Converter();
                return ($(this.appdesc)).html(converter.makeHtml(text));
        }).catch(e => {
                this.notify(__("Unable to read package description"));
                return ($(this.appdesc)).empty();
            });
        } else {
            ($(this.appdesc)).empty();
        }
        const pkgcache = this.systemsetting.system.packages;
        this.btinstall.set("text", "__(Install)");
        this.btinstall.set("dirty", false);
        if (pkgcache[d.pkgname]) {
            let vs = pkgcache[d.pkgname].version;
            let ovs = d.version;
            ($(this.btinstall)).hide();
            if (vs && ovs) {
                vs = vs.__v();
                ovs = ovs.__v();
                if (ovs.nt(vs)) {
                    this.btinstall.set("dirty", true);
                    this.btinstall.set("text", "__(Update)");
                    ($(this.btinstall)).show();
                    (this.find("vstat")).set("text",
                        __("Your application version is older ({0} < {1})", vs, ovs));
                }
            }
            ($(this.btremove)).show();
            ($(this.btexec)).show();
        } else {
            ($(this.btinstall)).show();
            ($(this.btremove)).hide();
            ($(this.btexec)).hide();
        }
      
        ($(this.appdetail)).empty();
        return (() => {
            const result = [];
            for (let k in d) {
                const v = d[k];
                if ((k !== "name") && (k !== "description") && (k !== "domel")) {
                    result.push(($(this.appdetail)).append(
                        $("<li>")
                            .append(($("<span class= 'info-header'>")).html(k))
                            .append($("<span>").html(v))
                    ));
                }
            }
            return result;
        })();
    }
    
    menu() {
        return [
            {
                text: "__(Options)", child: [
                    { text: "__(Repositories)", shortcut: "C-R", id: "repos" },
                    { text: "__(Install from zip)", shortcut: "C-I", id: "install" }
                ] , onchildselect: e => {
                    return this.menuOptionsHandle(e.data.item.get("data").id);
                }
            }
        ];
    }
    
    menuOptionsHandle(id) {
        switch (id) {
            case "repos":
                return this.openDialog(new RepositoryDialog(), {
                    title: __("Repositories"),
                    data: this.systemsetting.system.repositories
                });
            case "install":
                return this.localInstall().then(n => {
                    return this.notify(__("Package installed: {0}", n));
            }).catch(e => this.error(__("Unable to install package"), e));
            default:
        }
    }

    remoteInstall() {
        const el = this.applist.get("selectedItem");
        if (!el) { return; }
        const app = el.get("data");
        if (!app) { return; }
        // get blob file
        return new Promise((resolve, reject) => {
            return this._api.blob(app.download + "?_=" + (new Date().getTime()))
            .then(data => {
                return this.install(data, app)
                    .then(n => resolve(n))
                    .catch(e => reject(__e(e)));
        }).catch(e => reject(__e(e)));
        });
    }

    localInstall() {
        return new Promise((resolve, reject) => {
            return this.openDialog("FileDialog", {
                title: "__(Select package archive)",
                mimes: [".*/zip"]
            }).then(d => {
                return d.file.path.asFileHandle().read("binary").then(data => {
                    return this.install(data)
                        .then(n => {
                            this.repo.unselect();
                            this.repo.set("selected", 0);
                            const apps = (Array.from(this.applist.get("data")).map((v) => v.pkgname));
                            const idx = apps.indexOf(n);
                            if (idx >= 0) {
                                this.applist.set("selected", idx);
                            }
                            return resolve(n);
                    }).catch(e => reject(__e(e)))
                    .catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
            });
        });
    }

    install(data, meta) {
        return new Promise((resolve, reject) => {
            return JSZip.loadAsync(data).then(zip => {
                return zip.file("package.json").async("string").then(d => {
                    let name;
                    const v = JSON.parse(d);
                    const pth = `${this.installdir}/${v.app}`;
                    const dir = [pth];
                    const files = [];
                    for (name in zip.files) {
                        const file = zip.files[name];
                        if (file.dir) {
                            dir.push(pth + "/" + name);
                        } else {
                            files.push(name);
                        }
                    }
                    // create all directory
                    return this.mkdirs(dir).then(() => {
                        return this.installFile(v.app, zip, files).then(() => {
                            const app_meta = {
                                pkgname: v.app,
                                name: v.name,
                                text: v.name,
                                icon: v.icon,
                                iconclass: v.iconclass,
                                category: v.category,
                                author: v.info.author,
                                version: v.version,
                                description: meta ? meta.description : undefined,
                                download: meta ? meta.download : undefined
                            };
                            v.text = v.name;
                            v.filename = v.app;
                            v.type = "app";
                            v.mime = "antos/app";
                            if (!v.iconclass && !v.icon) { v.iconclass = "fa fa-adn"; }
                            v.path = pth;
                            this.systemsetting.system.packages[v.app] = v;
                            this.appDetail(app_meta);
                            return resolve(v.name);
                    }).catch(e => reject(__e(e)));
                }).catch(e => reject(__e(e)));
            }).catch(err => reject(__e(err)));
        }).catch(e => reject(__e(e)));
        });
    }

    uninstall() {
        return new Promise((resolve, reject) => {
            const el = this.applist.get("selectedItem");
            if (!el) { return; }
            const sel = el.get("data");
            if (!sel) { return; }
            const name = sel.pkgname;
            const app = this.systemsetting.system.packages[sel.pkgname];
            if (!app) { return; }
            return this.openDialog("YesNoDialog", {
                title: __("Uninstall") ,
                text: __("Uninstall: {0}?", app.name)
            }).then(d => {
                if (!d) { return; }
                return app.path.asFileHandle().remove().then(r => {
                    if (r.error) {
                        return reject(this._api.throwe(__("Cannot uninstall package: {0}", r.error)));
                    }
                    this.notify(__("Package uninstalled"));
                    // stop all the services if any
                    if (app.services) {
                        for (let srv of Array.from(app.services)) {
                            this._gui.unloadApp(srv);
                        }
                    }
                            
                    delete this.systemsetting.system.packages[name];
                    this._gui.unloadApp(name);
                    if (sel.download) {
                        this.appDetail(sel);
                    } else {
                        this.applist.remove(el);
                        ($(this.container)).css("visibility", "hidden");
                    }
                    return resolve();
            }).catch(e => reject(__e(e)));
        }).catch(e => reject(__e(e)));
        });
    }
    
    updatePackage() {
        return new Promise((resolve, reject) => {
            return this.uninstall().then(() => {
                return this.remoteInstall()
                    .then(() => resolve())
                    .catch(e => reject(__e(e)));
        }).catch(e => reject(__e(e)));
        });
    }

    mkdirs(list) {
        return new Promise((resolve, reject) => {
            if (list.length === 0) { return resolve(); }
            const dir = (list.splice(0, 1))[0].asFileHandle();
            const path = dir.parent();
            const dname = dir.basename;
            return path.asFileHandle().mk(dname)
                .then(r => {
                    if (r.error) { return reject(this._api.throwe(__("Cannot create {0}", `${path}/${dir}`))); }
                    return this.mkdirs(list)
                        .then(() => resolve())
                        .catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        });
    }

    installFile(n, zip, files) {
        return new Promise((resolve, reject) => {
            if (files.length === 0) { return resolve(); }
            const file = (files.splice(0, 1))[0];
            const path = `${this.installdir}/${n}/${file}`;
            return zip.file(file).async("uint8array").then(d => {
                const fp = path.asFileHandle();
                fp.cache = new Blob([d], { type: "octet/stream" });
                return fp.write("text/plain")
                .then(r => {
                    if (r.error) { return reject(this._api.throwe(__("Cannot install {0}", path))); }
                    return this.installFile(n, zip, files)
                        .then(() => resolve())
                        .catch(e => reject( __e(e)));
            }).catch(e => reject(__e(e)));
        }).catch(e => reject(__e(e)));
        });
    }
}

MarketPlace.dependencies = [
    "os://scripts/jszip.min.js",
    "os://scripts/showdown.min.js"
];
MarketPlace.singleton = true;
this.OS.register("MarketPlace", MarketPlace);