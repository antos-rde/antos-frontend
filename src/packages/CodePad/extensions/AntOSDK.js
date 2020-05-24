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
App.extensions.AntOSDK = class AntOSDK extends App.BaseExtension {
    constructor(app) {
        super(app);
    }

    // public functions
    create() {
        return this.app.openDialog("FileDialog", {
            title: "__(New Project at)",
            file: { basename: __("ProjectName") },
            mimes: ["dir"]
        }).then(d => {
            return this.mktpl(d.file.path, d.name, true);
        });
    }
    
    init() {
        const dir = this.app.currdir;
        if (!dir || !dir.basename) { return this.create(); }
        return dir.read()
            .then(d => {
                if (d.error) { return this.notify(__("Cannot read folder: {0}", dir.path)); }
                if (d.result.length !== 0) { return this.notify(__("The folder is not empty: {0}", dir.path)); }
                return this.mktpl(dir.parent().path, dir.basename);
        });
    }
    
    buildnrun() {
        return this.metadata("project.json").then(meta => {
            return this.build(meta, true).then(() => {
                return this.run(meta).catch(e => this.error(__("Unable to run project"), e));
        }).catch(e => {
                return this.error(__("Unable to build project"), e);
            });
    }).catch(e => this.error(__("Unable to read meta-data"), e));
    }

    release() {
        return this.metadata("project.json").then(meta => {
            return this.build(meta, false).then(() => {
                return this.mkar(`${meta.root}/build/debug`, `${meta.root}/build/release/${meta.name}.zip`)
                    .catch(e => this.error(__("Unable to create package archive"), e));
        }).catch(e => {},
                this.error(__("Unable to build project"), e)
            );
    }).catch(e => this.error(__("Unable to read meta-data"), e));
    }


    // private functions
    mktpl(path, name, flag) {
        const rpath = `${path}/${name}`;
        const dirs = [
            `${rpath}/javascripts`,
            `${rpath}/css`,
            `${rpath}/coffees`,
            `${rpath}/assets`
        ];
        if (flag) { dirs.unshift(rpath); }
        const files = [
            ["templates/sdk-main.tpl", `${rpath}/coffees/main.coffee`],
            ["templates/sdk-package.tpl", `${rpath}/package.json`],
            ["templates/sdk-project.tpl", `${rpath}/project.json`],
            ["templates/sdk-README.tpl", `${rpath}/README.md`],
            ["templates/sdk-scheme.tpl", `${rpath}/assets/scheme.html`]
        ];
        return this.mkdirAll(dirs)
            .then(() => {
                return this.mkfileAll(files, path, name)
                    .then(() => {
                        this.app.currdir = rpath.asFileHandle();
                        this.app.initSideBar();
                        return this.app.openFile(`${rpath}/README.md`.asFileHandle());
                }).catch(e => this.error(__("Unable to create template files"), e));
        }).catch(e => this.error(__("Unable to create project directory"), e));
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
            return this.import([
                `${this.basedir()}/coffeescript.js`,
                `${this.basedir()}/terser.min.js`
            ]).then(() => {
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
    
    build(meta, debug) {
        const dirs = [
            `${meta.root}/build`,
            `${meta.root}/build/debug`,
            `${meta.root}/build/release`
        ];
        return new Promise((resolve, reject) => {
            return this.mkdirAll(dirs).then(() => {
                return this.compile(meta).then(src => {
                    let v;
                    return this.cat(((() => {
                        const result = [];
                        for (v of Array.from(meta.javascripts)) {                             result.push(`${meta.root}/${v}`);
                        }
                        return result;
                    })()), src)
                    .then(jsrc => new Promise(function(r, e) {
                        let code = jsrc;
                        if (!debug) {
                            const options = {
                                toplevel: true,
                                compress: {
                                    passes: 3,
                                    //pure_getters: true,
                                    //unsafe: true,
                                },
                                mangle: true,
                                output: {
                                    //beautify: true,
                                },
                            };
                            const result = Terser.minify(jsrc, options);
                            if (result.error) {
                                this.notify(__("Unable to minify code: {0}", result.error));
                            } else {
                                ({
                                    code
                                } = result);
                            }
                        }
                        return `${meta.root}/build/debug/main.js`
                            .asFileHandle()
                            .setCache(code)
                            .write("text/plain")
                            .then(d => r()).catch(ex => e(__e(ex)));
                    })).then(() => {
                        return new Promise((r, e) => {
                            return this.cat(((() => {
                                const result1 = [];
                                for (v of Array.from(meta.css)) {                                     result1.push(`${meta.root}/${v}`);
                                }
                                return result1;
                            })()), "")
                            .then(function(txt) {
                                if (txt === "") { return r(); }
                                return `${meta.root}/build/debug/main.css`
                                .asFileHandle()
                                .setCache(txt)
                                .write("text/plain")
                                .then(d => r()).catch(ex => e(__e(ex)));
                            });
                        });
                    }).then(() => {
                        return this.copy(((() => {
                            const result1 = [];
                            for (v of Array.from(meta.copies)) {                                 result1.push(`${meta.root}/${v}`);
                            }
                            return result1;
                        })()), `${meta.root}/build/debug`);
                    }).then(() => resolve())
                    .catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        }).catch(e => reject(__e(e)));
        });
    }

    run(meta) {
        return `${meta.root}/build/debug/package.json`
            .asFileHandle()
            .read("json")
            .then(v => {
                v.text = v.name;
                v.path = `${meta.root}/build/debug`;
                v.filename = meta.name;
                v.type = "app";
                v.mime = "antos/app";
                if (v.icon) { v.icon = `${v.path}/${v.icon}`; }
                if (!v.iconclass && !v.icon) { v.iconclass = "fa fa-adn"; }
                this.notify(__("Installing..."));
                this.app.systemsetting.system.packages[meta.name] = v;
                this.notify(__("Running {0}...", meta.name));
                return this.app._gui.forceLaunch(meta.name);
        });
    }
};
}).call(this);