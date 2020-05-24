/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
CodePad.BaseExtension = class BaseExtension {

    constructor(app) {
        this.app = app;
    }

    preload() {
        return Ant.OS.API.require(this.dependencies());
    }

    import(libs) {
        return Ant.OS.API.require(libs);
    }

    basedir() {
        return `${this.app.meta().path}/extensions`;
    }

    notify(m) {
        return this.app.notify(m);
    }
    
    error(m, e) {
        return this.app.error(m, e);
    }

    dependencies() {
        return [];
    }

    cat(list, data) {
        return new Promise((resolve, reject) => {
            if (list.length === 0) { return resolve(data); }
            const file = (list.splice(0, 1))[0].asFileHandle();
            return file
                .read()
                .then(text => {
                    data = data + "\n" + text;
                    return this.cat(list, data)
                        .then(d => resolve(d))
                        .catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        });
    }
    
    copy(files, to) {
        return new Promise((resolve, reject) => {
            if (files.length === 0) { return resolve(); }
            const file = (files.splice(0, 1))[0].asFileHandle();
            const tof = `${to}/${file.basename}`.asFileHandle();
            return file.onready().then(meta => {
                if (meta.type === "dir") {
                    // copy directory
                    const desdir = to.asFileHandle();
                    return desdir.mk(file.basename).then(() => {
                        // read the dir content
                        return file.read().then(data => {
                            const list = (Array.from(data.result).map((v) => v.path));
                            return this.copy(list, `${desdir.path}/${file.basename}`)
                                .then(() => {
                                    return this.copy(files, to)
                                        .then(() => resolve())
                                        .catch(e => reject(__e(e)));
                            }).catch(e => reject(__e(e)));
                    }).catch(e => reject(__e(e)));
                }).catch(e => reject(__e(e)));
                } else {
                    // copy file
                    return file.read("binary")
                        .then(data => {
                            return tof.setCache(new Blob([data], { type: file.info.mime }))
                                .write(file.info.mime)
                                .then(d => {
                                    return this.copy(files, to)
                                        .then(() => resolve())
                                        .catch(e => reject(__e(e)));
                            });
                    }).catch(e => reject(__e(e)));
                }
        }).catch(e => reject(__e(e)));
        });
    }

    aradd(list, zip, base) {
        return new Promise((resolve, reject) => {
            if (list.length === 0) { return resolve(zip); }
            const path = (list.splice(0, 1))[0];
            const file = path.asFileHandle();
            return file.onready().then(meta => {
                if (meta.type === "dir") {
                    return file.read().then(d => {
                        const l = (Array.from(d.result).map((v) => v.path));
                        return this.aradd(l, zip, `${base}${file.basename}/`)
                            .then(() => {
                                return this.aradd(list, zip, base)
                                    .then(() => resolve(zip))
                                    .catch(e => reject(__e(e)));
                        }).catch(e => reject(__e(e)));
                }).catch(e => reject(__e(e)));
                } else {
                    return file.read("binary").then(d => {
                        const zpath = `${base}${file.basename}`.replace(/^\/+|\/+$/g, '');
                        zip.file(zpath, d, { binary: true });
                        return this.aradd(list, zip, base)
                            .then(() => resolve(zip))
                            .catch(e => reject(__e(e)));
                }).catch(e => reject(__e(e)));
                }
        }).catch(e => reject(__e(e)));
        });
    }

    mkar(src, dest) {
        this.notify(__("Preparing for release"));
        return new Promise((resolve, reject) => {
            return new Promise((r, e) => {
                return this.import(["os://scripts/jszip.min.js"]).then(() => src.asFileHandle()
                .read().then(d => r(d.result)).catch(ex => e(__e(ex)))).catch(ex => e(__e(ex)));
        }).then(files => {
                return new Promise((r, e) => {
                    const zip = new JSZip();
                    return this.aradd((Array.from(files).map((v) => v.path)), zip, "/")
                        .then(z => r(z))
                        .catch(ex => e(__e(ex)));
                });
                    }).then(zip => {
                return zip.generateAsync({ type: "base64" }).then(data => {
                    return dest.asFileHandle()
                    .setCache('data:application/zip;base64,' + data)
                    .write("base64").then(r => {
                        return this.notify(__("Archive is generated at: {0}", dest));
                }).catch(e => reject(__e(e)));
                });
            }).catch(e => reject(__e(e)));
        });
    }
    
    mkdirAll(list) {
        return new Promise((resolve, reject) => {
            if (list.length === 0) { return resolve(); }
            const path = (list.splice(0, 1))[0].asFileHandle();
            return path.parent().mk(path.basename)
                .then(d => {
                    this.app.trigger("filechange", { file: path.parent(), type: "dir" });
                    return this.mkdirAll(list)
                        .then(() => resolve())
                        .catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        });
    }
    
    mkfileAll(list, path, name) {
        return new Promise((resolve, reject) => {
            if (list.length === 0) { return resolve(); }
            const item = (list.splice(0, 1))[0];
            return `${this.basedir()}/${item[0]}`
                .asFileHandle()
                .read()
                .then(data => {
                    const file = item[1].asFileHandle();
                    return file
                        .setCache(data.format(name, `${path}/${name}`))
                        .write("text/plain")
                        .then(() => {
                            this.app.trigger("filechange", { file, type: "file" });
                            return this.mkfileAll(list, path, name)
                                .then(() => resolve())
                                .catch(e => reject(__e(e)));
                    }).catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        });
    }

    metadata(file) {
        return new Promise((resolve, reject) => {
            if (!this.app.currdir) {
                return reject(this.app._api.throwe(__("Current folder is not found")));
            }
            return `${this.app.currdir.path}/${file}`
                .asFileHandle()
                .read("json")
                .then(data => resolve(data)).catch(e => {
                    return reject(this.app._api.throwe(__("Unable to read meta-data")));
            });
        });
    }
};

CodePad.extensions = {};