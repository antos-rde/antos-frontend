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
        declare var showdown: any;
        declare var JSZip: any;
        export class MarketPlace extends BaseApplication {
            private installdir: string;
            private apps_meta: GenericObject<any>;
            private applist: GUI.tag.ListViewTag;
            private catlist: GUI.tag.ListViewTag;
            private container: GUI.tag.VBoxTag;
            private appname: GUI.tag.LabelTag;
            private appdetail: HTMLUListElement;
            private appdesc: HTMLParagraphElement;
            private btinstall: GUI.tag.ButtonTag;
            private btremove: GUI.tag.ButtonTag;
            private btexec: GUI.tag.ButtonTag;
            private searchbox: HTMLInputElement;
            static RepoDialog: MarketPlaceRepoDialog;
            constructor(args: AppArgumentsType[]) {
                super("MarketPlace", args);
            }

            main(): void {
                this.installdir = this.systemsetting.system.pkgpaths.user;
                // test repository
                this.apps_meta = {};

                this.applist = this.find("applist") as GUI.tag.ListViewTag;
                this.catlist = this.find("catlist") as GUI.tag.ListViewTag;
                this.applist.onlistselect = (e) => {
                    const data = e.data.item.data;
                    return this.appDetail(data);
                };

                this.catlist.onlistselect = (e) => {
                    const selected = this.catlist.selected;
                    if(selected < 0)
                        return;
                    if(selected === 0)
                    {
                        return this.resetAppList();
                    }
                    const result = [];
                    if(selected === 1)
                    {
                        for(const k in this.apps_meta)
                        {
                            const pkg = this.apps_meta[k];
                            // check if update is available for this application
                            const version: Version = pkg.version.__v();
                            const name = pkg.pkgname ? pkg.pkgname: pkg.app;
                            if(name && OS.setting.system.packages[name])
                            {
                                const curr_version: Version = OS.setting.system.packages[name].version.__v();
                                if(version.compare(curr_version) === 1)
                                {
                                    result.push(pkg);
                                } 
                            }
                        }
                    }
                    else
                    {
                        // search application by category
                        const cat = this.catlist.selectedItem.data.text.__();
                        for(const k in this.apps_meta)
                        {
                            const v = this.apps_meta[k];
                            if(v.category.__() === cat)
                            {
                                result.push(v);
                            }
                        }
                    }
                    this.applist.data = result;
                };

                this.container = this.find("container") as GUI.tag.VBoxTag;
                this.appname = this.find("appname") as GUI.tag.LabelTag;
                this.appdesc = this.find("app-desc") as HTMLParagraphElement;
                this.appdetail = this.find("app-detail") as HTMLUListElement;
                this.btinstall = this.find("bt-install") as GUI.tag.ButtonTag;
                this.btremove = this.find("bt-remove") as GUI.tag.ButtonTag;
                this.btexec = this.find("bt-exec") as GUI.tag.ButtonTag;
                this.searchbox = this.find("searchbox") as HTMLInputElement;
                $(this.container).css("visibility", "hidden");
                this.btexec.onbtclick = (_e) => {
                    const el = this.applist.selectedItem;
                    if (!el) {
                        return;
                    }
                    const app = el.data;
                    if (app.app) {
                        return this._gui.launch(app.app, []);
                    }
                };

                this.btinstall.onbtclick = async () => {
                    try {
                        if (this.btinstall.data.dirty) {
                            await this.updatePackage();
                            return this.notify(__("Package updated"));
                        }
                        const n = await this.remoteInstall();
                        return this.notify(__("Package installed: {0}", n));
                    } catch (error) {
                        return this.error(error.toString(), error);
                    }
                };

                this.btremove.onbtclick = async () => {
                    try {
                        await this.uninstall();
                        return this.notify(__("Packaged uninstalled"));
                    } catch (e) {
                        return this.error(e.toString(), e);
                    }
                };

                this.bindKey("CTRL-R", () => {
                    return this.menuOptionsHandle("repos");
                });
                this.bindKey("CTRL-I", () => {
                    return this.menuOptionsHandle("install");
                });

                $(this.searchbox).keyup((e) => this.search(e));

                this.fetchApps().then((_d) => {
                    //console.log(d);
                });
            }

            private resetAppList(): void
            {
                let result = [];
                for(let k in this.apps_meta)
                {
                    result.push(this.apps_meta[k]);
                }
                this.applist.data = result.sort(
                    function (a: GenericObject<any>, b: GenericObject<any>): number {
                        if (a.text > b.text) {
                            return 1;
                        }
                        if (b.text > a.text) {
                            return -1;
                        }
                        return 0;
                    });
            }

            private search(e: JQuery.KeyboardEventBase) {
                let k: string;
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
                        this.catlist.selected = 0;
                        var text = this.searchbox.value;
                        var result = [];
                        if (text.length === 2) {
                           this.resetAppList();
                            return;
                        }
                        if (text.length < 3) {
                            return;
                        }
                        
                        var term = new RegExp(text, "i");
                        for (k in this.apps_meta) {
                            if (this.apps_meta[k].text.match(term)) {
                                result.push(this.apps_meta[k]);
                            }
                        }
                        this.applist.data = result;
                }
            }

            /**
             * Load package meta-data from remote sources
             *
             * @private
             * @param {string} url repository url
             * @return {*}  {Promise<GenericObject<any>>}
             * @memberof MarketPlace
             */
            private loadRemoteRepository(url: string): Promise<GenericObject<any>> {
                return new Promise((resolve, reject) => {
                    url.asFileHandle().read('json')
                        .then((d) => {
                            for (let v of d) {
                                v.text = `${v.name} ${v.version}`;
                                v.iconclass = "fa fa-adn";
                                v.dependBy = [];
                                if (!v.dependencies) {
                                    v.dependencies = [];
                                }
                            }
                            resolve(d);
                        })
                        .catch((e) => {
                            return this.error(
                                __(
                                    "Fail to fetch packages list from: {0}",
                                    url
                                ),
                                e
                            );
                            reject(e);
                        });
                });
            }


            /**
             * Load packages meta-data from a list of repositories
             *
             * @private
             * @param {string[]} list repositories list
             * @return {*}  {Promise<GenericObject<any>[]>} a Promise on a list of package meta-data
             * @memberof MarketPlace
             */
            private loadRemoteRepositories(list: string[]): Promise<GenericObject<any>[]> {
                return new Promise((resolve, _reject) => {
                    if (list.length == 0) {
                        let app_list = [];
                        for (let k in this.apps_meta) {
                            for (let dep of this.apps_meta[k].dependencies) {
                                if (this.apps_meta[dep]) {
                                    this.apps_meta[dep].dependBy.push(k)
                                }
                            }
                            app_list.push(this.apps_meta[k]);
                        }
                        return resolve(app_list);
                    }
                    let url = list.splice(0, 1)[0];
                    this.loadRemoteRepository(url)
                        .then((d: GenericObject<any>[]) => {
                            for (let pkg of d) {
                                // check if the package exists
                                let name = pkg.pkgname ? pkg.pkgname : pkg.app;
                                name = `${name}@${pkg.version}`;
                                if (this.apps_meta[name]) {
                                    pkg.icon = this.apps_meta[name].icon;
                                    pkg.iconclass = this.apps_meta[name].iconclass;
                                    pkg.app = this.apps_meta[name].app;
                                }
                                this.apps_meta[name] = pkg;
                            }
                            this.loadRemoteRepositories(list)
                                .then((l) => {
                                    resolve(l);
                                });
                        })
                        .catch((e) => {
                            this.error(__("Unable to load repository: {0}: {1}", url, e.toString()), e);
                            this.loadRemoteRepositories(list)
                                .then((l) => {
                                    resolve(l);
                                });
                        });
                });
            }

            buildAppCats(): void {
                let k: string, v: API.PackageMetaType;
                const catlist = new Set();
                for (k in this.apps_meta) {
                    v = this.apps_meta[k];
                    if (v) {
                        catlist.add(v.category.__());
                    }
                }
                // build up the category menu
                const cat_list_data = [];
                cat_list_data.push({
                    text: "__(All)",
                    iconclass: "bi bi-gear-wide"
                });
                cat_list_data.push({
                    text: "__(Update)",
                    iconclass: "bi bi-cloud-arrow-down-fill"
                });
                (OS.setting.applications.categories as Array<GenericObject<any>>)
                    .forEach((v) =>{
                        if(catlist.has(v.text.__()))
                        {
                            cat_list_data.push({text: v.text, iconclass: v.iconclass});
                            catlist.delete(v.text.__());
                        }
                    })
                // put the remainder to the data
                catlist.forEach((c) => {
                    cat_list_data.push({
                        text: c,
                        iconclass: "bi bi-gear-wide"
                    });
                });
                this.catlist.data = cat_list_data;
                this.catlist.selected = 0;
            }
            private add_meta_from(k:string, v: API.PackageMetaType)
            {
                const mt = {
                    pkgname: v.pkgname ? v.pkgname : v.app,
                    app: v.app,
                    name: v.name,
                    text: `${v.name} ${v.version}`,
                    icon: v.icon,
                    iconclass: v.iconclass,
                    category: v.category,
                    author: v.info.author,
                    version: v.version,
                    description: `${v.path}/README.md`,
                    dependencies: v.dependencies ? Array.from(v.dependencies) : [],
                    dependBy: []
                };
                this.apps_meta[`${k}@${v.version}`] = mt;
                return mt;
            }
            fetchApps(): Promise<GenericObject<any>> {
                return new Promise((resolve, _reject) => {
                    let v: API.PackageMetaType;
                    this.apps_meta = {};
                    const pkgcache = this.systemsetting.system.packages;
                    for (let k in pkgcache) {
                        v = pkgcache[k];
                        this.add_meta_from(k,v);
                    }

                    const list: string[] = []
                    for (let d of Array.from(this.systemsetting.system.repositories)) {
                        list.push(d.url);
                    }
                    this.loadRemoteRepositories(list)
                        .then((apps_list) => {
                            this.buildAppCats();
                            resolve(this.apps_meta);
                        });
                });
            }

            private appDetail(d: GenericObject<any>): void {
                $(this.container).css("visibility", "visible");
                this.appname.text = d.name;
                const status = this.find("vstat") as GUI.tag.LabelTag;
                status.text = "";
                if (d.description) {
                    d.description
                        .asFileHandle()
                        .read()
                        .then((text: string) => {
                            const converter = new showdown.Converter();
                            return $(this.appdesc).html(
                                converter.makeHtml(text)
                            );
                        })
                        .catch((_e) => {
                            this.notify(
                                __("Unable to read package description")
                            );
                            return $(this.appdesc).empty();
                        });
                } else {
                    $(this.appdesc).empty();
                }
                const pkgcache = this.systemsetting.system.packages;
                this.btinstall.text = "__(Install)";
                this.btinstall.data = { dirty: false };
                if (pkgcache[d.pkgname]) {
                    let vs: Version, ovs: Version;
                    if (pkgcache[d.pkgname].version)
                        vs = pkgcache[d.pkgname].version.__v();
                    if (d.version) ovs = d.version.__v();
                    $(this.btinstall).hide();
                    if (vs && ovs) {
                        if (ovs.nt(vs)) {
                            this.btinstall.data = { dirty: true };
                            this.btinstall.text = "__(Update)";
                            $(this.btinstall).show();
                            status.text = __(
                                "Your application version is older ({0} < {1})",
                                vs,
                                ovs
                            );
                        }
                    }
                    $(this.btremove).show();
                    $(this.btexec).show();
                } else {
                    $(this.btinstall).show();
                    $(this.btremove).hide();
                    $(this.btexec).hide();
                }

                $(this.appdetail).empty();
                for (let k in d) {
                    const v = d[k];
                    if (k !== "name" && k !== "description" && k !== "domel") {
                        $(this.appdetail).append(
                            $("<li>")
                                .append(
                                    $("<span class= 'info-header'>").html(k)
                                )
                                .append($("<span>").html(v))
                        );
                    }
                }
            }

            protected menu(): GUI.BasicItemType[] {
                return [
                    {
                        text: "__(Options)",
                        nodes: [
                            {
                                text: "__(Repositories)",
                                shortcut: "C-R",
                                id: "repos",
                            },
                            {
                                text: "__(Install from zip)",
                                shortcut: "C-I",
                                id: "install",
                            },
                        ],
                        onchildselect: (
                            e: GUI.TagEventType<GUI.tag.MenuEventData>
                        ) => {
                            return this.menuOptionsHandle(e.data.item.data.id);
                        },
                    },
                ];
            }

            private menuOptionsHandle(id: string): void {
                switch (id) {
                    case "repos":
                        this.openDialog(new MarketPlace.RepoDialog(), {
                            title: __("Repositories"),
                            data: this.systemsetting.system.repositories,
                        });
                        break;

                    case "install":
                        this.localInstall()
                            .then((n) => {
                                return this.notify(
                                    __("Package installed: {0}", n)
                                );
                            })
                            .catch((e) =>
                                this.error(__("Unable to install package"), e)
                            );
                        break;
                    default:
                }
            }
            private checkDependencies(pkgname: string, is_uninstall: boolean = false): GenericObject<Set<string>> {
                let dep_list = {
                    install: new Set<string>(),
                    uninstall: new Set<string>(),
                    notfound: new Set<string>()
                };
                let meta = this.apps_meta[pkgname];
                if (!meta) {
                    this.error(__("Invalid package name: {0}", pkgname));
                    return dep_list;
                }
                let installed_pkgs = this.systemsetting.system.packages;
                const list = is_uninstall ? meta.dependBy : meta.dependencies;
                list.push(pkgname);

                for (let k in list) {
                    const arr: string[] = list[k].split("@");
                    if (is_uninstall) {
                        // dependencies for uninstall
                        if (installed_pkgs[arr[0]]) {
                            let name = `${arr[0]}@${installed_pkgs[arr[0]].version}`;
                            dep_list.uninstall.add(name);
                            if (list[k] != pkgname) {
                                let subdep = this.checkDependencies(name, true);
                                dep_list.uninstall = new Set([...dep_list.uninstall, ...subdep.uninstall]);
                            }
                        }
                    }
                    else {
                        // dependencies for install
                        let need_install: boolean = true;
                        if (installed_pkgs[arr[0]]) {
                            let name = `${arr[0]}@${installed_pkgs[arr[0]].version}`;
                            // check version
                            if (installed_pkgs[arr[0]].version.__v().compare(arr[1].__v()) != 0) {
                                // this package is to be uninstalled
                                dep_list.uninstall.add(name);
                                let subdep = this.checkDependencies(name, true);
                                dep_list.uninstall = new Set([...dep_list.uninstall, ...subdep.uninstall]);
                                need_install = true;
                            }
                            else {
                                need_install = false;
                            }
                        }
                        if (need_install) {
                            if (this.apps_meta[list[k]]) {
                                // new package should be installed
                                dep_list.install.add(list[k]);
                                if (list[k] != pkgname) {
                                    let subdep = this.checkDependencies(list[k], false);
                                    dep_list.uninstall = new Set([...dep_list.uninstall, ...subdep.uninstall]);
                                    dep_list.notfound = new Set([...dep_list.notfound, ...subdep.notfound]);
                                    dep_list.install = new Set([...dep_list.install, ...subdep.install]);
                                }
                            }
                            else {
                                // not found
                                dep_list.notfound.add(meta.dependencies[k]);
                            }
                        }
                    }
                }
                return dep_list;
            }
            private installPkg(pkgname: string): Promise<string> {
                return new Promise(async (resolve, reject) => {
                    const meta = this.apps_meta[pkgname];
                    if (!meta || !meta.download) {
                        return reject(this._api.throwe(__("Unable to find package: {0}", pkgname)));
                    }
                    try {
                        const mt = await this.install(meta.download + "?_=" + new Date().getTime(), meta);
                        meta.app = mt.app;
                        return resolve(meta);
                    } catch (e_1) {
                        return reject(__e(e_1));
                    }
                });
            }
            private bulkInstall(list: string[]): Promise<any> {
                const promises = [];
                for (let pkgname of list) {
                    promises.push(this.installPkg(pkgname));
                }
                return Promise.all(promises);
            }
            private remoteInstall(): Promise<string> {
                const el = this.applist.selectedItem;
                if (!el) {
                    return;
                }
                const app = el.data;
                if (!app) {
                    return;
                }
                // get blob file
                return new Promise(async (resolve, reject) => {
                    try {
                        let pkgname = `${el.data.pkgname}@${el.data.version}`;
                        const dep = this.checkDependencies(pkgname);
                        if (dep.notfound.size != 0) {
                            this.openDialog("TextDialog", {
                                disable: true,
                                title: __("Unresolved dependencies"),
                                value: __(
                                    "Unable to install: The package `{0}` depends on these packages, but they are not found:\n{1}",
                                    pkgname,
                                    [...dep.notfound].join("\n")
                                )
                            });
                            return reject(__("Unresolved dependencies on: {0}", pkgname));
                        }
                        const t = await this.openDialog("TextDialog", {
                            title: __("Confirm install"),
                            disable: true,
                            value: __(
                                "Please confirm the following operation:\n\n{0} packages will be removed:\n\n{1}\n\n{2} packages will be installed:\n\n{3}",
                                dep.uninstall.size.toString(),
                                [...dep.uninstall].join("\n"),
                                dep.install.size.toString(),
                                [...dep.install].join("\n")
                            )
                        });
                        if (!t) return;
                        await this.bulkUninstall([...dep.uninstall]);
                        const metas = await this.bulkInstall([...dep.install]);
                        this.appDetail(metas.pop());
                        resolve(pkgname);
                    } catch (error) {
                        reject(__e(error));
                    }
                });
            }

            private localInstall(): Promise<string> {
                return new Promise(async (resolve, reject) => {
                    try {
                        const d = await this.openDialog("FileDialog", {
                            title: "__(Select package archive)",
                            mimes: [".*/zip"],
                        });
                        const n = await this.install(d.file.path);
                        const name = n.pkgname?n.pkgname:n.app;
                        const apps = this.applist.data.map(
                            (v) => v.pkgname
                        );
                        const idx = apps.indexOf(name);
                        if (idx >= 0) {
                            this.applist.selected = idx;
                        }
                        else
                        {
                            const mt = this.add_meta_from(name,n);
                            this.appDetail(mt);
                        }
                        return resolve(n.name);
                    } catch (error) {
                        reject(__e(error));
                    }
                });
            }

            private install(
                zfile: string,
                meta?: GenericObject<any>
            ): Promise<API.PackageMetaType> {
                return new Promise(async (resolve, reject) => {
                    try {
                        let v: API.PackageMetaType;
                        let pth: string = "";
                        await API.VFS.extractZip(zfile, (zip) => {
                            return new Promise(async (res, rej) => {
                                try {
                                    const d = await zip.file("package.json").async("string");
                                    v = JSON.parse(d);
                                    pth = `${this.installdir}/${v.pkgname ? v.pkgname : v.app}`;
                                    await API.VFS.mkdirAll([pth]);
                                    res(pth);
                                } catch (error) {
                                    rej(__e(error))
                                }
                            });

                        });
                        v.text = v.name;
                        v.filename = v.pkgname ? v.pkgname : v.app;
                        v.type = "app";
                        v.mime = "antos/app";
                        if (
                            !v.iconclass &&
                            !v.icon
                        ) {
                            v.iconclass =
                                "fa fa-adn";
                        }
                        if(v.icon)
                        {
                            v.icon = `${pth}/${v.icon}`;
                        }
                        v.path = pth;
                        this.systemsetting.system.packages[
                            v.pkgname ? v.pkgname : v.app
                        ] = v;
                        return resolve(v);
                    } catch (error) {
                        reject(__e(error));
                    }
                });
            }
            private bulkUninstall(list: string[]): Promise<any> {
                const promises = [];
                for (let pkgname of list) {
                    promises.push(this.uninstallPkg(pkgname));
                }
                return Promise.all(promises);
            }
            private uninstallPkg(pkgname: string): Promise<any> {
                return new Promise(async (resolve, reject) => {
                    const meta = this.apps_meta[pkgname];
                    
                    // got the app meta
                    try {
                        if (!meta) {
                            throw __("Unable to find application meta-data: {0}", pkgname).__();
                        }
                        const app = this.systemsetting.system.packages[meta.pkgname];
                        if (!app) {
                            throw __("Application {0} is not installed", pkgname).__();
                        }
                        const r = await app.path
                            .asFileHandle()
                            .remove();
                        if (r.error) {
                            throw __("Cannot uninstall package: {0}", r.error).__();
                        }
                        this.notify(__("Package uninstalled"));
                        // stop all the services if any
                        if (app.services) {
                            for (let srv of Array.from(app.services)) {
                                this._gui.unloadApp(srv);
                            }
                        }
                        delete this.systemsetting.system.packages[meta.pkgname];
                        this._gui.unloadApp(meta.pkgname, true);
                        if (meta.download) {
                            this.appDetail(meta);
                        }
                        else {
                            if (meta.domel)
                                this.applist.delete(meta.domel);
                            $(this.container).css("visibility", "hidden");
                            delete this.apps_meta[pkgname];
                        }
                        return resolve(meta);
                    }
                    catch (e) {
                        return reject(__e(e));
                    }
                });
            }
            private uninstall(): Promise<any> {
                return new Promise(async (_resolve, reject) => {
                    const el = this.applist.selectedItem;
                    if (!el) {
                        return;
                    }
                    const sel = el.data;
                    if (!sel) {
                        return;
                    }
                    const name = sel.pkgname;
                    const app = this.systemsetting.system.packages[sel.pkgname];
                    if (!app) {
                        return;
                    }
                    const pkgname = `${sel.pkgname}@${app.version}`;
                    const dep = this.checkDependencies(pkgname, true);
                    try {
                        const d = await this.openDialog("TextDialog", {
                            title: __("Uninstall"),
                            disable: true,
                            value: __("{0} Packages to be Uninstalled:\n\n{1}", dep.uninstall.size, [...dep.uninstall].join("\n")),
                        });
                        if (!d) {
                            return;
                        }
                        this.bulkUninstall([...dep.uninstall])
                            .then((_b) => {
                                this.notify(__("Uninstall successfully"));
                            })
                            .catch((err) => {
                                this.error(__("Unable to uninstall package(s): {0}", err.toString()), err);
                            });
                    }
                    catch (e_1) {
                        return reject(__e(e_1));
                    }
                });
            }

            private updatePackage(): Promise<any> {
                return new Promise(async (resolve, reject) => {
                    try {
                        const el = this.applist.selectedItem;
                        if (!el) {
                            return;
                        }
                        const sel = el.data;
                        if (!sel) {
                            return;
                        }
                        const name = sel.pkgname;
                        const app = this.systemsetting.system.packages[sel.pkgname];
                        if (!app) {
                            return;
                        }
                        const meta = this.apps_meta[`${sel.pkgname}@${app.version}`];
                        await this.remoteInstall();
                        if (meta) {
                            if (meta.domel)
                                this.applist.delete(meta.domel);
                        }
                        return resolve(true);
                    }
                    catch (e_1) {
                        return reject(__e(e_1));
                    }
                });
            }
        }

        MarketPlace.dependencies = [
            "os://scripts/showdown.min.js",
        ];
        MarketPlace.singleton = true;
    }
}
