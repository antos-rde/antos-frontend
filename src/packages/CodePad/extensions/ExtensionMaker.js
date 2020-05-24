(function() {
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// import the CodePad application module
const App = this.OS.APP.CodePad;

// define the extension
App.extensions.ExtensionMaker = class ExtensionMaker extends App.BaseExtension {
    constructor(app) {
        super(app);
    }

    // public functions
    create() {
        return this.app.openDialog("FileDialog", {
            title: "__(New CodePad extension at)",
            file: { basename: __("ExtensionName") },
            mimes: ["dir"]
        }).then(d => {
            return this.mktpl(d.file.path, d.name);
        });
    }
    
    buildnrun() {
        return this.metadata("extension.json").then(meta => {
            return this.build(meta).then(() => {
                return this.run(meta).catch(e => this.error(__("Unable to run extension"), e));
        }).catch(e => {
                return this.error(__("Unable to build extension"), e);
            });
    }).catch(e => this.error(__("Unable to read meta-data"), e));
    }

    release() {
        return this.metadata("extension.json").then(meta => {
            return this.build(meta).then(() => {
                return this.mkar(`${meta.root}/build/debug`,
                    `${meta.root}/build/release/${meta.meta.name}.zip`)
                    .catch(e => this.error(__("Unable to create archive"), e));
        }).catch(e => {},
                this.error(__("Unable to build extension"), e)
            );
    }).catch(e => this.error(__("Unable to read meta-data"), e));
    }

    install() {
        return this.app.openDialog("FileDialog", {
            title: "__(Select extension archive)",
            mimes: [".*/zip"]
        }).then(d => {
            return this.installZip(d.file.path)
                .then(() => {
                    this.notify(__("Extension installed"));
                    return this.app.loadExtensionMetaData();
            }).catch(e => this.error(__("Unable to install extension"), e));
        });
    }
    // private functions
    mktpl(path, name) {
        const rpath = `${path}/${name}`;
        const dirs = [
            rpath,
            `${rpath}/build`,
            `${rpath}/build/release`,
            `${rpath}/build/debug`
        ];
        const files = [
            ["templates/ext-main.tpl", `${rpath}/${name}.coffee`],
            ["templates/ext-extension.tpl", `${rpath}/extension.json`],
        ];
        return this.mkdirAll(dirs)
            .then(() => {
                return this.mkfileAll(files, path, name)
                    .then(() => {
                        this.app.currdir = rpath.asFileHandle();
                        this.app.initSideBar();
                        return this.app.openFile(`${rpath}/${name}.coffee`.asFileHandle());
                }).catch(e => this.error(__("Unable to create extension template"), e));
        }).catch(e => this.error(__("Unable to create extension directories"), e));
    }


    verify(list) {
        return new Promise((resolve, reject) => {
            if (list.length === 0) { return resolve(); }
            const file = (list.splice(0, 1))[0].asFileHandle();
            this.notify(__("Verifying: {0}", file.path));
            return file.read().then(data => {
                try {
                    CoffeeScript.nodes(data);
                    return this.verify(list)
                        .then(() => resolve())
                        .catch(e => reject(__e(e)));
                } catch (ex) {
                    return reject(__e(ex));
                }
        }).catch(e => reject(__e(e)));
        });
    }

    compile(meta) {
        return new Promise((resolve, reject) => {
            return this.import([`${this.basedir()}/coffeescript.js`]).then(() => {
                const list = (Array.from(meta.coffees).map((v) => `${meta.root}/${v}`));
                return this.verify((Array.from(list))).then(() => {
                    return this.cat(list).then(code => {
                        const jsrc = CoffeeScript.compile(code);
                        this.notify(__("Compiled successful"));
                        return resolve(jsrc);
                }).catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        }).catch(e => reject(__e(e)));
        });
    }
    
    build(meta) {
        return new Promise((resolve, reject) => {
            return this.compile(meta).then(src => {
                let v;
                return this.cat(((() => {
                    const result = [];
                    for (v of Array.from(meta.javascripts)) {                         result.push(`${meta.root}/${v}`);
                    }
                    return result;
                })()), src)
                .then(jsrc => new Promise((r, e) => `${meta.root}/build/debug/${meta.meta.name}.js`
                    .asFileHandle()
                    .setCache(jsrc)
                    .write("text/plain")
                    .then(d => r()).catch(ex => e(__e(ex))))).then(() => new Promise((r, e) => `${meta.root}/build/debug/extension.json`
                .asFileHandle()
                .setCache(meta.meta)
                .write("object")
                .then(data => r(data)).catch(ex => e(__e(ex))))).then(() => {
                    return this.copy(((() => {
                        const result1 = [];
                        for (v of Array.from(meta.copies)) {                             result1.push(`${meta.root}/${v}`);
                        }
                        return result1;
                    })()), `${meta.root}/build/debug`);
                }).then(() => resolve())
                .catch(e => reject(__e(e)));
        }).catch(e => reject(__e(e)));
        });
    }

    run(meta) {
        return new Promise((resolve, reject) => {
            const path = `${meta.root}/build/debug/${meta.meta.name}.js`;
            if (this.app._api.shared[path]) { delete this.app._api.shared[path]; }
            return this.app._api.requires(path)
                .then(() => {
                    let v;
                    if (this.app.extensions[meta.meta.name]) {
                        this.app.extensions[meta.meta.name].child = [];
                        for (v of Array.from(meta.meta.actions)) { this.app.extensions[meta.meta.name].addAction(v); }
                    } else {
                        this.app.extensions[meta.meta.name] = new App.CMDMenu(meta.meta.text);
                        this.app.extensions[meta.meta.name].name = meta.meta.name;
                        for (v of Array.from(meta.meta.actions)) { this.app.extensions[meta.meta.name].addAction(v); }
                        this.app.spotlight.addAction(this.app.extensions[meta.meta.name]);
                        this.app.extensions[meta.meta.name].onchildselect(e => {
                            return this.app.loadAndRunExtensionAction(e.data.item.get("data"));
                        });
                    }
                    this.app.spotlight.run(this.app);
                    return resolve();
            }).catch(e => reject(__e(e)));
        });
    }
    

    installExtension(files, zip) {
        return new Promise((resolve, reject) => {
            const idx = files.indexOf("extension.json");
            if (idx < 0) { reject(this.app._api.throwe(__("No meta-data found"))); }
            const metafile = (files.splice(idx, 1))[0];
            // read the meta file
            return zip.file(metafile).async("uint8array").then(d => {
                const meta = JSON.parse(new TextDecoder("utf-8").decode(d));
                return this.installFiles(files, zip, meta)
                    .then(() => resolve())
                    .catch(e => reject(__e(e)));
        }).catch(e => reject(__e(e)));
        });
    }

    installFiles(files, zip, meta) {
        if (files.length === 0) { return this.installMeta(meta); }
        return new Promise((resolve, reject) => {
            const file = (files.splice(0, 1))[0];
            const path = `${this.basedir()}/${file}`;
            return zip.file(file).async("uint8array").then(d => {
                return path.asFileHandle()
                    .setCache(new Blob([d], { type: "octet/stream" }))
                    .write("text/plain").then(r => {
                        if (r.error) { return reject(r.error); }
                        return this.installFiles(files, zip, meta)
                            .then(() => resolve())
                            .catch(e => reject(__e(e)));
                }).catch(e => reject(__e(e)));
        }).catch(e => reject(__e(e)));
        });
    }

    installMeta(meta) {
        return new Promise((resolve, reject) => {
            const file = `${this.app.meta().path}/extensions.json`.asFileHandle();
            return file.read("json").then(function(data) {
                for (let v of Array.from(data)) { const names = (v.name); }
                const idx = name.indexOf(meta.name);
                if (idx >= 0) { data.splice(idx, 1); }
                data.push(meta);
                return file.setCache(data)
                .write("object")
                    .then(() => resolve())
                    .catch(e => reject(__e(e)));}).catch(e => reject(__e(e)));
        });
    }

    installZip(path) {
        return new Promise((resolve, reject) => {
            return this.import(["os://scripts/jszip.min.js"]).then(() => {
                return path.asFileHandle().read("binary").then(data => {
                    return JSZip.loadAsync(data).then(zip => {
                        const pth = this.basedir();
                        const dir = [];
                        const files = [];
                        for (let name in zip.files) {
                            const file = zip.files[name];
                            if (file.dir) {
                                dir.push(pth + "/" + name);
                            } else {
                                files.push(name);
                            }
                        }
                        if (dir.length > 0) {
                            return this.mkdirAll(dir)
                                .then(() => {
                                    return this.installExtension(files, zip)
                                        .then(() => resolve())
                                        .catch(e)(() => reject(__e(e)));
                            }).catch(e => reject(__e(e)));
                        } else {
                            return this.installExtension(files, zip)
                                .then(() => resolve())
                                .catch(e => reject(__e(e)));
                        }
                }).catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        }).catch(e => reject(__e(e)));
        });
    }
};
}).call(this);