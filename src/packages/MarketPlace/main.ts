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
namespace OS {
    export namespace application {
        declare var showdown: any;
        declare var JSZip: any;
        export class MarketPlace extends BaseApplication {
            private installdir: string;
            private apps_meta: GenericObject<any>[];
            private repo: GUI.tag.ListViewTag;
            private applist: GUI.tag.ListViewTag;
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
                this.apps_meta = [];
                this.repo = this.find("repo") as GUI.tag.ListViewTag;
                this.repo.onlistselect = (e) => {
                    const data = e.data.item.data;
                    if (!data) {
                        return;
                    }
                    return this.fetchApps(data);
                };

                this.refreshRepoList();

                this.applist = this.find("applist") as GUI.tag.ListViewTag;
                this.applist.onlistselect = (e) => {
                    const data = e.data.item.data;
                    return this.appDetail(data);
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
                this.btexec.onbtclick = (e) => {
                    const el = this.applist.selectedItem;
                    if (!el) {
                        return;
                    }
                    const app = el.data;
                    if (app.pkgname) {
                        return this._gui.launch(app.pkgname, []);
                    }
                };

                this.btinstall.onbtclick = async () => {
                    if (this.btinstall.data.dirty) {
                        try {
                            await this.updatePackage();
                            return this.notify(__("Package updated"));
                        } catch (e) {
                            return this.error(e.toString(), e);
                        }
                    }
                    try {
                        const n = await this.remoteInstall();
                        return this.notify(__("Package installed: {0}", n));
                    } catch (e_1) {
                        return this.error(e_1.toString(), e_1);
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

                $(this.searchbox).keyup((e) => this.search(e));
            }

            refreshRepoList(): void {
                const list = Array.from(this.systemsetting.system.repositories);
                list.unshift({
                    text: "Installed",
                    url: undefined,
                });
                this.repo.data = list;
            }

            private search(e: JQuery.KeyboardEventBase) {
                let v: GenericObject<any>;
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
                        if (text.length === 2) {
                            this.applist.data = (() => {
                                const result1 = [];
                                for (v of this.apps_meta) {
                                    result1.push(v);
                                }
                                return result1;
                            })();
                        }
                        if (text.length < 3) {
                            return;
                        }
                        var result = [];
                        var term = new RegExp(text, "i");
                        for (v of this.apps_meta) {
                            if (v.text.match(term)) {
                                result.push(v);
                            }
                        }
                        this.applist.data = result;
                }
            }

            private fetchApps(data: GenericObject<any>): void {
                let v: API.PackageMetaType;
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
                            description: `${v.path}/REAME.md`,
                        });
                    }
                    this.apps_meta = list;
                    this.applist.data = list;
                    return;
                }

                this._api
                    .get(data.url + "?_=" + new Date().getTime(), "json")
                    .then((d) => {
                        for (v of d) {
                            v.text = v.name;
                            v.iconclass = "fa fa-adn";
                        }
                        this.apps_meta = d;
                        return (this.applist.data = d);
                    })
                    .catch((e) => {
                        return this.error(
                            __(
                                "Fail to fetch packages list from: {0}",
                                data.url
                            ),
                            e
                        );
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
                        .then((text) => {
                            const converter = new showdown.Converter();
                            return $(this.appdesc).html(
                                converter.makeHtml(text)
                            );
                        })
                        .catch((e) => {
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
                        const data = await this._api.blob(
                            app.download + "?_=" + new Date().getTime()
                        );
                        try {
                            const n = await this.install(data, app);
                            return resolve(n);
                        } catch (e) {
                            return reject(__e(e));
                        }
                    } catch (e_1) {
                        return reject(__e(e_1));
                    }
                });
            }

            private localInstall(): Promise<string> {
                return new Promise((resolve, reject) => {
                    return this.openDialog("FileDialog", {
                        title: "__(Select package archive)",
                        mimes: [".*/zip"],
                    }).then((d) => {
                        return d.file.path
                            .asFileHandle()
                            .read("binary")
                            .then((data: Uint8Array) => {
                                return this.install(data)
                                    .then((n) => {
                                        this.repo.unselect();
                                        this.repo.selected = 0;
                                        const apps = this.applist.data.map(
                                            (v) => v.pkgname
                                        );
                                        const idx = apps.indexOf(n);
                                        if (idx >= 0) {
                                            this.applist.selected = idx;
                                        }
                                        return resolve(n);
                                    })
                                    .catch((e: Error) => reject(__e(e)))
                                    .catch((e: Error) => reject(__e(e)));
                            })
                            .catch((e: Error) => reject(__e(e)));
                    });
                });
            }

            private install(
                data: ArrayBuffer,
                meta?: GenericObject<any>
            ): Promise<string> {
                return new Promise((resolve, reject) => {
                    return JSZip.loadAsync(data)
                        .then((zip: any) => {
                            return zip
                                .file("package.json")
                                .async("string")
                                .then((d: string) => {
                                    let name: string;
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
                                    return this.mkdirs(dir)
                                        .then(() => {
                                            return this.installFile(
                                                v.app,
                                                zip,
                                                files
                                            )
                                                .then(() => {
                                                    const app_meta = {
                                                        pkgname: v.app,
                                                        name: v.name,
                                                        text: v.name,
                                                        icon: v.icon,
                                                        iconclass: v.iconclass,
                                                        category: v.category,
                                                        author: v.info.author,
                                                        version: v.version,
                                                        description: meta
                                                            ? meta.description
                                                            : undefined,
                                                        download: meta
                                                            ? meta.download
                                                            : undefined,
                                                    };
                                                    v.text = v.name;
                                                    v.filename = v.app;
                                                    v.type = "app";
                                                    v.mime = "antos/app";
                                                    if (
                                                        !v.iconclass &&
                                                        !v.icon
                                                    ) {
                                                        v.iconclass =
                                                            "fa fa-adn";
                                                    }
                                                    v.path = pth;
                                                    this.systemsetting.system.packages[
                                                        v.app
                                                    ] = v;
                                                    this.appDetail(app_meta);
                                                    return resolve(v.name);
                                                })
                                                .catch((e) => reject(__e(e)));
                                        })
                                        .catch((e) => reject(__e(e)));
                                })
                                .catch((err: Error) => reject(__e(err)));
                        })
                        .catch((e: Error) => reject(__e(e)));
                });
            }

            private uninstall(): Promise<any> {
                return new Promise(async (resolve, reject) => {
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
                    try {
                        const d = await this.openDialog("YesNoDialog", {
                            title: __("Uninstall"),
                            text: __("Uninstall: {0}?", app.name),
                        });
                        if (!d) {
                            return;
                        }
                        try {
                            const r = await app.path
                                .asFileHandle()
                                .remove();
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
                            }
                            else {
                                this.applist.delete(el);
                                $(this.container).css("visibility", "hidden");
                            }
                            return resolve();
                        }
                        catch (e) {
                            return reject(__e(e));
                        }
                    }
                    catch (e_1) {
                        return reject(__e(e_1));
                    }
                });
            }

            private updatePackage(): Promise<any>{
                return new Promise(async (resolve, reject) => {
                    try {
                        await this.uninstall();
                        try {
                            await this.remoteInstall();
                            return resolve();
                        }
                        catch (e) {
                            return reject(__e(e));
                        }
                    }
                    catch (e_1) {
                        return reject(__e(e_1));
                    }
                });
            }

            private mkdirs(list: string[]): Promise<any> {
                return new Promise((resolve, reject) => {
                    if (list.length === 0) {
                        return resolve();
                    }
                    const dir = list.splice(0, 1)[0].asFileHandle();
                    const path = dir.parent();
                    const dname = dir.basename;
                    return path
                        .asFileHandle()
                        .mk(dname)
                        .then((r) => {
                            if (r.error) {
                                return reject(
                                    this._api.throwe(
                                        __(
                                            "Cannot create {0}",
                                            `${path}/${dir}`
                                        )
                                    )
                                );
                            }
                            return this.mkdirs(list)
                                .then(() => resolve())
                                .catch((e) => reject(__e(e)));
                        })
                        .catch((e) => reject(__e(e)));
                });
            }

            private installFile(n: string, zip: any, files: string[]): Promise<any>{
                return new Promise((resolve, reject) => {
                    if (files.length === 0) {
                        return resolve();
                    }
                    const file = files.splice(0, 1)[0];
                    const path = `${this.installdir}/${n}/${file}`;
                    return zip
                        .file(file)
                        .async("uint8array")
                        .then((d: Uint8Array) => {
                            const fp = path.asFileHandle();
                            fp.cache = new Blob([d], { type: "octet/stream" });
                            return fp
                                .write("text/plain")
                                .then((r) => {
                                    if (r.error) {
                                        return reject(
                                            this._api.throwe(
                                                __("Cannot install {0}", path)
                                            )
                                        );
                                    }
                                    return this.installFile(n, zip, files)
                                        .then(() => resolve())
                                        .catch((e) => reject(__e(e)));
                                })
                                .catch((e) => reject(__e(e)));
                        })
                        .catch((e: Error) => reject(__e(e)));
                });
            }
        }

        MarketPlace.dependencies = [
            "os://scripts/jszip.min.js",
            "os://scripts/showdown.min.js",
        ];
        MarketPlace.singleton = true;
    }
}
